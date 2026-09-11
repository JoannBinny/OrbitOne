import { Link } from "react-router-dom";
import { useTasks, useUpdateTaskStatus } from "../hooks/useTasks";
import { useEvents } from "../hooks/useEvents";
import { useOrganization } from "../hooks/useOrganization";
import { GlassPanel } from "../components/shared/GlassPanel";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import type { Task } from "../types/api";
import "./Tasks.css";

const COLUMNS: { status: "pending" | "done"; label: string }[] = [
  { status: "pending", label: "TO DO" },
  { status: "done", label: "DONE" },
];

export default function TasksPage() {
  const { organization } = useOrganization();
  const tasks = useTasks(undefined, organization?.id);
  const events = useEvents(organization?.id);
  const updateStatus = useUpdateTaskStatus();

  if (tasks.isError) {
    return <ErrorState error={tasks.error} onRetry={() => tasks.refetch()} />;
  }

  const eventTitle = (eventId: number) => events.data?.find((e) => e.id === eventId)?.title;

  function toggleTask(task: Task) {
    updateStatus.mutate({ taskId: task.id, status: task.status === "done" ? "pending" : "done" });
  }

  return (
    <div className="tasks-page">
      <header className="tasks-page__header">
        <p className="tasks-page__eyebrow">TASKS</p>
        <h1 className="tasks-page__headline">What OrbitOne is tracking.</h1>
        <p className="tasks-page__note">
          Click a task to mark it done — the backend only tracks pending/done, so there's no
          "in progress" state or drag-to-reorder, but a done task is real and persists.
        </p>
      </header>

      {updateStatus.isError && (
        <ErrorState error={updateStatus.error} onRetry={() => updateStatus.reset()} />
      )}

      {tasks.isSuccess && tasks.data.length === 0 ? (
        <EmptyState title="Nothing to do." subtitle="You're all caught up." />
      ) : (
        <div className="tasks-page__board">
          {COLUMNS.map((column) => {
            const items = (tasks.data ?? []).filter((t) => t.status === column.status);
            return (
              <div key={column.status} className="tasks-page__column">
                <p className="tasks-page__column-label">
                  {column.label} <span>{items.length}</span>
                </p>
                <div className="tasks-page__column-items">
                  {items.map((task) => {
                    const busy = updateStatus.isPending && updateStatus.variables?.taskId === task.id;
                    return (
                      <GlassPanel
                        key={task.id}
                        className="tasks-page__card"
                        data-done={task.status === "done"}
                        data-busy={busy}
                      >
                        <button
                          type="button"
                          className="tasks-page__card-toggle"
                          onClick={() => toggleTask(task)}
                          disabled={updateStatus.isPending}
                          aria-label={task.status === "done" ? "Mark as pending" : "Mark as done"}
                        >
                          <span className="tasks-page__card-check" aria-hidden="true">
                            {task.status === "done" ? "✓" : "○"}
                          </span>
                          <span className="tasks-page__card-title">{task.title}</span>
                        </button>
                        <Link to={`/events/${task.event_id}`} className="tasks-page__card-event">
                          {eventTitle(task.event_id) ?? `Event #${task.event_id}`}
                        </Link>
                      </GlassPanel>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
