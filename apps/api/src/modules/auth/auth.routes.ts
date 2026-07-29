import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { env } from "../../config/env.js";
import { fail, ok } from "../../shared/http.js";
import { permissions } from "../../shared/state-machine.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);

    if (input.email !== env.ADMIN_OWNER_EMAIL || input.password !== env.ADMIN_OWNER_PASSWORD) {
      return fail(reply, "Credenciais inválidas", 401, "invalid_credentials");
    }

    return ok(reply, {
      accessToken: randomUUID(),
      user: {
        name: "Owner THE BOARD",
        email: input.email,
        role: "admin",
        permissions: ["*", ...permissions],
      },
    });
  });

  app.get("/api/auth/me", async (_request, reply) => {
    return ok(reply, {
      authenticated: false,
      message: "Sessão real será ligada a JWT/cookie httpOnly na próxima etapa.",
    });
  });

  app.post("/api/auth/logout", async (_request, reply) => ok(reply, { loggedOut: true }));
}
