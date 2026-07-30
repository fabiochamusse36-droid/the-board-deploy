import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { ok, fail, reference } from "../../shared/http.js";
import { createGatewayAdapter } from "../gateway/index.js";
import { env } from "../../config/env.js";

const ticketCatalog = {
  "early-investors": { name: "Investidores Iniciais", price: 2500 },
  "vip-board": { name: "VIP Board Member", price: 7500 },
} as const;

const createReservationSchema = z.object({
  ticketId: z.enum(["early-investors", "vip-board"]),
  quantity: z.number().int().min(1).max(10).default(1),
  buyerName: z.string().trim().min(2).max(120),
  buyerEmail: z.string().trim().email(),
  buyerPhone: z.string().trim().min(6).max(30),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

export async function reservationRoutes(app: FastifyInstance) {
  app.post("/api/reservations", async (request, reply) => {
    const input = createReservationSchema.parse(request.body);
    const ticket = ticketCatalog[input.ticketId];
    const reservationReference = reference("THB");

    const reservation = await prisma.reservation.create({
      data: {
        reference: reservationReference,
        ticketId: input.ticketId,
        ticketName: ticket.name,
        quantity: input.quantity,
        unitPrice: ticket.price,
        totalAmount: ticket.price * input.quantity,
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        buyerPhone: input.buyerPhone,
        country: input.country,
        city: input.city,
        status: "reservation_created",
        paymentStatus: "payment_pending",
        admissionStatus: "admission_locked",
      },
    });

    return ok(reply, reservation, 201);
  });

  app.get("/api/reservations/:reference", async (request, reply) => {
    const params = z.object({ reference: z.string().min(4) }).parse(request.params);
    const reservation = await prisma.reservation.findUnique({
      where: { reference: params.reference },
      include: { payments: true, admissions: true, credentials: true },
    });

    if (!reservation) return fail(reply, "Reserva não encontrada", 404, "reservation_not_found");
    return ok(reply, reservation);
  });

  app.post("/api/reservations/:reference/start-payment", async (request, reply) => {
    const params = z.object({ reference: z.string().min(4) }).parse(request.params);
    const reservation = await prisma.reservation.findUnique({ where: { reference: params.reference } });

    if (!reservation) return fail(reply, "Reserva não encontrada", 404, "reservation_not_found");
    if (reservation.paymentStatus === "payment_confirmed") return fail(reply, "Pagamento já confirmado", 409, "payment_already_confirmed");

    const gateway = createGatewayAdapter();
    const session = await gateway.createPaymentSession({
      merchantReference: reservation.reference,
      amount: reservation.totalAmount,
      currency: "MZN",
      description: `THE BOARD 2026 — ${reservation.ticketName}`,
      customer: {
        name: reservation.buyerName,
        email: reservation.buyerEmail,
        phone: reservation.buyerPhone,
      },
      metadata: {
        eventId: "the-board-2026",
        ticketId: reservation.ticketId,
        ticketName: reservation.ticketName,
        quantity: reservation.quantity,
        source: "the-board-web",
      },
      returnUrl: `${env.WEB_APP_URL}/confirmacao/${reservation.reference}`,
      callbackUrl: `${env.API_BASE_URL}/api/webhooks/gateway`,
    });

    await prisma.$transaction([
      prisma.payment.create({
        data: {
          reservationId: reservation.id,
          paymentSessionId: session.paymentSessionId,
          gateway: env.GATEWAY_PROVIDER,
          amount: reservation.totalAmount,
          currency: "MZN",
          status: session.status,
          checkoutUrl: session.checkoutUrl,
          expiresAt: new Date(session.expiresAt),
        },
      }),
      prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "payment_started", paymentStatus: "payment_session_created" },
      }),
    ]);

    return ok(reply, session, 201);
  });
}
