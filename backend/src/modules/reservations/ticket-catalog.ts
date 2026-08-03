export const ticketCatalog = {
  "early-investors": {
    id: "early-investors",
    name: "Investidores Iniciais",
    price: 2500,
    currency: "MZN",
    available: true,
  },
  "vip-board": {
    id: "vip-board",
    name: "VIP Board Member",
    price: 7500,
    currency: "MZN",
    available: true,
  },
  "executive-access": {
    id: "executive-access",
    name: "Executive Access",
    price: 3500,
    currency: "MZN",
    available: false,
  },
  "last-call": {
    id: "last-call",
    name: "Last Call",
    price: 5000,
    currency: "MZN",
    available: false,
  },
  "streaming-premium": {
    id: "streaming-premium",
    name: "Streaming Premium",
    price: 1500,
    currency: "MZN",
    available: false,
  },
} as const;

export type TicketId = keyof typeof ticketCatalog;

export const availableTicketIds = Object.entries(ticketCatalog)
  .filter(([, ticket]) => ticket.available)
  .map(([ticketId]) => ticketId) as Array<TicketId>;

export function getTicket(ticketId: TicketId) {
  return ticketCatalog[ticketId];
}

export function isAvailableTicketId(ticketId: string): ticketId is TicketId {
  return ticketId in ticketCatalog && ticketCatalog[ticketId as TicketId].available;
}
