import { apiGet, buildQuery } from "./client";
import type { Location } from "../types/api";

export function listLocations(): Promise<Location[]> {
  return apiGet<Location[]>("/locations");
}

export interface AvailableLocationsParams {
  start_time: string;
  end_time: string;
  min_capacity?: number;
  needs_computers?: boolean;
  needs_projector?: boolean;
}

export function listAvailableLocations(params: AvailableLocationsParams): Promise<Location[]> {
  return apiGet<Location[]>(`/locations/available${buildQuery(params)}`);
}
