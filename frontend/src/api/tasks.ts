import { apiGet, apiPost, buildQuery } from "./client";
import type { Task, TaskCreate } from "../types/api";

export function listTasks(eventId?: number): Promise<Task[]> {
  return apiGet<Task[]>(`/tasks${buildQuery({ event_id: eventId })}`);
}

export function createTask(payload: TaskCreate): Promise<Task> {
  return apiPost<Task>("/tasks", payload);
}
