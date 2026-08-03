# THE BOARD Backend API Contracts

This document is the backend contract inventory for THE BOARD — Big Players Forum.

It is used to connect the frontend later without guessing endpoint names, response shapes, required permissions, or business-state rules.

## Standard response shape

All successful API responses should follow:

```json
{
  "ok": true,
  "data": {}
}
```

All failed API responses should follow:

```json
{
  "ok": false,
  "error": {
    "code": "error_code",
    "message": "Human readable message"
  }
}
```

Common global error codes:

| Code | Meaning |
| --- | --- |
| `validation_error` | Request body, params, or query failed validation. |
| `request_error` | Known 4xx client request error. |
| `unique_constraint` | Duplicate unique database record. |
| `record_not_found` | Database record was not found. |
| `internal_server_error` | Unexpected server failure. |

## Health

### GET `/health`

Public health check endpoint.

Response data:

```json
{
  "ok": true,
  "service": "the-board-api",
  "environment": "development"
}
```

## Auth

### POST `/api/auth/login`

Public login endpoint for backend users/admins.

Request body:

```json
{
  "email": "owner@example.com",
  "password": "private-password"
}
```

Response behavior:

- Verifies password hash.
- Blocks inactive users.
- Returns signed JOSE access token.
- Returns user role and permissions.

Important notes:

- Current auth foundation uses Bearer access tokens.
- Final browser session/cookie strategy can be improved later.
- Do not store production secrets in Git.

## Tickets and reservations

### GET `/api/tickets`

Public endpoint returning the server-side ticket catalog.

Purpose:

- Frontend should use this as the source of truth for ticket prices and availability.
- Frontend must not control final prices.

### POST `/api/reservations`

Public endpoint for buyer reservation creation.

Request body:

```json
{
  "ticketId": "early-investors",
  "quantity": 1,
  "buyerName": "Buyer Name",
  "buyerEmail": "buyer@example.com",
  "buyerPhone": "+258840000000",
  "country": "Moçambique",
  "city": "Maputo"
}
```

Response behavior:

- Validates ticket ID and quantity.
- Normalizes buyer email.
- Uses server-side ticket price.
- Generates official `THB-*` reservation reference.
- Creates initial reservation with payment pending and admission locked.

Main error codes:

| Code | Meaning |
| --- | --- |
| `invalid_ticket` | Ticket does not exist or is not available. |
| `validation_error` | Invalid buyer or ticket input. |

### GET `/api/reservations/:reference`

Public reservation lookup by official reference.

Current note:

- This endpoint is useful for buyer confirmation/status pages.
- It should remain carefully shaped before final public launch to avoid exposing unnecessary operational data.

### POST `/api/reservations/:reference/start-payment`

Public buyer action to start payment session.

Current status:

- Backend gateway adapter exists.
- Payment provider implementation is intentionally deferred.
- Current flow can use mock gateway behavior until real provider/API key is ready.

Future payment contract:

```txt
external payment provider/API
→ backend receives authenticated callback/webhook
→ backend validates reference, amount, currency and signature
→ backend updates payment status
→ payment_confirmed unlocks admission
```

## Admissions

### GET `/api/admissions/access/:reference`

Public endpoint to check whether a reservation can submit the admission form.

Response behavior:

- Returns reservation reference.
- Returns payment status.
- Returns admission status.
- Returns whether admission is available.
- Returns existing admission tracking info when an admission already exists.

Business rules:

- Admission is only available after `payment_confirmed`.
- Admission is not available again after an admission already exists.

Main error codes:

| Code | Meaning |
| --- | --- |
| `reservation_not_found` | Reservation reference does not exist. |

### POST `/api/admissions`

Public endpoint to submit an admission form.

Request body:

```json
{
  "reservationReference": "THB-XXXXXX",
  "fullName": "Participant Name",
  "email": "participant@example.com",
  "phone": "+258840000000",
  "profileType": "Investor",
  "company": "Company Name",
  "role": "Founder",
  "investmentExperience": "Experience details",
  "motivation": "Motivation details"
}
```

Business rules:

- Reservation must exist.
- Reservation payment status must be `payment_confirmed`.
- Duplicate admission submission for the same reservation is blocked.
- Admission create and reservation admission status update run together.

Main error codes:

| Code | Meaning |
| --- | --- |
| `reservation_not_found` | Reservation reference does not exist. |
| `admission_locked` | Payment has not been confirmed yet. |
| `admission_already_submitted` | Reservation already has an admission submission. |
| `validation_error` | Invalid admission form input. |

## Sponsors

### POST `/api/sponsors/inquiries`

Public endpoint to submit a sponsorship inquiry.

Request body:

```json
{
  "tier": "Gold Partner",
  "company": "Company Name",
  "contactName": "Contact Name",
  "email": "contact@example.com",
  "phone": "+258840000000",
  "message": "Optional message"
}
```

Business rules:

- Email is normalized to lowercase.
- Company and tier are normalized before saving.
- Recent duplicate sponsor leads are blocked.
- Full lead data is available only through protected admin endpoints.

Main error codes:

| Code | Meaning |
| --- | --- |
| `duplicate_sponsor_inquiry` | Similar recent sponsor inquiry already exists. |
| `validation_error` | Invalid sponsor inquiry input. |

### GET `/api/sponsors/inquiries/:reference`

Public limited tracking endpoint for sponsor inquiry references.

Response behavior:

- Returns only limited sponsor tracking data.
- Does not expose full private lead details.

Main error codes:

| Code | Meaning |
| --- | --- |
| `sponsor_not_found` | Sponsor inquiry reference does not exist. |

## Check-in

### GET `/api/checkin/credentials/lookup?q=...`

Protected endpoint for credential lookup.

Required permission:

```txt
credentials.read
```

Query:

```txt
q: string, min 2, max 120
```

Lookup can match:

- credential code
- participant name
- reservation reference

Main error codes:

| Code | Meaning |
| --- | --- |
| `credential_not_found` | Credential was not found. |
| `unauthorized` | Missing/invalid auth token. |
| `forbidden` | User lacks required permission. |

### POST `/api/checkin/credentials/:code/validate`

Protected endpoint to validate attendee entry.

Required permission:

```txt
checkin.validate
```

Business rules:

- Credential must exist.
- `credential_not_ready` cannot check in.
- `credential_blocked` cannot check in.
- `credential_checked_in` cannot check in again.
- Successful validation updates credential to `credential_checked_in`.
- Successful validation writes audit log.

Main error codes:

| Code | Meaning |
| --- | --- |
| `credential_not_found` | Credential does not exist. |
| `credential_not_ready` | Credential is not yet available. |
| `credential_blocked` | Credential is blocked. |
| `already_checked_in` | Credential has already been used. |
| `unauthorized` | Missing/invalid auth token. |
| `forbidden` | User lacks required permission. |

## Admin endpoints

All admin endpoints require Bearer authentication and permissions.

### GET `/api/admin/reservations`

Required permission:

```txt
reservations.read
```

Query:

```txt
page: number, default 1
pageSize: number, default 25, max 100
```

Returns paginated reservations with latest payment, admission, and credential summary.

### GET `/api/admin/admissions`

Required permission:

```txt
admissions.read
```

Returns paginated admission submissions.

### PATCH `/api/admin/admissions/:reference/review`

Required permission:

```txt
admissions.review
```

Request body:

```json
{
  "status": "admission_approved",
  "reviewNotes": "Optional review note"
}
```

Allowed statuses:

```txt
admission_under_review
admission_approved
admission_rejected
```

Business behavior:

- Updates admission status.
- Updates reservation admission status.
- Writes audit log.

Main error codes:

| Code | Meaning |
| --- | --- |
| `admission_not_found` | Admission reference does not exist. |
| `forbidden` | User lacks required permission. |

### GET `/api/admin/sponsors`

Required permission:

```txt
sponsors.read
```

Returns paginated full sponsor inquiries.

### PATCH `/api/admin/sponsors/:reference/status`

Required permission:

```txt
sponsors.update
```

Request body:

```json
{
  "status": "sponsor_qualified",
  "dossierStatus": "dossier_pending",
  "notes": "Optional internal note"
}
```

Allowed statuses:

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

Business behavior:

- Updates sponsor inquiry status.
- Optionally updates dossier status.
- Writes audit log.

Main error codes:

| Code | Meaning |
| --- | --- |
| `sponsor_not_found` | Sponsor inquiry reference does not exist. |
| `forbidden` | User lacks required permission. |

### GET `/api/admin/payments`

Required permission:

```txt
payments.read
```

Returns paginated payment records with reservation data.

Current status:

- Useful for operations/admin visibility.
- Real provider settlement/confirmation is deferred.

### POST `/api/admin/credentials/issue`

Required permission:

```txt
credentials.issue
```

Request body:

```json
{
  "reservationReference": "THB-XXXXXX",
  "participantName": "Optional override",
  "ticketName": "Optional override"
}
```

Business rules:

- Reservation must exist.
- Reservation admission status must be `admission_approved`.
- Duplicate credential issuing for the same reservation is blocked.
- Blocked credentials do not allow a new credential to be silently created.
- Successful issuing writes audit log.

Main error codes:

| Code | Meaning |
| --- | --- |
| `reservation_not_found` | Reservation reference does not exist. |
| `admission_not_approved` | Admission has not been approved. |
| `credential_already_exists` | Reservation already has a credential. |
| `forbidden` | User lacks required permission. |

### PATCH `/api/admin/credentials/:code/status`

Required permission:

```txt
credentials.update
```

Request body:

```json
{
  "status": "credential_ready",
  "notes": "Optional internal note"
}
```

Allowed statuses:

```txt
credential_ready
credential_issued
credential_blocked
```

Business rules:

- Checked-in credentials cannot be changed by admin status update.
- Repeating the same credential status returns the existing credential safely.
- Successful status change writes audit log.

Main error codes:

| Code | Meaning |
| --- | --- |
| `credential_not_found` | Credential does not exist. |
| `credential_already_checked_in` | Credential has already been checked in and cannot be changed. |
| `forbidden` | User lacks required permission. |

### GET `/api/admin/audit`

Required permission:

```txt
audit.read
```

Returns paginated audit logs.

## Webhooks and payment provider

### Payment callback/webhook routes

Current status:

```txt
foundation exists, provider-specific integration deferred
```

Target architecture:

```txt
payment provider/API key configured in provider env
→ provider sends callback/webhook to backend
→ backend authenticates callback
→ backend validates event id/reference/amount/currency
→ backend updates payment and reservation state
→ backend unlocks admission when payment_confirmed
```

Rules for later implementation:

- API keys must live only in provider env variables.
- Do not commit provider secrets.
- Webhooks must be authenticated.
- Webhooks must be idempotent.
- Amount, currency, and reservation reference must be validated before confirming payment.

## Permission reference

Known permissions used by current backend contracts:

```txt
reservations.read
payments.read
payments.manual_confirm
admissions.read
admissions.review
admissions.approve
admissions.reject
sponsors.read
sponsors.update
sponsors.qualify
sponsors.send_dossier
sponsors.reject
credentials.read
credentials.issue
credentials.update
checkin.validate
reports.export
audit.read
```

Note: Some future permissions exist for finer-grained operations, but current implemented admin routes use the permissions documented above.

## Frontend connection guidance

When frontend connection resumes:

1. Use this document as the endpoint map.
2. Do not let frontend calculate final prices.
3. Frontend should call server-backed reservation APIs.
4. Admin/check-in frontend must send Bearer token until final session strategy is implemented.
5. Payment provider UI/redirect/callback should remain behind backend payment contracts.
6. Do not connect to mock/local storage as source of truth in production.
