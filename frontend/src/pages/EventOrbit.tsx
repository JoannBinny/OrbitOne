import { useMemo, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { useEvent, useBudgetTotal } from "../hooks/useEvents";
import { useLocations } from "../hooks/useLocations";
import { useTasks } from "../hooks/useTasks";
import { useApprovals } from "../hooks/useApprovals";
import { useActivity } from "../hooks/useActivity";
import { useOrganization } from "../hooks/useOrganization";
import { OrbCore } from "../components/core/OrbCore";
import { GlassPanel } from "../components/shared/GlassPanel";
import { ActivityTimeline } from "../components/activity/ActivityTimeline";
import { ErrorState } from "../components/shared/ErrorState";
import { formatCurrency, formatTimeRange } from "../lib/format";
import "./EventOrbit.css";

type NodeKey = "location" | "budget" | "tasks" | "approval" | "activity";

interface OrbitNode {
  key: NodeKey;
  label: string;
  glyph: string;
}

export default function EventOrbit() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params.id);
  const [selected, setSelected] = useState<NodeKey | null>(null);
  const { organization } = useOrganization();

  const event = useEvent(eventId);
  const locations = useLocations(organization?.id);
  const tasks = useTasks(eventId);
  const budget = useBudgetTotal(eventId);
  const approvals = useApprovals(undefined, organization?.id);
  const activity = useActivity(eventId);

  const location = locations.data?.find((loc) => loc.id === event.data?.location_id);
  const eventApprovals = (approvals.data ?? []).filter((a) => a.event_id === eventId);

  const nodes = useMemo(() => {
    const list: OrbitNode[] = [];
    if (location) list.push({ key: "location", label: "Location", glyph: "◉" });
    if (budget.data) list.push({ key: "budget", label: "Budget", glyph: "₹" });
    if (tasks.data && tasks.data.length > 0) list.push({ key: "tasks", label: "Tasks", glyph: "✓" });
    if (eventApprovals.length > 0) list.push({ key: "approval", label: "Approval", glyph: "◇" });
    if (activity.data && activity.data.length > 0) list.push({ key: "activity", label: "Activity", glyph: "✦" });
    return list;
  }, [location, budget.data, tasks.data, eventApprovals.length, activity.data]);

  if (event.isError) return <ErrorState error={event.error} onRetry={() => event.refetch()} />;
  if (!event.data) return <p className="event-orbit__loading">Loading orbit…</p>;

  const angleStep = 360 / Math.max(nodes.length, 1);

  return (
    <div className="event-orbit">
      <Link to={`/events/${eventId}`} className="event-orbit__back">
        ← {event.data.title}
      </Link>

      <div className="event-orbit__canvas">
        <div className="event-orbit__center">
          <OrbCore state="idle" size="large" />
          <p className="event-orbit__center-label">{event.data.title}</p>
        </div>

        {nodes.map((node, i) => (
          <motion.button
            key={node.key}
            type="button"
            className="event-orbit__node"
            data-selected={selected === node.key}
            style={{ "--angle": `${angleStep * i}deg` } as CSSProperties}
            onClick={() => setSelected((prev) => (prev === node.key ? null : node.key))}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.08 }}
          >
            <span className="event-orbit__node-glyph">{node.glyph}</span>
            <span className="event-orbit__node-label">{node.label}</span>
          </motion.button>
        ))}
      </div>

      {selected && (
        <GlassPanel depth="crystal" className="event-orbit__detail">
          {selected === "location" && location && (
            <>
              <p className="event-orbit__detail-title">{location.name}</p>
              <p className="event-orbit__detail-meta">
                {location.capacity} seats
                {location.has_computers && " · Computers"}
                {location.has_projector && " · Projector"}
                {location.has_whiteboard && " · Whiteboard"}
                {location.has_microphone && " · Microphone"}
              </p>
            </>
          )}

          {selected === "budget" && budget.data && (
            <>
              <p className="event-orbit__detail-title">{formatCurrency(budget.data.total)}</p>
              {budget.data.threshold != null && (
                <p className="event-orbit__detail-meta">
                  Threshold {formatCurrency(budget.data.threshold)} ·{" "}
                  {budget.data.requires_approval ? "required approval" : "within policy"}
                </p>
              )}
            </>
          )}

          {selected === "tasks" && tasks.data && (
            <>
              <p className="event-orbit__detail-title">{tasks.data.length} tasks</p>
              <ul className="event-orbit__detail-list">
                {tasks.data.map((task) => (
                  <li key={task.id}>
                    {task.status === "done" ? "✓" : "○"} {task.title}
                  </li>
                ))}
              </ul>
            </>
          )}

          {selected === "approval" &&
            eventApprovals.map((approval) => (
              <div key={approval.id}>
                <p className="event-orbit__detail-title">{approval.status}</p>
                <p className="event-orbit__detail-meta">
                  {approval.reason}
                  {approval.amount != null && ` · ${formatCurrency(approval.amount)}`}
                </p>
              </div>
            ))}

          {selected === "activity" && <ActivityTimeline items={activity.data ?? []} />}
        </GlassPanel>
      )}

      <p className="event-orbit__meta">{formatTimeRange(event.data.start_time, event.data.end_time)}</p>
    </div>
  );
}
