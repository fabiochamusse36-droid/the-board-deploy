# THE BOARD — Backend Foundation

## Decisão de arquitetura

O THE BOARD deixa de depender de Supabase como backend de negócio. A aplicação passa a ter uma API própria em `apps/api`, com Node.js, TypeScript, Fastify, PostgreSQL, Prisma, Redis, Resend e gateway adapter.

## Separação de responsabilidades

```txt
Frontend THE BOARD
→ experiência, formulários, painel e check-in

Backend THE BOARD
→ regras de negócio, persistência, estados, permissões, auditoria e integração com gateway

Gateway/Paysuite
→ sessão de pagamento, canal de pagamento, confirmação e webhook
```

## Domínios

```txt
auth
reservations
payments
admissions
sponsors
credentials
checkin
webhooks
audit
```

## Máquina de estados

### Reserva

```txt
reservation_created
payment_started
payment_pending
payment_confirmed
payment_failed
payment_cancelled
expired
```

### Pagamento

```txt
payment_session_created
payment_pending
payment_processing
payment_confirmed
payment_failed
payment_cancelled
payment_expired
```

### Admissão

```txt
admission_locked
admission_available
admission_submitted
admission_under_review
admission_approved
admission_rejected
credential_issued
```

### Patrocínio

```txt
sponsor_inquiry_received
sponsor_under_review
sponsor_qualified
dossier_pending
dossier_sent
proposal_sent
negotiation
approved
rejected
closed_won
closed_lost
```

### Credencial

```txt
credential_not_ready
credential_ready
credential_issued
credential_checked_in
credential_blocked
```

## RBAC

Só existem duas roles principais:

```txt
user
admin
```

Dentro de `admin`, permissões definem módulos e ações:

```txt
reservations.read
payments.read
payments.manual_confirm
admissions.read
admissions.approve
admissions.reject
sponsors.read
sponsors.qualify
sponsors.send_dossier
sponsors.reject
credentials.read
credentials.issue
checkin.validate
reports.export
audit.read
```

O proprietário tem `admin + *`.

## Regras essenciais

```txt
Sem pagamento confirmado → admissão bloqueada.
Pagamento confirmado → admissão disponível.
Admissão aprovada → credencial pronta.
Credencial emitida → check-in permitido.
Pedido de patrocínio qualificado → dossier pode ser enviado.
Toda ação sensível → audit log obrigatório.
Webhook do gateway → idempotente e assinado.
Redirect do browser → nunca é fonte final de verdade.
```

## Próxima fase

1. Instalar dependências da API.
2. Subir PostgreSQL e Redis local.
3. Rodar Prisma migrate.
4. Ligar front às rotas reais.
5. Adicionar autenticação real.
6. Integrar Resend.
7. Trocar mock gateway pelo adapter Paysuite/Gateway RW quando aprovado.
