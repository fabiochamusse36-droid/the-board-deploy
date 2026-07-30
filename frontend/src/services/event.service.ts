// Service layer for event content. Returns { data, error } envelope.
// Currently backed by static mock data; swap the body for a backend call
// without changing any UI consumer.

import {
  TICKETS_DATA,
  SCHEDULE_DATA,
  SPONSOR_TIERS_DATA,
  KPIS_DATA,
} from "@/lib/event-data";
import {
  mapTicketToUI,
  mapSponsorTierToUI,
  type TicketUI,
  type ScheduleItemUI,
  type SponsorTierUI,
  type KpiUI,
} from "@/lib/adapters";

export type ServiceResult<T> = { data: T | null; error: string | null };

function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

function fail<T>(error: string): ServiceResult<T> {
  return { data: null, error };
}

export const eventService = {
  getTickets(): ServiceResult<TicketUI[]> {
    try {
      return ok(TICKETS_DATA.map(mapTicketToUI));
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Falha ao carregar bilhetes");
    }
  },
  getSchedule(): ServiceResult<ScheduleItemUI[]> {
    try {
      return ok(SCHEDULE_DATA);
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Falha ao carregar agenda");
    }
  },
  getSponsorTiers(): ServiceResult<SponsorTierUI[]> {
    try {
      return ok(SPONSOR_TIERS_DATA.map(mapSponsorTierToUI));
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Falha ao carregar patrocínios");
    }
  },
  getKpis(): ServiceResult<KpiUI[]> {
    try {
      return ok(KPIS_DATA);
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Falha ao carregar indicadores");
    }
  },
};
