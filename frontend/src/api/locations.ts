import { apiGet, buildQuery } from "./client";
import type { Location } from "../types/api";

export function listLocations(organizationId?: number): Promise<Location[]> {
  return apiGet<Location[]>(`/locations${buildQuery({ organization_id: organizationId })}`);
}

export interface AvailableLocationsParams {
  start_time: string;
  end_time: string;
  organization_id?: number;
  min_capacity?: number;
  needs_computers?: boolean;
  needs_projector?: boolean;
}

export function listAvailableLocations(params: AvailableLocationsParams): Promise<Location[]> {
  return apiGet<Location[]>(`/locations/available${buildQuery(params)}`);
}
