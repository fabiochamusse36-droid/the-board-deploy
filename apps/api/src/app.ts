import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { admissionRoutes } from "./modules/admissions/admission.routes.js";
import { checkinRoutes } from "./modules/checkin/checkin.routes.js";
import { reservationRoutes } from "./modules/reservations/reservation.routes.js";
import { sponsorRoutes } from "./modules/sponsors/sponsor.routes.js";
import { gatewayWebhookRoutes } from "./modules/webhooks/gateway-webhook.routes.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(helmet);
  await app.register(cors, {
    origin: [env.WEB_APP_URL],
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
  });

  app.get("/health", async () => ({ ok: true, service: "the-board-api", environment: env.NODE_ENV }));

  await app.register(reservationRoutes);
  await app.register(admissionRoutes);
  await app.register(sponsorRoutes);
  await app.register(checkinRoutes);
  await app.register(gatewayWebhookRoutes);

  return app;
}
