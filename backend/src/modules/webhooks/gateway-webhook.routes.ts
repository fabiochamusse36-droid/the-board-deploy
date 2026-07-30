import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { fail, ok } from "../../shared/http.js";

const gatewayWebhookSchema = z.object({
  event: z.string(),
  paymentSessionId: z.string(),
  merchantReference: z.string(),
  status: z.enum(["confirmed", "pending", "processing", "failed", "cancelled", "expired"]),
  amount: z.number().int(),
  currency: z.literal("MZN"),
  method: z.string().optional(),
  providerReference: z.string().optional(),
  paidAt: z.string().datetime().optional(),
});

function verifySignature(rawBody: string, signature?: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", env.GATEWAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function gatewayWebhookRoutes(app: FastifyInstance) {
  app.post("/api/webhooks/gateway", async (request, reply) => {
    const rawBody = JSON.stringify(request.body ?? {});
    const signature = request.headers["x-gateway-signature"]?.toString();
    const idempotencyKey = request.headers["x-idempotency-key"]?.toString();
    const signatureValid = verifySignature(rawBody, signature);
    const payload = gatewayWebhookSchema.parse(request.body);

    if (!idempotencyKey) return fail(reply, "Idempotency key obrigatória", 400, "missing_idempotency_key");

    const existing = await prisma.webhookEvent.findUnique({ where: { eventId: idempotencyKey } });
    if (existing?.processed) return ok(reply, { duplicated: true });

    await prisma.webhookEvent.upsert({
      where: { eventId: idempotencyKey },
      update: { payload, signatureValid },
      create: {
        provider: env.GATEWAY_PROVIDER,
        eventId: idempotencyKey,
        reference: payload.merchantReference,
        payload,
        signatureValid,
      },
    });

    if (!signatureValid) return fail(reply, "Assinatura inválida", 401, "invalid_signature");

    const paymentStatus =
      payload.status === "confirmed"
        ? "payment_confirmed"
        : payload.status === "failed"
        ? "payment_failed"
        : payload.status === "cancelled"
        ? "payment_cancelled"
        : payload.status === "expired"
        ? "payment_expired"
        : payload.status === "processing"
        ? "payment_processing"
        : "payment_pending";

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { paymentSessionId: payload.paymentSessionId },
        data: {
          status: paymentStatus,
          method: payload.method,
          gatewayReference: payload.providerReference,
          paidAt: payload.paidAt ? new Date(payload.paidAt) : undefined,
        },
      });

      await tx.reservation.update({
        where: { id: payment.reservationId },
        data: {
          paymentStatus,
          status: payload.status === "confirmed" ? "payment_confirmed" : undefined,
          admissionStatus: payload.status === "confirmed" ? "admission_available" : undefined,
        },
      });

      await tx.webhookEvent.update({
        where: { eventId: idempotencyKey },
        data: { processed: true, processedAt: new Date() },
      });
    });

    return ok(reply, { processed: true });
  });
}
