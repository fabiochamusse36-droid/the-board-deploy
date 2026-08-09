import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { fail, ok, reference } from "../../shared/http.js";

const submitAdmissionSchema = z.object({
  reservationReference: z
    .string()
    .trim()
    .min(4)
    .max(40),

  fullName: z
    .string()
    .trim()
    .min(2)
    .max(120),

  email: z
    .string()
    .trim()
    .email()
    .max(255),

  phone: z
    .string()
    .trim()
    .min(6)
    .max(30),

  profileType: z
    .string()
    .trim()
    .min(2)
    .max(80),

  company: z
    .string()
    .trim()
    .max(120)
    .optional(),

  role: z
    .string()
    .trim()
    .max(120)
    .optional(),

  investmentExperience: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  motivation: z
    .string()
    .trim()
    .max(1500)
    .optional(),
});

function admissionCanBeSubmitted(reservation: {
  paymentStatus: string;
  admissionStatus: string;
}) {
  if (
    reservation.paymentStatus !==
    "payment_confirmed"
  ) {
    return false;
  }

  return [
    "admission_locked",
    "admission_form_available",
    "admission_unlocked",
    "admission_pending",
    "admission_form_locked",
  ].includes(
    reservation.admissionStatus,
  );
}

export async function admissionRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/api/admissions/access/:reference",
    async (request, reply) => {
      const params = z
        .object({
          reference: z
            .string()
            .trim()
            .min(4)
            .max(40),
        })
        .parse(request.params);

      const reservation =
        await prisma.reservation.findUnique({
          where: {
            reference:
              params.reference,
          },

          include: {
            admissions: {
              orderBy: {
                submittedAt: "desc",
              },

              take: 1,

              select: {
                reference: true,
                status: true,
                submittedAt: true,
              },
            },
          },
        });

      if (!reservation) {
        return fail(
          reply,
          "Reserva não encontrada",
          404,
          "reservation_not_found",
        );
      }

      const existingAdmission =
        reservation.admissions[0] ??
        null;

      return ok(reply, {
        reference:
          reservation.reference,

        paymentStatus:
          reservation.paymentStatus,

        admissionStatus:
          reservation.admissionStatus,

        admissionAvailable:
          reservation.paymentStatus ===
            "payment_confirmed" &&
          !existingAdmission,

        existingAdmission,
      });
    },
  );

  app.post(
    "/api/admissions",
    async (request, reply) => {
      const input =
        submitAdmissionSchema.parse(
          request.body,
        );

      const reservation =
        await prisma.reservation.findUnique({
          where: {
            reference:
              input.reservationReference,
          },

          include: {
            admissions: {
              orderBy: {
                submittedAt: "desc",
              },

              take: 1,

              select: {
                id: true,
                reference: true,
                status: true,
                submittedAt: true,
              },
            },
          },
        });

      if (!reservation) {
        return fail(
          reply,
          "Reserva não encontrada",
          404,
          "reservation_not_found",
        );
      }

      if (
        reservation.paymentStatus !==
        "payment_confirmed"
      ) {
        return fail(
          reply,
          "Admissão bloqueada até confirmação do pagamento",
          403,
          "admission_locked",
        );
      }

      const existingAdmission =
        reservation.admissions[0] ??
        null;

      if (existingAdmission) {
        return fail(
          reply,
          "Esta reserva já tem uma admissão submetida",
          409,
          "admission_already_submitted",
        );
      }

      if (
        !admissionCanBeSubmitted(
          reservation,
        )
      ) {
        return fail(
          reply,
          "Admissão indisponível para o estado atual da reserva",
          409,
          "admission_not_available",
        );
      }

      const admission =
        await prisma.$transaction(
          async (
            tx: Prisma.TransactionClient,
          ) => {
            const created =
              await tx.admission.create({
                data: {
                  reference:
                    reference("ADM"),

                  reservationId:
                    reservation.id,

                  fullName:
                    input.fullName,

                  email:
                    input.email,

                  phone:
                    input.phone,

                  profileType:
                    input.profileType,

                  company:
                    input.company,

                  role:
                    input.role,

                  investmentExperience:
                    input.investmentExperience,

                  motivation:
                    input.motivation,

                  status:
                    "admission_under_review",
                },
              });

            await tx.reservation.update({
              where: {
                id: reservation.id,
              },

              data: {
                admissionStatus:
                  "admission_under_review",
              },
            });

            return created;
          },
        );

      return ok(
        reply,
        admission,
        201,
      );
    },
  );
}
