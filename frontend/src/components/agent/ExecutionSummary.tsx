import { motion } from "motion/react";
import { useEvent, useBudgetTotal } from "../../hooks/useEvents";
import { useLocations } from "../../hooks/useLocations";
import { useTasks } from "../../hooks/useTasks";
import { useApprovals } from "../../hooks/useApprovals";
import { useOrganization } from "../../hooks/useOrganization";
import { StarIcon } from "../shared/StarIcon";
import { ApprovalCard } from "../approvals/ApprovalCard";
import { AgentResultText } from "./AgentResultText";
import { formatCurrency, formatTimeRange } from "../../lib/format";
import "./ExecutionSummary.css";

interface ExecutionSummaryProps {
  eventId: number;
  resultText: string | null;
}

/**
 * Structured "what OrbitOne actually did" summary, built entirely from real
 * backend records (event/location/tasks/budget/approval) — never parsed or
 * inferred from the agent's free-text response. The raw response stays
 * available behind a collapsed disclosure for anyone who wants the detail,
 * but it is not the primary surface. See orbitone-frontend-build Phase 2
 * for why: a wall of agent markdown reads like a chatbot transcript, not
 * an operations result.
 */
export function ExecutionSummary({ eventId, resultText }: ExecutionSummaryProps) {
  const { organization } = useOrganization();
  const event = useEvent(eventId);
  const locations = useLocations(organization?.id);
  const tasks = useTasks(eventId);
  const budget = useBudgetTotal(eventId);
  const approvals = useApprovals(undefined, organization?.id);

  if (!event.data) return null;

  const location = locations.data?.find((loc) => loc.id === event.data.location_id);
  const eventApprovals = (approvals.data ?? []).filter((a) => a.event_id === eventId);
  const pendingApproval = eventApprovals.find((a) => a.status === "pending");
  const decidedApproval = eventApprovals.find((a) => a.status !== "pending");

  // Causal entrance: items settle first (staggered), then budget, then
  // approval/disclosure — mirrors the real order these facts exist in
  // (location/event/tasks come from the run itself, budget is derived,
  // approval is the final gate). Presentation only — nothing here implies
  // backend work happened in this order or faster/slower than it did.
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div className="execution-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p className="execution-summary__headline">
        {pendingApproval ? "I need your approval before I continue." : "Execution complete."}
      </p>

      <motion.div
        className="execution-summary__items"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
      >
        {location && (
          <motion.div className="execution-summary__item" variants={itemVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <StarIcon size={13} className="execution-summary__check" />
            <div>
              <p className="execution-summary__item-label">Location secured</p>
              <p className="execution-summary__item-value">{location.name}</p>
              <p className="execution-summary__item-meta">
                {location.capacity} seats
                {location.has_computers && " · Computers"}
                {location.has_projector && " · Projector"}
                {location.has_whiteboard && " · Whiteboard"}
                {location.has_microphone && " · Microphone"}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div className="execution-summary__item" variants={itemVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <StarIcon size={13} className="execution-summary__check" />
          <div>
            <p className="execution-summary__item-label">Event created</p>
            <p className="execution-summary__item-value">{event.data.title}</p>
            <p className="execution-summary__item-meta">
              {formatTimeRange(event.data.start_time, event.data.end_time)} · {event.data.participants} participants
            </p>
          </div>
        </motion.div>

        {tasks.data && tasks.data.length > 0 && (
          <motion.div className="execution-summary__item" variants={itemVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <StarIcon size={13} className="execution-summary__check" />
            <div>
              <p className="execution-summary__item-label">
                {tasks.data.length} task{tasks.data.length > 1 ? "s" : ""} created
              </p>
              <ul className="execution-summary__task-list">
                {tasks.data.map((task) => (
                  <li key={task.id}>{task.title}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </motion.div>

      {budget.data && (
        <motion.div
          className="execution-summary__budget"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <strong>{formatCurrency(budget.data.total)}</strong>
            {budget.data.threshold != null && (
              <span> · threshold {formatCurrency(budget.data.threshold)}</span>
            )}
          </div>
          {!pendingApproval && (
            <span className="execution-summary__budget-note">
              {decidedApproval ? `Approval ${decidedApproval.status}` : "No approval required"}
            </span>
          )}
        </motion.div>
      )}

      {pendingApproval && (
        <motion.div
          className="execution-summary__approval"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <ApprovalCard approval={pendingApproval} />
        </motion.div>
      )}

      {resultText && (
        <details className="execution-summary__disclosure">
          <summary>Agent response</summary>
          <AgentResultText text={resultText} />
        </details>
      )}
    </motion.div>
  );
}
