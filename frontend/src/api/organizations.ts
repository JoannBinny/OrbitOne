import { apiGet } from "./client";
import type { Organization } from "../types/api";

export function listOrganizations(): Promise<Organization[]> {
  return apiGet<Organization[]>("/organizations");
}
