import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, listTasks } from "../api/tasks";
import type { TaskCreate } from "../types/api";

export function useTasks(eventId?: number) {
  return useQuery({
    queryKey: ["tasks", eventId ?? "all"],
    queryFn: () => listTasks(eventId),
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
