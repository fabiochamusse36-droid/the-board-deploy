import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { fail, ok, reference } from "../../shared/http.js";

const submitAdmissionSchema = z.object({
  reservationReference: z.string().min(4),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
  profileType: z.string().trim().min(2).max(80),
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  investmentExperience: z.string().trim().optional(),
  motivation: z.string().trim().optional(),
});

export async function admissionRoutes(app: FastifyInstance) {
  app.get("/api/admissions/access/:reference", async (request, reply) => {
    const params = z.object({ reference: z.string().min(4) }).parse(request.params);
    const reservation = await prisma.reservation.findUnique({ where: { reference: params.reference } });

    if (!reservation) return fail(reply, "Reserva não encontrada", 404, "reservation_not_found");

    return ok(reply, {
      reference: reservation.reference,
      paymentStatus: reservation.paymentStatus,
      admissionStatus: reservation.admissionStatus,
      admissionAvailable: reservation.paymentStatus === "payment_confirmed",
    });
  });

  app.post("/api/admissions", async (request, reply) => {
    const input = submitAdmissionSchema.parse(request.body);
    const reservation = await prisma.reservation.findUnique({ where: { reference: input.reservationReference } });

    if (!reservation) return fail(reply, "Reserva não encontrada", 404, "reservation_not_found");
    if (reservation.paymentStatus !== "payment_confirmed") return fail(reply, "Admissão bloqueada até confirmação do pagamento", 403, "admission_locked");

    const admission = await prisma.admission.create({
      data: {
        reference: reference("ADM"),
        reservationId: reservation.id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        profileType: input.profileType,
        company: input.company,
        role: input.role,
        investmentExperience: input.investmentExperience,
        motivation: input.motivation,
        status: "admission_under_review",
      },
    });

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { admissionStatus: "admission_under_review" },
    });

    return ok(reply, admission, 201);
  });
}
