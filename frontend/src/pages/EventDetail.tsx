import { Link, useParams } from "react-router-dom";
import { useEvent, useBudgetTotal } from "../hooks/useEvents";
import { useLocations } from "../hooks/useLocations";
import { useTasks } from "../hooks/useTasks";
import { useApprovals } from "../hooks/useApprovals";
import { useActivity } from "../hooks/useActivity";
import { GlassPanel } from "../components/shared/GlassPanel";
import { ErrorState } from "../components/shared/ErrorState";
import { ActivityTimeline } from "../components/activity/ActivityTimeline";
import { ApprovalCard } from "../components/approvals/ApprovalCard";
import { formatCurrency, formatTimeRange } from "../lib/format";
import "./EventDetail.css";

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);

  const event = useEvent(eventId);
  const locations = useLocations();
  const tasks = useTasks(eventId);
  const budget = useBudgetTotal(eventId);
  const approvals = useApprovals();
  const activity = useActivity(eventId);

  if (event.isError) {
    return <ErrorState error={event.error} onRetry={() => event.refetch()} />;
  }

  if (!event.data) {
    return <p className="event-detail__loading">Loading event…</p>;
  }

  const location = locations.data?.find((loc) => loc.id === event.data.location_id);
  const eventApprovals = (approvals.data ?? []).filter((a) => a.event_id === eventId);

  return (
    <div className="event-detail">
      <header className="event-detail__header">
        <div className="event-detail__header-row">
          <h1 className="event-detail__title">{event.data.title}</h1>
          <Link to={`/events/${eventId}/orbit`} className="event-detail__orbit-link">
            ◌ View Orbit
          </Link>
        </div>
        <p className="event-detail__meta">
          {event.data.participants} participants · {formatTimeRange(event.data.start_time, event.data.end_time)}
        </p>
      </header>

      <div className="event-detail__grid">
        <div className="event-detail__main">
          <GlassPanel depth="crystal" className="event-detail__section">
            <p className="event-detail__section-label">LOCATION</p>
            {location ? (
              <>
                <p className="event-detail__location-name">{location.name}</p>
                <ul className="event-detail__equipment">
                  <li>{location.capacity} seats</li>
                  {location.has_computers && <li>Computers</li>}
                  {location.has_projector && <li>Projector</li>}
                  {location.has_whiteboard && <li>Whiteboard</li>}
                  {location.has_microphone && <li>Microphone</li>}
                </ul>
              </>
            ) : (
              <p className="event-detail__empty-note">No location assigned yet.</p>
            )}
          </GlassPanel>

          <GlassPanel className="event-detail__section">
            <p className="event-detail__section-label">TASKS</p>
            {tasks.data && tasks.data.length > 0 ? (
              <ul className="event-detail__tasks">
                {tasks.data.map((task) => (
                  <li key={task.id} data-done={task.status === "done"}>
                    <span className="event-detail__task-mark">{task.status === "done" ? "✓" : "○"}</span>
                    {task.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="event-detail__empty-note">No tasks yet.</p>
            )}
          </GlassPanel>

          <GlassPanel className="event-detail__section">
            <p className="event-detail__section-label">BUDGET</p>
            {budget.data ? (
              <div className="event-detail__budget">
                <strong>{formatCurrency(budget.data.total)}</strong>
                {budget.data.threshold != null && (
                  <span className="event-detail__budget-threshold">
                    threshold {formatCurrency(budget.data.threshold)}
                    {budget.data.requires_approval && " · requires approval"}
                  </span>
                )}
              </div>
            ) : (
              <p className="event-detail__empty-note">No budget recorded.</p>
            )}
          </GlassPanel>

          {eventApprovals.length > 0 && (
            <section>
              <p className="event-detail__section-label">APPROVAL</p>
              <div className="event-detail__approvals">
                {eventApprovals.map((approval) => (
                  <ApprovalCard key={approval.id} approval={approval} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="event-detail__activity">
          <p className="event-detail__section-label">ACTIVITY</p>
          <GlassPanel className="event-detail__activity-panel">
            <ActivityTimeline items={activity.data ?? []} />
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
}
