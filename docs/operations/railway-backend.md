# Railway backend checklist

This document explains how THE BOARD backend should be prepared for Railway without exposing real secrets.

## Scope

- Backend service root directory: `backend`
- Database schema directory: `database/prisma`
- Runtime database: Railway PostgreSQL
- Runtime cache: Railway Redis
- Secrets: managed directly inside Railway project settings by the owner/operator

## Backend commands

Build command:

```bash
npm run railway:build
```

Start command:

```bash
npm run railway:start
```

The start command runs database migrations before starting the API process.

## Required variable names

The backend reads the following environment variable names. Values must be entered only in Railway or in a local ignored env file.

```txt
NODE_ENV
PORT
API_BASE_URL
WEB_APP_URL
DATABASE_URL
REDIS_URL
JWT_SECRET
ADMIN_OWNER_EMAIL
ADMIN_OWNER_PASSWORD
RESEND_API_KEY
MAIL_FROM
COMMERCIAL_EMAIL
GATEWAY_PROVIDER
GATEWAY_BASE_URL
GATEWAY_API_KEY
GATEWAY_WEBHOOK_SECRET
```

## Security rule

Do not place real values in GitHub, documentation, screenshots, or chat. Only variable names and empty examples are allowed in the repository.

## Deployment order

1. Create Railway project.
2. Add PostgreSQL service.
3. Add Redis service.
4. Add backend service from GitHub.
5. Set backend root directory to `backend`.
6. Configure required variables inside Railway.
7. Run the backend build and start commands.
8. Check `/health` endpoint.
9. Run owner seed only after variables for the owner account are configured.

## Next backend tasks

- Replace temporary auth with database-backed auth.
- Persist reservations from the frontend.
- Persist sponsor inquiries.
- Persist admissions.
- Persist credentials and check-in validation.
- Persist audit logs for sensitive actions.
- Keep gateway integration behind the adapter until Paysuite is approved.
