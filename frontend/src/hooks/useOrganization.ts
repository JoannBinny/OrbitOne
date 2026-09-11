import { useQuery } from "@tanstack/react-query";
import { listOrganizations } from "../api/organizations";

/**
 * OrbitOne currently operates as a single-organization tool (one seeded org).
 * We still discover the id from the real backend instead of hardcoding it —
 * if a second organization is ever seeded, this picks the first one returned.
 */
export function useOrganization() {
  const query = useQuery({
    queryKey: ["organizations"],
    queryFn: listOrganizations,
    staleTime: Infinity,
  });

  return {
    ...query,
    organization: query.data?.[0] ?? null,
  };
}
