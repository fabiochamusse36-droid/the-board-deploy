import type { FastifyReply } from "fastify";

export function ok<T>(reply: FastifyReply, data: T, statusCode = 200) {
  return reply.status(statusCode).send({ ok: true, data });
}

export function fail(reply: FastifyReply, message: string, statusCode = 400, code = "bad_request") {
  return reply.status(statusCode).send({ ok: false, error: { code, message } });
}

export function reference(prefix: "THB" | "ADM" | "SP" | "PAY" | "CRD") {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `${prefix}-${ts}${rand}`;
}
