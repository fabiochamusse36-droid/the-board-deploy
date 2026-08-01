// Hook layer — UI only reads from here.
// Synchronous today (mock data); refactor to react-query when backend lands.

import { useMemo } from "react";
import { eventService } from "@/services/event.service";

export function useTickets() {
  return useMemo(() => {
    const res = eventService.getTickets();
    return {
      tickets: res.data ?? [],
      error: res.error,
      isLoading: false,
      isEmpty: (res.data?.length ?? 0) === 0,
    };
  }, []);
}

export function useSchedule() {
  return useMemo(() => {
    const res = eventService.getSchedule();
    return {
      schedule: res.data ?? [],
      error: res.error,
      isLoading: false,
      isEmpty: (res.data?.length ?? 0) === 0,
    };
  }, []);
}

export function useSponsorTiers() {
  return useMemo(() => {
    const res = eventService.getSponsorTiers();
    return {
      tiers: res.data ?? [],
      error: res.error,
      isLoading: false,
      isEmpty: (res.data?.length ?? 0) === 0,
    };
  }, []);
}

export function useKpis() {
  return useMemo(() => {
    const res = eventService.getKpis();
    return {
      kpis: res.data ?? [],
      error: res.error,
      isLoading: false,
      isEmpty: (res.data?.length ?? 0) === 0,
    };
  }, []);
}
