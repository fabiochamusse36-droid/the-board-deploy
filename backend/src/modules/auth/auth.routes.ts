import { z } from "zod";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db/prisma.js";
import { fail, ok } from "../../shared/http.js";
import { verifyPassword } from "../../shared/password.js";
import { accessTokenTtlSeconds, signAccessToken } from "../../shared/tokens.js";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const email = input.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return fail(reply, "Credenciais inválidas", 401, "invalid_credentials");
    }

    const passwordIsValid = verifyPassword(input.password, user.passwordHash);

    if (!passwordIsValid) {
      return fail(reply, "Credenciais inválidas", 401, "invalid_credentials");
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });

    return ok(reply, {
      accessToken,
      tokenType: "Bearer",
      expiresIn: accessTokenTtlSeconds,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
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
