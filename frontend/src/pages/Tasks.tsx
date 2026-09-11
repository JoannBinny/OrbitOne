import { Link } from "react-router-dom";
import { useTasks } from "../hooks/useTasks";
import { useEvents } from "../hooks/useEvents";
import { GlassPanel } from "../components/shared/GlassPanel";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import "./Tasks.css";

const COLUMNS: { status: "pending" | "done"; label: string }[] = [
  { status: "pending", label: "TO DO" },
  { status: "done", label: "DONE" },
];

export default function TasksPage() {
  const tasks = useTasks();
  const events = useEvents();

  if (tasks.isError) {
    return <ErrorState error={tasks.error} onRetry={() => tasks.refetch()} />;
  }

  const eventTitle = (eventId: number) => events.data?.find((e) => e.id === eventId)?.title;

  return (
    <div className="tasks-page">
      <header className="tasks-page__header">
        <p className="tasks-page__eyebrow">TASKS</p>
        <h1 className="tasks-page__headline">What OrbitOne is tracking.</h1>
        <p className="tasks-page__note">
          The backend currently only tracks pending/done — there's no "in progress" state or a way to
          move a task from here yet, so this board is read-only.
        </p>
      </header>

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
                  {items.map((task) => (
                    <GlassPanel key={task.id} className="tasks-page__card">
                      <p className="tasks-page__card-title">{task.title}</p>
                      <Link to={`/events/${task.event_id}`} className="tasks-page__card-event">
                        {eventTitle(task.event_id) ?? `Event #${task.event_id}`}
                      </Link>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
