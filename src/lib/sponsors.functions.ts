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

function genSponsorReference() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `SP-${ts}${rand}`;
}

export const createSponsorInquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    // Temporary backend-ready response. When the real backend lands, replace this handler with an API call.
    return {
      ok: true,
      inquiryReference: genSponsorReference(),
      status: "sponsor_inquiry_received" as const,
      tier: data.tier,
    };
  });
