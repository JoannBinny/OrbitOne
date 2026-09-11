import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteEvent, getBudgetTotal, getEvent, listEvents } from "../api/events";

export function useEvents(organizationId?: number) {
  return useQuery({
    queryKey: ["events", organizationId ?? "all"],
    queryFn: () => listEvents(organizationId),
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

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["agentRuns"] });
    },
  });
}
