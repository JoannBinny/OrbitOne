import { apiGet, apiPost, buildQuery } from "./client";
import type { AgentRun } from "../types/api";

export interface StartAgentRunPayload {
  organization_id: number;
  message: string;
}

export function startAgentRun(payload: StartAgentRunPayload): Promise<AgentRun> {
  return apiPost<AgentRun>("/agent/run", payload);
}

export function getAgentRun(runId: number): Promise<AgentRun> {
  return apiGet<AgentRun>(`/agent/run/${runId}`);
}

export function listAgentRuns(organizationId?: number): Promise<AgentRun[]> {
  return apiGet<AgentRun[]>(`/agent/run${buildQuery({ organization_id: organizationId })}`);
}
