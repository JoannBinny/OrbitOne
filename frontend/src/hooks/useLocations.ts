import { useQuery } from "@tanstack/react-query";
import { listLocations } from "../api/locations";

export function useLocations(organizationId?: number) {
  return useQuery({
    queryKey: ["locations", organizationId ?? "all"],
    queryFn: () => listLocations(organizationId),
  });
}
