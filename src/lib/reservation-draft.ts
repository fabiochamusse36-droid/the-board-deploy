export type TicketId = "early-investors" | "vip-board";

export type ReservationDraft = {
  ticketId: TicketId;
  ticketName: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  currency: "MZN";
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  country?: string;
  city?: string;
  updatedAt: string;
};

export const RESERVATION_DRAFT_KEY = "the_board_reservation_draft";

export const TICKETS: Record<
  TicketId,
  {
    id: TicketId;
    name: string;
    tag: string;
    price: number;
    category: string;
    description: string;
    maxQuantity: number;
  }
> = {
  "early-investors": {
    id: "early-investors",
    name: "Investidores Iniciais",
    tag: "Lote 1 · Reserva Presencial",
    price: 2500,
    category: "Participante presencial",
    description: "Acesso geral antecipado ao Big Players Forum.",
    maxQuantity: 5,
  },
  "vip-board": {
    id: "vip-board",
    name: "VIP Board Member",
    tag: "VIP · Reserva Premium",
    price: 7500,
    category: "VIP sujeita a validação executiva",
    description: "Lounge exclusivo, jantar executivo e mesa restrita.",
    maxQuantity: 2,
  },
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export function buildDraft(ticketId: TicketId, quantity: number): ReservationDraft {
  const ticket = TICKETS[ticketId];
  const safeQuantity = Math.max(1, Math.min(quantity, ticket.maxQuantity));
  return {
    ticketId: ticket.id,
    ticketName: ticket.name,
    unitPrice: ticket.price,
    quantity: safeQuantity,
    totalAmount: ticket.price * safeQuantity,
    currency: "MZN",
    updatedAt: new Date().toISOString(),
  };
}

export function saveReservationDraft(draft: ReservationDraft): ReservationDraft {
  const normalized: ReservationDraft = {
    ...draft,
    totalAmount: draft.unitPrice * draft.quantity,
    updatedAt: new Date().toISOString(),
  };
  if (canUseStorage()) {
    window.sessionStorage.setItem(RESERVATION_DRAFT_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function getReservationDraft(): ReservationDraft | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(RESERVATION_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ReservationDraft>;
    if (!parsed.ticketId || !parsed.ticketName || !parsed.unitPrice || !parsed.quantity) return null;
    return parsed as ReservationDraft;
  } catch {
    return null;
  }
}

export function clearReservationDraft() {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(RESERVATION_DRAFT_KEY);
  }
}

export function updateReservationDraft(partial: Partial<ReservationDraft>): ReservationDraft | null {
  const current = getReservationDraft();
  if (!current) return null;
  return saveReservationDraft({ ...current, ...partial });
}

export function formatMoney(value: number) {
  return `${value.toLocaleString("pt-PT")} MT`;
}
