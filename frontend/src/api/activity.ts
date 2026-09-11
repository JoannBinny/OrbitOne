import { apiGet, buildQuery } from "./client";
import type { AgentAction } from "../types/api";

export function listActivity(eventId?: number): Promise<AgentAction[]> {
  return apiGet<AgentAction[]>(`/activity${buildQuery({ event_id: eventId })}`);
}
