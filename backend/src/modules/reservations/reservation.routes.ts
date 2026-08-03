import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { ok, fail, reference } from "../../shared/http.js";
import { createGatewayAdapter } from "../gateway/index.js";
import { env } from "../../config/env.js";
import { getTicket, isAvailableTicketId, ticketCatalog } from "./ticket-catalog.js";

const createReservationSchema = z.object({
  ticketId: z.string().refine(isAvailableTicketId, {
    message: "Ticket indisponível ou inválido",
  }),
  quantity: z.coerce.number().int().min(1).max(10).default(1),
  buyerName: z.string().trim().min(2).max(120),
  buyerEmail: z.string().trim().email().transform((email) => email.toLowerCase()),
  buyerPhone: z.string().trim().min(6).max(30),
  country: z.string().trim().min(2).max(80).optional(),
  city: z.string().trim().min(2).max(80).optional(),
});

async function createReservationWithUniqueReference(input: z.infer<typeof createReservationSchema>) {
  const ticket = getTicket(input.ticketId);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reservationReference = reference("THB");

    try {
      return await prisma.reservation.create({
        data: {
          reference: reservationReference,
          ticketId: ticket.id,
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
    } catch (error) {
      const isUniqueReferenceCollision =
        error != null &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002";

      if (!isUniqueReferenceCollision || attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error("Não foi possível gerar referência única de reserva.");
}

export async function reservationRoutes(app: FastifyInstance) {
  app.get("/api/tickets", async (_request, reply) => {
    return ok(reply, {
      tickets: Object.values(ticketCatalog),
    });
  });

  app.post("/api/reservations", async (request, reply) => {
    const input = createReservationSchema.parse(request.body);
    const reservation = await createReservationWithUniqueReference(input);

    return ok(
      reply,
      {
        reference: reservation.reference,
        ticketId: reservation.ticketId,
        ticketName: reservation.ticketName,
        quantity: reservation.quantity,
        unitPrice: reservation.unitPrice,
        totalAmount: reservation.totalAmount,
        currency: reservation.currency,
        buyerName: reservation.buyerName,
        buyerEmail: reservation.buyerEmail,
        buyerPhone: reservation.buyerPhone,
        country: reservation.country,
        city: reservation.city,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        admissionStatus: reservation.admissionStatus,
        createdAt: reservation.createdAt,
      },
      201,
    );
  });

  app.get("/api/reservations/:reference", async (request, reply) => {
    const params = z.object({ reference: z.string().trim().min(4) }).parse(request.params);
    const reservation = await prisma.reservation.findUnique({
      where: { reference: params.reference },
      include: { payments: true, admissions: true, credentials: true },
    });

    if (!reservation) return fail(reply, "Reserva não encontrada", 404, "reservation_not_found");
    return ok(reply, reservation);
  });

  app.post("/api/reservations/:reference/start-payment", async (request, reply) => {
    const params = z.object({ reference: z.string().trim().min(4) }).parse(request.params);
    const reservation = await prisma.reservation.findUnique({
      where: { reference: params.reference },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!reservation) return fail(reply, "Reserva não encontrada", 404, "reservation_not_found");
    if (reservation.paymentStatus === "payment_confirmed") return fail(reply, "Pagamento já confirmado", 409, "payment_already_confirmed");

    const latestPayment = reservation.payments[0];
    if (
      latestPayment?.checkoutUrl &&
      latestPayment.expiresAt &&
      latestPayment.expiresAt > new Date() &&
      ["payment_session_created", "payment_pending", "payment_processing"].includes(latestPayment.status)
    ) {
      return ok(reply, {
        paymentSessionId: latestPayment.paymentSessionId,
        checkoutUrl: latestPayment.checkoutUrl,
        status: latestPayment.status,
        expiresAt: latestPayment.expiresAt.toISOString(),
        reused: true,
      });
    }

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
