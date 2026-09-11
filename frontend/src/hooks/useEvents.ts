import { useQuery } from "@tanstack/react-query";
import { getBudgetTotal, getEvent, listEvents } from "../api/events";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: listEvents,
  });
}

export function useEvent(eventId: number | null | undefined) {
  return useQuery({
    queryKey: ["events", eventId],
    queryFn: () => getEvent(eventId as number),
    enabled: eventId != null,
  });
}

export function useBudgetTotal(eventId: number | null | undefined) {
  return useQuery({
    queryKey: ["events", eventId, "budget-total"],
    queryFn: () => getBudgetTotal(eventId as number),
    enabled: eventId != null,
  });
}
