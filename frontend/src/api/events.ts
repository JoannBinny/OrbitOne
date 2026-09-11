import { apiDelete, apiGet, apiPost, buildQuery } from "./client";
import type { Event, EventCreate } from "../types/api";

export function listEvents(organizationId?: number): Promise<Event[]> {
  return apiGet<Event[]>(`/events${buildQuery({ organization_id: organizationId })}`);
}

export function getEvent(eventId: number): Promise<Event> {
  return apiGet<Event>(`/events/${eventId}`);
}

export function createEvent(payload: EventCreate): Promise<Event> {
  return apiPost<Event>("/events", payload);
}

export function deleteEvent(eventId: number): Promise<void> {
  return apiDelete<void>(`/events/${eventId}`);
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
