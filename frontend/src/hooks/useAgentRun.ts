import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAgentRun, listAgentRuns, startAgentRun } from "../api/agent";
import type { AgentRun } from "../types/api";

const SETTLED_STATUSES = new Set(["completed", "failed", "rejected"]);

/**
 * Polls a real agent run until it settles. No fake progress is invented here
 * — the run's own status (queued/running/paused_for_approval/completed/
 * failed/rejected) is the only ground truth; step-by-step UI copy should
 * come from useActivity(eventId, true) once run.event_id is known.
 * "paused_for_approval" is NOT settled — the run resumes for real once a
 * human approves, so polling must continue through it.
 */
export function useAgentRunStatus(runId: number | null) {
  return useQuery({
    queryKey: ["agentRun", runId],
    queryFn: () => getAgentRun(runId as number),
    enabled: runId != null,
    refetchInterval: (query) => {
      const data = query.state.data as AgentRun | undefined;
      if (!data || !SETTLED_STATUSES.has(data.status)) return 1500;
      return false;
    },
  });
}

export function useStartAgentRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startAgentRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentRuns"] });
    },
  });
}

export function useAgentRuns(organizationId?: number) {
  return useQuery({
    queryKey: ["agentRuns", organizationId ?? "all"],
    queryFn: () => listAgentRuns(organizationId),
    enabled: organizationId != null,
    refetchInterval: 5000,
  });
}
