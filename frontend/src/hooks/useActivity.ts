import { useQuery } from "@tanstack/react-query";
import { listActivity } from "../api/activity";

/**
 * Real activity from GET /activity. When `live` is true, polls at a fixed
 * interval — used during an active agent run to reflect real backend
 * progress. Never fabricate steps beyond what this returns.
 *
 * `enabled` (default true) lets a caller skip fetching entirely — important
 * when `eventId` is legitimately still unknown (e.g. a run in progress
 * before the backend has linked an event): omitting the id doesn't just
 * skip filtering, GET /activity with no event_id returns EVERY event's
 * activity system-wide, which would misrepresent unrelated history as
 * belonging to "right now" if fetched and rendered prematurely.
 */
export function useActivity(eventId?: number, live = false, enabled = true) {
  return useQuery({
    queryKey: ["activity", eventId ?? "all"],
    queryFn: () => listActivity(eventId),
    refetchInterval: live ? 2000 : false,
    enabled,
  });
}
