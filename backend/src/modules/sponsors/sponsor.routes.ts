import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { fail, ok, reference } from "../../shared/http.js";

const sponsorInquirySchema = z.object({
  tier: z.string().trim().min(2).max(40),
  company: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  message: z.string().trim().max(2000).optional(),
});

const referenceParamsSchema = z.object({
  reference: z.string().trim().min(4).max(40),
});

function recentDuplicateWindow() {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  return since;
}

export async function sponsorRoutes(app: FastifyInstance) {
  app.post("/api/sponsors/inquiries", async (request, reply) => {
    const input = sponsorInquirySchema.parse(request.body);
    const email = input.email.toLowerCase();
    const company = input.company.trim();
    const tier = input.tier.trim();

    const duplicate = await prisma.sponsorInquiry.findFirst({
      where: {
        email,
        company: { equals: company, mode: "insensitive" },
        tier: { equals: tier, mode: "insensitive" },
        createdAt: { gte: recentDuplicateWindow() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (duplicate) {
      return fail(
        reply,
        "Já existe um pedido de patrocínio recente para esta empresa, email e categoria.",
        409,
        "duplicate_sponsor_inquiry",
      );
    }

    const inquiry = await prisma.sponsorInquiry.create({
      data: {
        reference: reference("SP"),
        tier,
        company,
        contactName: input.contactName.trim(),
        email,
        phone: input.phone.trim(),
        message: input.message,
        status: "sponsor_inquiry_received",
        dossierStatus: "dossier_pending",
      },
    });

    return ok(
      reply,
      {
        reference: inquiry.reference,
        status: inquiry.status,
        dossierStatus: inquiry.dossierStatus,
        createdAt: inquiry.createdAt,
      },
      201,
    );
  });

  app.get("/api/sponsors/inquiries/:reference", async (request, reply) => {
    const params = referenceParamsSchema.parse(request.params);
    const inquiry = await prisma.sponsorInquiry.findUnique({ where: { reference: params.reference } });

    if (!inquiry) return fail(reply, "Pedido de patrocínio não encontrado", 404, "sponsor_inquiry_not_found");

    return ok(reply, {
      reference: inquiry.reference,
      tier: inquiry.tier,
      company: inquiry.company,
      status: inquiry.status,
      dossierStatus: inquiry.dossierStatus,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    });
  });
}
