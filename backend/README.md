# THE BOARD API

Backend real do THE BOARD — Big Players Forum 2026.

## Responsabilidades

- Autenticação e permissões administrativas.
- Reservas e participantes.
- Pagamentos e integração com gateway externo.
- Admissões executivas.
- Patrocínios institucionais.
- Credenciais e check-in.
- Webhooks e idempotência.
- Auditoria operacional.

## Stack

- Node.js + TypeScript
- Fastify
- PostgreSQL + Prisma
- Redis para idempotência/cache/locks
- Resend para emails
- Gateway adapter para Paysuite/Gateway RW

## Desenvolvimento local

```bash
cd apps/api
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Health check:

```bash
curl http://localhost:4000/health
```

## Endpoints iniciais

```txt
POST /api/reservations
GET  /api/reservations/:reference
POST /api/reservations/:reference/start-payment

GET  /api/admissions/access/:reference
POST /api/admissions

POST /api/sponsors/inquiries
GET  /api/sponsors/inquiries/:reference

GET  /api/checkin/credentials/lookup?q=
POST /api/checkin/credentials/:code/validate

POST /api/webhooks/gateway
```

## Regra central

Pagamento confirmado libera admissão. Admissão aprovada libera credencial. Credencial emitida permite check-in. Toda ação sensível deve gerar auditoria.
