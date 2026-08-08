export type TicketId = "early-investors" | "vip-board";

export type TicketSnapshot = {
  id: TicketId;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  maxQuantity: number;
};

export type ReservationDraft = {
  ticketId: TicketId;
  ticketName: string;
  ticketCategory: string;
  ticketDescription: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  currency: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  country?: string;
  city?: string;
  updatedAt: string;
};

export const RESERVATION_DRAFT_KEY =
  "the_board_reservation_draft";

function canUseStorage() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.sessionStorage)
  );
}

export function buildDraft(
  ticket: TicketSnapshot,
  quantity: number,
): ReservationDraft {
  const safeQuantity = Math.max(
    1,
    Math.min(quantity, ticket.maxQuantity),
  );

  return {
    ticketId: ticket.id,
    ticketName: ticket.name,
    ticketCategory: ticket.category,
    ticketDescription: ticket.description,
    unitPrice: ticket.price,
    quantity: safeQuantity,
    totalAmount: ticket.price * safeQuantity,
    currency: ticket.currency,
    updatedAt: new Date().toISOString(),
  };
}

export function saveReservationDraft(
  draft: ReservationDraft,
): ReservationDraft {
  const normalized: ReservationDraft = {
    ...draft,
    totalAmount:
      draft.unitPrice * draft.quantity,
    updatedAt: new Date().toISOString(),
  };

  if (canUseStorage()) {
    window.sessionStorage.setItem(
      RESERVATION_DRAFT_KEY,
      JSON.stringify(normalized),
    );
  }

  return normalized;
}

export function getReservationDraft():
  | ReservationDraft
  | null {
  if (!canUseStorage()) return null;

  try {
    const raw =
      window.sessionStorage.getItem(
        RESERVATION_DRAFT_KEY,
      );

    if (!raw) return null;

    const parsed =
      JSON.parse(raw) as Partial<ReservationDraft>;

    if (
      !parsed.ticketId ||
      !parsed.ticketName ||
      typeof parsed.unitPrice !== "number" ||
      typeof parsed.quantity !== "number"
    ) {
      return null;
    }

    return {
      ticketId: parsed.ticketId,
      ticketName: parsed.ticketName,
      ticketCategory:
        parsed.ticketCategory ?? "",
      ticketDescription:
        parsed.ticketDescription ?? "",
      unitPrice: parsed.unitPrice,
      quantity: parsed.quantity,
      totalAmount:
        typeof parsed.totalAmount === "number"
          ? parsed.totalAmount
          : parsed.unitPrice * parsed.quantity,
      currency:
        parsed.currency ?? "MZN",
      buyerName: parsed.buyerName,
      buyerEmail: parsed.buyerEmail,
      buyerPhone: parsed.buyerPhone,
      country: parsed.country,
      city: parsed.city,
      updatedAt:
        parsed.updatedAt ??
        new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearReservationDraft() {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(
      RESERVATION_DRAFT_KEY,
    );
  }
}

export function updateReservationDraft(
  partial: Partial<ReservationDraft>,
): ReservationDraft | null {
  const current = getReservationDraft();

  if (!current) return null;

  return saveReservationDraft({
    ...current,
    ...partial,
  });
}

export function formatMoney(
  value: number,
  currency = "MZN",
) {
  if (currency === "MZN") {
    return `${value.toLocaleString("pt-PT")} MT`;
  }

  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
  }).format(value);
}
