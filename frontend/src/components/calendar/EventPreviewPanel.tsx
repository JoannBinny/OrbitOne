import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import type { Event, Approval, Location } from "../../types/api";
import { useTasks } from "../../hooks/useTasks";
import { useBudgetTotal } from "../../hooks/useEvents";
import { GlassPanel } from "../shared/GlassPanel";
import { StatusPill } from "../shared/StatusPill";
import { StarIcon } from "../shared/StarIcon";
import { formatCurrency, formatTimeRange } from "../../lib/format";
import { eventTone, eventStatusLabel } from "../../lib/calendar";
import "./EventPreviewPanel.css";

interface EventPreviewPanelProps {
  event: Event;
  locations: Location[];
  approvals: Approval[];
  onClose: () => void;
}

/** A beautiful glass "quick look" — real data only, materializes on
 * selection, closes on Escape/backdrop click. Never a substitute for the
 * full Event Details screen — "Open Event" always navigates there. */
export function EventPreviewPanel({ event, locations, approvals, onClose }: EventPreviewPanelProps) {
  const tasks = useTasks(event.id);
  const budget = useBudgetTotal(event.id);
  const approval = approvals.find((a) => a.event_id === event.id);
  const location = locations.find((l) => l.id === event.location_id);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="event-preview__backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${event.title} preview`}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <GlassPanel depth="crystal" className="event-preview">
            <div className="event-preview__header">
              <StarIcon size={14} className="event-preview__star" />
              <StatusPill tone={eventTone(event.status)}>{eventStatusLabel(event.status)}</StatusPill>
              <button type="button" className="event-preview__close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>

            <h2 className="event-preview__title">{event.title}</h2>
            <p className="event-preview__time">{formatTimeRange(event.start_time, event.end_time)}</p>

            <div className="event-preview__facts">
              <div className="event-preview__fact">
                <span className="event-preview__fact-label">Participants</span>
                <span className="event-preview__fact-value">{event.participants}</span>
              </div>

              <div className="event-preview__fact">
                <span className="event-preview__fact-label">Location</span>
                <span className="event-preview__fact-value">
                  {location ? location.name : "Not assigned"}
                </span>
                {location && (
                  <span className="event-preview__fact-meta">
                    {location.capacity} seats
                    {location.has_computers && " · Computers"}
                    {location.has_projector && " · Projector"}
                    {location.has_whiteboard && " · Whiteboard"}
                    {location.has_microphone && " · Microphone"}
                  </span>
                )}
              </div>

              {budget.data && (
                <div className="event-preview__fact">
                  <span className="event-preview__fact-label">Budget</span>
                  <span className="event-preview__fact-value">{formatCurrency(budget.data.total)}</span>
                  {budget.data.threshold != null && (
                    <span className="event-preview__fact-meta">threshold {formatCurrency(budget.data.threshold)}</span>
                  )}
                </div>
              )}

              {approval && (
                <div className="event-preview__fact">
                  <span className="event-preview__fact-label">Approval</span>
                  <span className="event-preview__fact-value">{approval.reason}</span>
                  <span className="event-preview__fact-meta">
                    {approval.status}
                    {approval.amount != null && ` · ${formatCurrency(approval.amount)}`}
                  </span>
                </div>
              )}

              {tasks.data && tasks.data.length > 0 && (
                <div className="event-preview__fact">
                  <span className="event-preview__fact-label">Tasks</span>
                  <ul className="event-preview__tasks">
                    {tasks.data.map((task) => (
                      <li key={task.id} data-done={task.status === "done"}>
                        {task.status === "done" ? "✓" : "○"} {task.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link to={`/events/${event.id}`} className="event-preview__open">
              Open Event →
            </Link>
          </GlassPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
