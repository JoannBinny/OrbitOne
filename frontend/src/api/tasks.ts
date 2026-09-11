import { apiGet, apiPatch, apiPost, buildQuery } from "./client";
import type { Task, TaskCreate, TaskStatus } from "../types/api";

export function listTasks(eventId?: number, organizationId?: number): Promise<Task[]> {
  return apiGet<Task[]>(`/tasks${buildQuery({ event_id: eventId, organization_id: organizationId })}`);
}

export function createTask(payload: TaskCreate): Promise<Task> {
  return apiPost<Task>("/tasks", payload);
}

export function updateTaskStatus(taskId: number, status: TaskStatus): Promise<Task> {
  return apiPatch<Task>(`/tasks/${taskId}`, { status });
}
