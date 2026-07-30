// Normalize raw data (mock or backend) into UI-friendly shapes.
// UI consumes the *UI types — never the raw types.

import type { TicketRaw, ScheduleItemRaw, SponsorTierRaw, KpiRaw } from "./event-data";

export type TicketUI = {
  id: string;
  name: string;
  priceLabel: string; // formatted MT, e.g. "2.500"
  priceCurrency: "MT";
  description: string;
  tag: string;
  seats: string;
  featured: boolean;
  available: boolean;
};

export type ScheduleItemUI = ScheduleItemRaw;

export type SponsorTierUI = {
  id: string;
  tier: string;
  priceLabel: string;
  priceCurrency: "MT";
  slots: string;
  perks: string[];
  highlight: boolean;
};

export type KpiUI = KpiRaw;

const fmt = (n: number) => n.toLocaleString("pt-PT");

export function mapTicketToUI(t: TicketRaw): TicketUI {
  return {
    id: t.id,
    name: t.name,
    priceLabel: fmt(t.price_mt),
    priceCurrency: "MT",
    description: t.description,
    tag: t.tag,
    seats: t.seats,
    featured: !!t.featured,
    available: t.available,
  };
}

export function mapSponsorTierToUI(s: SponsorTierRaw): SponsorTierUI {
  return {
    id: s.id,
    tier: s.tier,
    priceLabel: fmt(s.price_mt),
    priceCurrency: "MT",
    slots: s.slots,
    perks: s.perks,
    highlight: !!s.highlight,
  };
}
