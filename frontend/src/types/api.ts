// Mirrors backend/schemas.py exactly — see .claude/skills/orbitone-api-contract.
// Do not add fields the backend doesn't actually return.

export interface Organization {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
  capacity: number;
  has_computers: boolean;
  has_projector: boolean;
  has_whiteboard: boolean;
  has_microphone: boolean;
}

export type EventStatus = "draft" | "confirmed" | "needs_approval";

export interface Event {
  id: number;
  organization_id: number;
  title: string;
  participants: number;
  start_time: string;
  end_time: string;
  location_id: number | null;
  status: EventStatus | string;
}

export interface EventCreate {
  organization_id: number;
  title: string;
  participants: number;
  start_time: string;
  end_time: string;
  location_id?: number | null;
}

export type TaskStatus = "pending" | "done";

export interface Task {
  id: number;
  event_id: number;
  title: string;
  status: TaskStatus | string;
}

export interface TaskCreate {
  event_id: number;
  title: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
  id: number;
  event_id: number;
  reason: string;
  amount: number | null;
  status: ApprovalStatus | string;
  created_at: string;
}

export interface BudgetItem {
  id: number;
  event_id: number;
  label: string;
  amount: number;
}

export interface BudgetTotal {
  event_id: number;
  total: number;
  threshold: number | null;
  requires_approval: boolean;
}

export interface AgentAction {
  id: number;
  event_id: number | null;
  action: string;
  details: string | null;
  timestamp: string;
}

export type AgentRunStatus = "queued" | "running" | "completed" | "failed";

export interface AgentRun {
  id: number;
  organization_id: number;
  message: string;
  status: AgentRunStatus | string;
  result_text: string | null;
  event_id: number | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}
