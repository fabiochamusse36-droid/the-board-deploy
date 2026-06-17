import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TICKETS: Record<string, { name: string; amount: number }> = {
  "early-investors": { name: "Early Investors", amount: 2500 },
};

const createSchema = z.object({
  ticket: z.enum(["early-investors"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  payment_method: z.enum(["mpesa", "bank"]),
});

function genReference() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `THB-${ts}${rand}`;
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data }) => {
    const ticket = TICKETS[data.ticket];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // retry on reference collision
    for (let i = 0; i < 5; i++) {
      const reference = genReference();
      const { data: row, error } = await supabaseAdmin
        .from("orders")
        .insert({
          reference,
          buyer_name: data.name,
          buyer_email: data.email,
          buyer_phone: data.phone,
          ticket_type: ticket.name,
          amount_mt: ticket.amount,
          payment_method: data.payment_method,
          status: "pending",
        })
        .select("reference")
        .single();
      if (!error && row) return { reference: row.reference };
      if (error && !String(error.message).includes("duplicate")) {
        throw new Error(error.message);
      }
    }
    throw new Error("Não foi possível criar a reserva. Tente novamente.");
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ reference: z.string().min(4).max(40) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select("reference, buyer_name, buyer_email, buyer_phone, ticket_type, amount_mt, payment_method, status, created_at")
      .eq("reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Reserva não encontrada");
    return row;
  });
