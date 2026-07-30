import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TICKETS: Record<string, { name: string; amount: number }> = {
  "early-investors": { name: "Investidores Iniciais", amount: 2500 },
  "vip-board": { name: "VIP Board Member", amount: 7500 },
};

const createSchema = z.object({
  ticket: z.enum(["early-investors", "vip-board"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  country: z.string().trim().max(80).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  quantity: z.number().int().min(1).max(10).optional().default(1),
});

const getSchema = z.object({
  reference: z.string().min(4).max(40),
});

function genReference() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `THB-${ts}${rand}`;
}

/**
 * Temporary reservation creation boundary.
 *
 * THE BOARD will not use Supabase as the final backend. For now this function
 * keeps the front-end flow operational and backend-ready without requiring
 * Supabase environment variables. When the real backend is introduced, replace
 * only this boundary with an API call that persists the reservation and creates
 * a payment session with the external gateway.
 */
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data }) => {
    const ticket = TICKETS[data.ticket];
    if (!ticket) throw new Error("Bilhete inválido");

    const reference = genReference();
    const quantity = data.quantity ?? 1;

    return {
      reference,
      reservationStatus: "reservation_created" as const,
      paymentStatus: "payment_pending" as const,
      admissionStatus: "admission_form_locked" as const,
      ticketType: ticket.name,
      amountMt: ticket.amount * quantity,
    };
  });

/**
 * Temporary read boundary for the confirmation page.
 *
 * The browser-side reservation store remains the source of truth during this
 * front-end phase. This server function only returns a safe fallback shape so
 * /confirmacao/$reference can render without Supabase.
 */
export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => getSchema.parse(input))
  .handler(async ({ data }) => {
    return {
      reference: data.reference,
      buyer_name: "",
      buyer_email: "",
      buyer_phone: "",
      ticket_type: "Reserva THE BOARD",
      amount_mt: 0,
      payment_method: "external_gateway",
      status: "reservation_created",
      notes: "{}",
      created_at: new Date().toISOString(),
    };
  });
