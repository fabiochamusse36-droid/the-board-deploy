// Client-side reservation state used by THE BOARD while the real backend contract is finalized.
// Payment channel selection and transaction execution belong to the external gateway, not this UI.

export type PaymentStatus =
  | "payment_pending"
  | "payment_processing"
  | "payment_confirmed"
  | "payment_failed"
  | "payment_expired";

export type AdmissionStatus =
  | "admission_form_locked"
  | "admission_form_available"
  | "admission_submitted"
  | "under_review"
  | "approved"
  | "not_eligible"
  | "refund_pending"
  | "refunded";

export type MockReservation = {
  reference: string;
  ticketId: string;
  ticketName: string;
  amount: number;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  country: string;
  city: string;
  paymentStatus: PaymentStatus;
  admissionStatus: AdmissionStatus;
  createdAt: string;
};

const STORAGE_KEY = "the_board_reservations";

type Result<T> = { data: T | null; error: string | null };

function readAll(): Record<string, MockReservation> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, MockReservation>;
    return {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, MockReservation>): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

export function saveReservation(
  r: Omit<MockReservation, "paymentStatus" | "admissionStatus" | "createdAt"> &
    Partial<Pick<MockReservation, "paymentStatus" | "admissionStatus" | "createdAt">>
): Result<MockReservation> {
  const all = readAll();
  const record: MockReservation = {
    paymentStatus: "payment_pending",
    admissionStatus: "admission_form_locked",
    createdAt: new Date().toISOString(),
    ...r,
  };
  all[r.reference] = record;
  writeAll(all);
  return { data: record, error: null };
}

export function getReservation(reference: string): Result<MockReservation> {
  const all = readAll();
  const record = all[reference];
  if (!record) return { data: null, error: "Reserva não encontrada no estado local." };
  return { data: record, error: null };
}

export function confirmPaymentMock(reference: string): Result<MockReservation> {
  const all = readAll();
  const record = all[reference];
  if (!record) {
    const stub: MockReservation = {
      reference,
      ticketId: "",
      ticketName: "",
      amount: 0,
      quantity: 1,
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
      country: "",
      city: "",
      paymentStatus: "payment_confirmed",
      admissionStatus: "admission_form_available",
      createdAt: new Date().toISOString(),
    };
    all[reference] = stub;
    writeAll(all);
    return { data: stub, error: null };
  }
  record.paymentStatus = "payment_confirmed";
  record.admissionStatus = "admission_form_available";
  all[reference] = record;
  writeAll(all);
  return { data: record, error: null };
}

export function markAdmissionSubmitted(reference: string): Result<MockReservation> {
  const all = readAll();
  const record = all[reference];
  if (!record) return { data: null, error: "Reserva não encontrada." };
  record.admissionStatus = "admission_submitted";
  all[reference] = record;
  writeAll(all);
  return { data: record, error: null };
}
