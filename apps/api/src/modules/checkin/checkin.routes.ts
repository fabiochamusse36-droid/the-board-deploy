import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { fail, ok } from "../../shared/http.js";

export async function checkinRoutes(app: FastifyInstance) {
  app.get("/api/checkin/credentials/lookup", async (request, reply) => {
    const query = z.object({ q: z.string().trim().min(2) }).parse(request.query);

    const credential = await prisma.credential.findFirst({
      where: {
        OR: [
          { credentialCode: { contains: query.q, mode: "insensitive" } },
          { participantName: { contains: query.q, mode: "insensitive" } },
          { reservation: { reference: { contains: query.q, mode: "insensitive" } } },
        ],
      },
      include: { reservation: true },
    });

    if (!credential) return fail(reply, "Credencial não encontrada", 404, "credential_not_found");
    return ok(reply, credential);
  });

  app.post("/api/checkin/credentials/:code/validate", async (request, reply) => {
    const params = z.object({ code: z.string().min(4) }).parse(request.params);
    const credential = await prisma.credential.findUnique({ where: { credentialCode: params.code } });

    if (!credential) return fail(reply, "Credencial não encontrada", 404, "credential_not_found");
    if (credential.status === "credential_not_ready") return fail(reply, "Credencial ainda não está disponível", 409, "credential_not_ready");
    if (credential.status === "credential_blocked") return fail(reply, "Credencial bloqueada", 409, "credential_blocked");
    if (credential.status === "credential_checked_in") return fail(reply, "Entrada já validada", 409, "already_checked_in");

    const updated = await prisma.credential.update({
      where: { credentialCode: params.code },
      data: {
        status: "credential_checked_in",
        checkedInAt: new Date(),
        checkedInBy: "operator-session-pending",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "checkin.validate",
        targetType: "credential",
        targetRef: params.code,
        previousState: credential.status,
        nextState: updated.status,
      },
    });

    return ok(reply, updated);
  });
}
