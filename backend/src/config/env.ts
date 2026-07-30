import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_BASE_URL: z.string().url().default("http://localhost:4000"),
  WEB_APP_URL: z.string().url().default("http://localhost:8080"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(24),
  ADMIN_OWNER_EMAIL: z.string().email(),
  ADMIN_OWNER_PASSWORD: z.string().min(8),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default("THE BOARD <no-reply@theboard.co.mz>"),
  COMMERCIAL_EMAIL: z.string().email().optional(),
  GATEWAY_PROVIDER: z.enum(["mock", "paysuite", "gateway_rw"]).default("mock"),
  GATEWAY_BASE_URL: z.string().url().optional(),
  GATEWAY_API_KEY: z.string().optional(),
  GATEWAY_WEBHOOK_SECRET: z.string().min(12),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
