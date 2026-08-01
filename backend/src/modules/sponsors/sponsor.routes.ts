import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { ok, reference } from "../../shared/http.js";

const sponsorInquirySchema = z.object({
  tier: z.string().trim().min(2).max(40),
  company: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(30),
  message: z.string().trim().max(2000).optional(),
});

export async function sponsorRoutes(app: FastifyInstance) {
  app.post("/api/sponsors/inquiries", async (request, reply) => {
    const input = sponsorInquirySchema.parse(request.body);

    const inquiry = await prisma.sponsorInquiry.create({
      data: {
        reference: reference("SP"),
        tier: input.tier,
        company: input.company,
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
        message: input.message,
        status: "sponsor_inquiry_received",
        dossierStatus: "dossier_pending",
      },
    });

    return ok(reply, inquiry, 201);
  });

  app.get("/api/sponsors/inquiries/:reference", async (request, reply) => {
    const params = z.object({ reference: z.string().min(4) }).parse(request.params);
    const inquiry = await prisma.sponsorInquiry.findUnique({ where: { reference: params.reference } });
    return ok(reply, inquiry);
  });
}
