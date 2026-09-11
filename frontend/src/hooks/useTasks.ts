import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, listTasks, updateTaskStatus } from "../api/tasks";
import type { Task, TaskCreate, TaskStatus } from "../types/api";

export function useTasks(eventId?: number, organizationId?: number) {
  return useQuery({
    queryKey: ["tasks", eventId ?? "all", organizationId ?? "all"],
    queryFn: () => listTasks(eventId, organizationId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskCreate) => createTask(payload),
    onSuccess: (_task, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["events", variables.event_id] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) => updateTaskStatus(taskId, status),
    onSuccess: (task: Task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["events", task.event_id] });
    },
  });
}
