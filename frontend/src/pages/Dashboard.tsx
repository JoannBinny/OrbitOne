import { Link } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { useApprovals } from "../hooks/useApprovals";
import { useTasks } from "../hooks/useTasks";
import { useActivity } from "../hooks/useActivity";
import { useOrganization } from "../hooks/useOrganization";
import { useAgentRuns } from "../hooks/useAgentRun";
import { GlassPanel } from "../components/shared/GlassPanel";
import { ErrorState } from "../components/shared/ErrorState";
import { ActivityTimeline } from "../components/activity/ActivityTimeline";
import { OrbCore } from "../components/core/OrbCore";
import { formatTimeRange } from "../lib/format";
import "./Dashboard.css";

export default function Dashboard() {
  const { organization } = useOrganization();
  const events = useEvents();
  const pendingApprovals = useApprovals("pending");
  const tasks = useTasks();
  const activity = useActivity();
  const agentRuns = useAgentRuns(organization?.id);

  const pendingTasks = tasks.data?.filter((t) => t.status === "pending") ?? [];
  const activeRuns = agentRuns.data?.filter((r) => r.status === "queued" || r.status === "running") ?? [];
  const upcoming = [...(events.data ?? [])]
    .filter((e) => new Date(e.end_time).getTime() > Date.now())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 4);

  const loading = events.isLoading || pendingApprovals.isLoading || tasks.isLoading;
  const error = events.error || pendingApprovals.error || tasks.error;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        {activeRuns.length > 0 && <OrbCore state="working" size="small" />}
        <div>
          <p className="dashboard__eyebrow">OVERVIEW</p>
          <h1 className="dashboard__headline">
            {loading
              ? "Getting the latest…"
              : `I've got ${(pendingTasks.length + upcoming.length) || "nothing"} things under control.`}
          </h1>
          {activeRuns.length > 0 && (
            <p className="dashboard__active-note">
              {activeRuns.length} run{activeRuns.length > 1 ? "s" : ""} in progress right now.
            </p>
          )}
        </div>
      </header>

      {error ? (
        <ErrorState error={error} onRetry={() => { events.refetch(); pendingApprovals.refetch(); tasks.refetch(); }} />
      ) : (
        <div className="dashboard__grid">
          <GlassPanel className="dashboard__card">
            <p className="dashboard__card-label">NEEDS YOU</p>
            <p className="dashboard__card-value">{pendingApprovals.data?.length ?? 0}</p>
            <p className="dashboard__card-sub">
              {pendingApprovals.data?.length ? "pending approval" : "nothing pending"}
            </p>
            <Link to="/approvals" className="dashboard__card-link">
              Review →
            </Link>
          </GlassPanel>

          {activeRuns.length > 0 ? (
            <GlassPanel depth="crystal" className="dashboard__card dashboard__card--active-run">
              <p className="dashboard__card-label">IN MOTION</p>
              <div className="dashboard__active-run">
                <OrbCore state={activeRuns[0].status === "queued" ? "thinking" : "working"} size="small" />
                <div className="dashboard__active-run-info">
                  <p className="dashboard__active-run-title">{activeRuns[0].message}</p>
                  <p className="dashboard__active-run-status">
                    {activeRuns[0].status === "queued" ? "Understanding request" : "Working on it"}
                    {activeRuns.length > 1 && ` · +${activeRuns.length - 1} more`}
                  </p>
                </div>
              </div>
              <Link to={`/?run=${activeRuns[0].id}`} className="dashboard__card-link">
                Return to run →
              </Link>
            </GlassPanel>
          ) : (
            <GlassPanel className="dashboard__card">
              <p className="dashboard__card-label">IN MOTION</p>
              <p className="dashboard__card-value">0</p>
              <p className="dashboard__card-sub">active runs</p>
              <Link to="/" className="dashboard__card-link">
                New request →
              </Link>
            </GlassPanel>
          )}

          <GlassPanel className="dashboard__card">
            <p className="dashboard__card-label">UPCOMING</p>
            <p className="dashboard__card-value">{upcoming.length}</p>
            <p className="dashboard__card-sub">events scheduled</p>
            <Link to="/events" className="dashboard__card-link">
              View all →
            </Link>
          </GlassPanel>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">UPCOMING</h2>
          <div className="dashboard__upcoming">
            {upcoming.map((event) => (
              <Link to={`/events/${event.id}`} key={event.id} className="dashboard__upcoming-item">
                <span>{event.title}</span>
                <span className="dashboard__upcoming-time">{formatTimeRange(event.start_time, event.end_time)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard__section">
        <h2 className="dashboard__section-title">RECENT ORBIT</h2>
        <GlassPanel className="dashboard__activity">
          <ActivityTimeline items={(activity.data ?? []).slice(0, 6)} />
        </GlassPanel>
      </section>
    </div>
  );
}
