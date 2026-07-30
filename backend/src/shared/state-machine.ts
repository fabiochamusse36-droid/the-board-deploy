export const permissions = [
  "reservations.read",
  "payments.read",
  "payments.manual_confirm",
  "admissions.read",
  "admissions.approve",
  "admissions.reject",
  "sponsors.read",
  "sponsors.qualify",
  "sponsors.send_dossier",
  "sponsors.reject",
  "credentials.read",
  "credentials.issue",
  "checkin.validate",
  "reports.export",
  "audit.read",
] as const;

export type Permission = (typeof permissions)[number] | "*";

export const reservationTransitions = {
  reservation_created: ["payment_started", "expired"],
  payment_started: ["payment_pending", "payment_confirmed", "payment_failed", "payment_cancelled"],
  payment_pending: ["payment_confirmed", "payment_failed", "payment_cancelled", "expired"],
  payment_confirmed: [],
  payment_failed: ["payment_started"],
  payment_cancelled: ["payment_started"],
  expired: [],
} as const;

export const admissionTransitions = {
  admission_locked: ["admission_available"],
  admission_available: ["admission_submitted"],
  admission_submitted: ["admission_under_review"],
  admission_under_review: ["admission_approved", "admission_rejected"],
  admission_approved: ["credential_issued"],
  admission_rejected: [],
  credential_issued: [],
} as const;

export const sponsorTransitions = {
  sponsor_inquiry_received: ["sponsor_under_review", "rejected"],
  sponsor_under_review: ["sponsor_qualified", "rejected"],
  sponsor_qualified: ["dossier_pending", "dossier_sent", "rejected"],
  dossier_pending: ["dossier_sent", "rejected"],
  dossier_sent: ["proposal_sent", "negotiation", "rejected"],
  proposal_sent: ["negotiation", "approved", "closed_lost"],
  negotiation: ["approved", "closed_won", "closed_lost"],
  approved: ["closed_won"],
  rejected: [],
  closed_won: [],
  closed_lost: [],
} as const;

export function canTransition<T extends Record<string, readonly string[]>>(machine: T, from: keyof T, to: string) {
  return machine[from]?.includes(to) ?? false;
}
