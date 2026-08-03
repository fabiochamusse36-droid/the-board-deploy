# THE BOARD Backend Deploy Guide

This document defines the deploy-ready backend contract for THE BOARD API.

The current preferred provider can be Railway, but the backend must stay portable across web server providers such as Railway, Render, Fly.io, or a future managed server platform.

## Backend location

```txt
backend/
```

## Required provider settings

Set the backend service root directory to:

```txt
backend
```

Use these commands for a Railway-style Node service:

```txt
Build command:
npm run railway:build
```

```txt
Start command:
npm run railway:start
```

These scripts currently run:

```txt
railway:build = npm run prisma:generate && npm run build
railway:start = npm run prisma:deploy && npm run start
```

## Required environment variables

Set these in the provider dashboard, not in GitHub:

```env
NODE_ENV=production
PORT=<provided by host, usually automatic>
API_BASE_URL=https://<backend-service-domain>
WEB_APP_URL=https://<frontend-domain>
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret-min-32-chars>
JWT_ISSUER=the-board-api
JWT_AUDIENCE=the-board-web
JWT_ACCESS_TOKEN_TTL_SECONDS=28800
ADMIN_OWNER_EMAIL=<owner-admin-email>
ADMIN_OWNER_PASSWORD=<private-owner-password>
GATEWAY_WEBHOOK_SECRET=<strong-random-webhook-secret>
GATEWAY_PROVIDER=mock
```

Optional variables:

```env
REDIS_URL=
RESEND_API_KEY=
MAIL_FROM=THE BOARD <no-reply@theboard.co.mz>
COMMERCIAL_EMAIL=
GATEWAY_BASE_URL=
GATEWAY_API_KEY=
```

## Database deployment flow

On service start, the backend start script runs:

```txt
prisma migrate deploy
```

This applies committed Prisma migrations to the production database.

After first deploy, run the seed command manually only when needed:

```txt
npm run prisma:seed
```

The seed command creates/updates the owner admin from:

```env
ADMIN_OWNER_EMAIL
ADMIN_OWNER_PASSWORD
```

Do not paste production passwords into chat, GitHub, or commit history.

## Health check

The backend exposes:

```txt
GET /health
```

Expected shape:

```json
{
  "ok": true,
  "service": "the-board-api",
  "environment": "production"
}
```

## Payment provider status

Payment provider implementation is intentionally deferred.

The current backend keeps the payment architecture ready for:

```txt
external payment provider/API
→ authenticated callback/webhook to backend
→ backend confirms payment
→ admission becomes available
```

Do not add payment API keys to GitHub.

## Security rules

```txt
- Do not commit .env files.
- Do not paste secrets into chat.
- Provider env vars are allowed in Railway/Render/etc dashboard.
- Rotate any secret that was ever committed or exposed.
- Keep backend auth tokens signed with JOSE-based token utilities.
```

## Current backend readiness status

```txt
✅ Fastify backend
✅ Prisma schema
✅ PostgreSQL-ready
✅ JOSE auth foundation
✅ Protected admin/check-in operations
✅ Public reservation/admission/sponsor flows
✅ Global API error shape
✅ Railway-compatible scripts
⏳ Payment provider adapter finalization later
⏳ Frontend final backend connection later
```
