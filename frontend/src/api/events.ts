import { apiGet, apiPost } from "./client";
import type { Event, EventCreate } from "../types/api";

export function listEvents(): Promise<Event[]> {
  return apiGet<Event[]>("/events");
}

export function getEvent(eventId: number): Promise<Event> {
  return apiGet<Event>(`/events/${eventId}`);
}

export function createEvent(payload: EventCreate): Promise<Event> {
  return apiPost<Event>("/events", payload);
}

export interface BudgetTotalResponse {
  event_id: number;
  total: number;
  threshold: number | null;
  requires_approval: boolean;
}

export function getBudgetTotal(eventId: number): Promise<BudgetTotalResponse> {
  return apiGet<BudgetTotalResponse>(`/events/${eventId}/budget-total`);
}
