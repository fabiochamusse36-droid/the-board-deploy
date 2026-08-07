import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { requirePermission } from "../../shared/auth-context.js";
import { ok } from "../../shared/http.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export async function credentialAdminRoutes(app: FastifyInstance) {
  app.get("/api/admin/credentials", async (request, reply) => {
    const auth = await requirePermission(request, reply, "credentials.read");
    if (!auth) return;

    const query = listQuerySchema.parse(request.query);
    const skip = (query.page - 1) * query.pageSize;
    const take = query.pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.credential.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          reservation: {
            select: {
              id: true,
              reference: true,
              buyerName: true,
              buyerEmail: true,
              ticketId: true,
              ticketName: true,
              paymentStatus: true,
              admissionStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.credential.count(),
    ]);

    return ok(reply, {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  });
}
