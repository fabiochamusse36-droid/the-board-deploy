import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { env } from "../config/env.js";

const accessTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
  permissions: z.array(z.string()),
  typ: z.literal("access"),
  jti: z.string().min(1),
  iat: z.number().int().positive(),
  nbf: z.number().int().positive().optional(),
  exp: z.number().int().positive(),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

export type SignAccessTokenInput = {
  userId: string;
  email: string;
  role: "user" | "admin";
  permissions: string[];
};

export const accessTokenTtlSeconds = env.JWT_ACCESS_TOKEN_TTL_SECONDS;

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export async function signAccessToken(input: SignAccessTokenInput) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    email: input.email,
    role: input.role,
    permissions: input.permissions,
    typ: "access",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setSubject(input.userId)
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + accessTokenTtlSeconds)
    .setJti(randomUUID())
    .sign(jwtSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload, protectedHeader } = await jwtVerify(token, jwtSecret, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      algorithms: ["HS256"],
    });

    if (protectedHeader.alg !== "HS256") return null;

    return accessTokenPayloadSchema.parse(payload);
  } catch {
    return null;
  }
}
