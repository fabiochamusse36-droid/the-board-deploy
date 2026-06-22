import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  tier: z.enum(["master", "gold", "silver", "custom"]),
  company: z.string().trim().min(2).max(160),
  contact_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const createSponsorInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("sponsor_inquiries").insert({
      tier: data.tier,
      company: data.company,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      status: "new",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
