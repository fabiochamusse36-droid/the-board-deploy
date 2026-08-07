import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { credentialAdminRoutes } from "./modules/admin/credential-admin.routes.js";
import { admissionRoutes } from "./modules/admissions/admission.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { checkinRoutes } from "./modules/checkin/checkin.routes.js";
import { reservationRoutes } from "./modules/reservations/reservation.routes.js";
import { sponsorRoutes } from "./modules/sponsors/sponsor.routes.js";
import { gatewayWebhookRoutes } from "./modules/webhooks/gateway-webhook.routes.js";
import { fail } from "./shared/http.js";

type ErrorWithStatus = {
  statusCode?: number;
  message?: string;
};

type ErrorWithPrismaCode = {
  code?: string;
};

function getPrismaCode(error: unknown) {
  if (error == null || typeof error !== "object" || !("code" in error)) {
    return null;
  }

  const code = (error as ErrorWithPrismaCode).code;
  return typeof code === "string" ? code : null;
}

function getHttpStatus(error: unknown) {
  if (error == null || typeof error !== "object") {
    return null;
  }

  const statusCode = (error as ErrorWithStatus).statusCode;
  const message = (error as ErrorWithStatus).message;

  if (typeof statusCode !== "number") {
    return null;
  }

  if (statusCode < 400 || statusCode >= 500) {
    return null;
  }

  return {
    statusCode,
    message:
      typeof message === "string" && message.length > 0
        ? message
        : "Pedido inválido.",
  };
}

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "request_failed");

    if (error instanceof ZodError) {
      return fail(
        reply,
        "Pedido inválido. Verifique os dados enviados.",
        400,
        "validation_error",
      );
    }

    const prismaCode = getPrismaCode(error);

    if (prismaCode === "P2002") {
      return fail(reply, "Registro duplicado.", 409, "unique_constraint");
    }

    if (prismaCode === "P2025") {
      return fail(reply, "Registro não encontrado.", 404, "record_not_found");
    }

    const httpError = getHttpStatus(error);

    if (httpError) {
      return fail(
        reply,
        httpError.message,
        httpError.statusCode,
        "request_error",
      );
    }

    return fail(
      reply,
      "Erro interno do servidor.",
      500,
      "internal_server_error",
    );
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: [env.WEB_APP_URL],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
  });

  app.get("/health", async () => ({
    ok: true,
    service: "the-board-api",
    environment: env.NODE_ENV,
  }));

  await app.register(authRoutes);
  await app.register(reservationRoutes);
  await app.register(admissionRoutes);
  await app.register(sponsorRoutes);
  await app.register(checkinRoutes);
  await app.register(adminRoutes);

  // Administrative credential listing.
  await app.register(credentialAdminRoutes);

  await app.register(gatewayWebhookRoutes);

  return app;
}
