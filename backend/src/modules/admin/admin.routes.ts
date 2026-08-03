import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { requirePermission } from "../../shared/auth-context.js";
import { fail, ok, reference } from "../../shared/http.js";
import {
  admissionTransitions,
  canTransitionFrom,
  credentialTransitions,
  sponsorTransitions,
} from "../../shared/state-machine.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const admissionReviewParamsSchema = z.object({
  reference: z.string().trim().min(4).max(80),
});

const admissionReviewBodySchema = z.object({
  status: z.enum(["admission_under_review", "admission_approved", "admission_rejected"]),
  reviewNotes: z.string().trim().max(2000).optional(),
});

const sponsorStatusParamsSchema = z.object({
  reference: z.string().trim().min(4).max(80),
});

const sponsorStatusBodySchema = z.object({
  status: z.enum([
    "sponsor_inquiry_received",
    "sponsor_under_review",
    "sponsor_qualified",
    "dossier_pending",
    "dossier_sent",
    "proposal_sent",
    "negotiation",
    "approved",
    "rejected",
    "closed_won",
    "closed_lost",
  ]),
  dossierStatus: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
});

const issueCredentialBodySchema = z.object({
  reservationReference: z.string().trim().min(4).max(80),
  participantName: z.string().trim().min(2).max(160).optional(),
  ticketName: z.string().trim().min(2).max(160).optional(),
});

const credentialStatusParamsSchema = z.object({
  code: z.string().trim().min(4).max(80),
});

const credentialStatusBodySchema = z.object({
  status: z.enum(["credential_ready", "credential_issued", "credential_blocked"]),
  notes: z.string().trim().max(2000).optional(),
});

function pagination(query: z.infer<typeof listQuerySchema>) {
  return {
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  };
}

export async function adminRoutes(app: FastifyInstance) {
  app.get("/api/admin/reservations", async (request, reply) => {
    const auth = await requirePermission(request, reply, "reservations.read");
    if (!auth) return;

    const query = listQuerySchema.parse(request.query);
    const { skip, take } = pagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.reservation.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
          admissions: { orderBy: { submittedAt: "desc" }, take: 1 },
          credentials: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      }),
      prisma.reservation.count(),
    ]);

    return ok(reply, { items, total, page: query.page, pageSize: query.pageSize });
  });

  app.get("/api/admin/admissions", async (request, reply) => {
    const auth = await requirePermission(request, reply, "admissions.read");
    if (!auth) return;

    const query = listQuerySchema.parse(request.query);
    const { skip, take } = pagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.admission.findMany({
        skip,
        take,
        orderBy: { submittedAt: "desc" },
        include: { reservation: true },
      }),
      prisma.admission.count(),
    ]);

    return ok(reply, { items, total, page: query.page, pageSize: query.pageSize });
  });

  app.patch("/api/admin/admissions/:reference/review", async (request, reply) => {
    const auth = await requirePermission(request, reply, "admissions.review");
    if (!auth) return;

    const params = admissionReviewParamsSchema.parse(request.params);
    const body = admissionReviewBodySchema.parse(request.body);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const admission = await tx.admission.findUnique({
        where: { reference: params.reference },
        include: { reservation: true },
      });

      if (!admission) return { type: "not_found" as const };

      if (!canTransitionFrom(admissionTransitions, admission.status, body.status)) {
        return {
          type: "invalid_transition" as const,
          currentStatus: admission.status,
          nextStatus: body.status,
        };
      }

      const nextAdmission = await tx.admission.update({
        where: { reference: params.reference },
        data: {
          status: body.status,
          reviewNotes: body.reviewNotes,
          reviewedAt: new Date(),
        },
        include: { reservation: true },
      });

      await tx.reservation.update({
        where: { id: admission.reservationId },
        data: { admissionStatus: body.status },
      });

      await tx.auditLog.create({
        data: {
          actorId: auth.sub,
          actorEmail: auth.email,
          action: "admission.review",
          targetType: "admission",
          targetRef: admission.reference,
          previousState: admission.status,
          nextState: body.status,
          metadata: {
            reservationReference: admission.reservation.reference,
            reviewNotes: body.reviewNotes ?? null,
          },
        },
      });

      return { type: "updated" as const, admission: nextAdmission };
    });

    if (result.type === "not_found") return fail(reply, "Admissão não encontrada.", 404, "admission_not_found");
    if (result.type === "invalid_transition") {
      return fail(
        reply,
        `Transição de admissão inválida: ${result.currentStatus} → ${result.nextStatus}.`,
        409,
        "invalid_transition",
      );
    }

    return ok(reply, result.admission);
  });

  app.get("/api/admin/sponsors", async (request, reply) => {
    const auth = await requirePermission(request, reply, "sponsors.read");
    if (!auth) return;

    const query = listQuerySchema.parse(request.query);
    const { skip, take } = pagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.sponsorInquiry.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.sponsorInquiry.count(),
    ]);

    return ok(reply, { items, total, page: query.page, pageSize: query.pageSize });
  });

  app.patch("/api/admin/sponsors/:reference/status", async (request, reply) => {
    const auth = await requirePermission(request, reply, "sponsors.update");
    if (!auth) return;

    const params = sponsorStatusParamsSchema.parse(request.params);
    const body = sponsorStatusBodySchema.parse(request.body);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const inquiry = await tx.sponsorInquiry.findUnique({ where: { reference: params.reference } });
      if (!inquiry) return { type: "not_found" as const };

      if (!canTransitionFrom(sponsorTransitions, inquiry.status, body.status)) {
        return {
          type: "invalid_transition" as const,
          currentStatus: inquiry.status,
          nextStatus: body.status,
        };
      }

      const nextInquiry = await tx.sponsorInquiry.update({
        where: { reference: params.reference },
        data: {
          status: body.status,
          dossierStatus: body.dossierStatus ?? inquiry.dossierStatus,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: auth.sub,
          actorEmail: auth.email,
          action: "sponsor.status.update",
          targetType: "sponsor_inquiry",
          targetRef: inquiry.reference,
          previousState: inquiry.status,
          nextState: body.status,
          metadata: {
            company: inquiry.company,
            dossierStatus: body.dossierStatus ?? inquiry.dossierStatus,
            notes: body.notes ?? null,
          },
        },
      });

      return { type: "updated" as const, inquiry: nextInquiry };
    });

    if (result.type === "not_found") return fail(reply, "Pedido de patrocínio não encontrado.", 404, "sponsor_not_found");
    if (result.type === "invalid_transition") {
      return fail(
        reply,
        `Transição de patrocínio inválida: ${result.currentStatus} → ${result.nextStatus}.`,
        409,
        "invalid_transition",
      );
    }

    return ok(reply, result.inquiry);
  });

  app.get("/api/admin/payments", async (request, reply) => {
    const auth = await requirePermission(request, reply, "payments.read");
    if (!auth) return;

    const query = listQuerySchema.parse(request.query);
    const { skip, take } = pagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.payment.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { reservation: true },
      }),
      prisma.payment.count(),
    ]);

    return ok(reply, { items, total, page: query.page, pageSize: query.pageSize });
  });

  app.post("/api/admin/credentials/issue", async (request, reply) => {
    const auth = await requirePermission(request, reply, "credentials.issue");
    if (!auth) return;

    const body = issueCredentialBodySchema.parse(request.body);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const reservation = await tx.reservation.findUnique({
        where: { reference: body.reservationReference },
        include: { credentials: true, admissions: { orderBy: { submittedAt: "desc" }, take: 1 } },
      });

      if (!reservation) return { type: "not_found" as const };

      if (reservation.admissionStatus !== "admission_approved") {
        return {
          type: "admission_not_approved" as const,
          currentStatus: reservation.admissionStatus,
        };
      }

      const existing = reservation.credentials[0];
      if (existing) {
        return {
          type: "duplicate" as const,
          credential: existing,
        };
      }

      const participantName = body.participantName ?? reservation.admissions[0]?.fullName ?? reservation.buyerName;
      const ticketName = body.ticketName ?? reservation.ticketName;

      const credential = await tx.credential.create({
        data: {
          credentialCode: reference("CRD"),
          reservationId: reservation.id,
          participantName,
          ticketName,
          status: "credential_issued",
        },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { admissionStatus: "credential_issued" },
      });

      await tx.auditLog.create({
        data: {
          actorId: auth.sub,
          actorEmail: auth.email,
          action: "credential.issue",
          targetType: "credential",
          targetRef: credential.credentialCode,
          previousState: null,
          nextState: credential.status,
          metadata: {
            reservationReference: reservation.reference,
            participantName,
            ticketName,
          },
        },
      });

      return { type: "issued" as const, credential };
    });

    if (result.type === "not_found") return fail(reply, "Reserva não encontrada.", 404, "reservation_not_found");
    if (result.type === "admission_not_approved") {
      return fail(reply, "A admissão precisa ser aprovada antes da emissão da credencial.", 409, "admission_not_approved");
    }
    if (result.type === "duplicate") {
      return fail(reply, "Esta reserva já tem uma credencial emitida.", 409, "credential_already_exists");
    }

    return ok(reply, result.credential, 201);
  });

  app.patch("/api/admin/credentials/:code/status", async (request, reply) => {
    const auth = await requirePermission(request, reply, "credentials.update");
    if (!auth) return;

    const params = credentialStatusParamsSchema.parse(request.params);
    const body = credentialStatusBodySchema.parse(request.body);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const credential = await tx.credential.findUnique({ where: { credentialCode: params.code } });
      if (!credential) return { type: "not_found" as const };

      if (credential.status === "credential_checked_in") {
        return {
          type: "already_checked_in" as const,
          credential,
        };
      }

      if (credential.status === body.status) {
        return {
          type: "unchanged" as const,
          credential,
        };
      }

      if (!canTransitionFrom(credentialTransitions, credential.status, body.status)) {
        return {
          type: "invalid_transition" as const,
          currentStatus: credential.status,
          nextStatus: body.status,
        };
      }

      const nextCredential = await tx.credential.update({
        where: { credentialCode: params.code },
        data: { status: body.status },
      });

      await tx.auditLog.create({
        data: {
          actorId: auth.sub,
          actorEmail: auth.email,
          action: "credential.status.update",
          targetType: "credential",
          targetRef: credential.credentialCode,
          previousState: credential.status,
          nextState: body.status,
          metadata: {
            notes: body.notes ?? null,
          },
        },
      });

      return { type: "updated" as const, credential: nextCredential };
    });

    if (result.type === "not_found") return fail(reply, "Credencial não encontrada.", 404, "credential_not_found");
    if (result.type === "already_checked_in") {
      return fail(reply, "Credencial já foi validada no check-in e não pode mudar de estado.", 409, "credential_already_checked_in");
    }
    if (result.type === "invalid_transition") {
      return fail(
        reply,
        `Transição de credencial inválida: ${result.currentStatus} → ${result.nextStatus}.`,
        409,
        "invalid_transition",
      );
    }

    return ok(reply, result.credential);
  });

  app.get("/api/admin/audit", async (request, reply) => {
    const auth = await requirePermission(request, reply, "audit.read");
    if (!auth) return;

    const query = listQuerySchema.parse(request.query);
    const { skip, take } = pagination(query);

    const [items, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return ok(reply, { items, total, page: query.page, pageSize: query.pageSize });
  });
}
