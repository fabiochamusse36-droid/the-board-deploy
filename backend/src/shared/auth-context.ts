import type { FastifyReply, FastifyRequest } from "fastify";
import { fail } from "./http.js";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens.js";

export type AuthContext = AccessTokenPayload;

function readBearerToken(request: FastifyRequest) {
  const header = request.headers.authorization;

  if (!header) return null;

  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token.trim();
}

export async function getAuthContext(request: FastifyRequest): Promise<AuthContext | null> {
  const token = readBearerToken(request);

  if (!token) return null;

  return verifyAccessToken(token);
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<AuthContext | null> {
  const auth = await getAuthContext(request);

  if (!auth) {
    fail(reply, "Sessão inválida ou expirada", 401, "unauthorized");
    return null;
  }

  return auth;
}

export async function requirePermission(
  request: FastifyRequest,
  reply: FastifyReply,
  permission: string,
): Promise<AuthContext | null> {
  const auth = await requireAuth(request, reply);

  if (!auth) return null;

  const hasPermission = auth.permissions.includes("*") || auth.permissions.includes(permission);

  if (!hasPermission) {
    fail(reply, "Sem permissão para executar esta ação", 403, "forbidden");
    return null;
  }

  return auth;
}
