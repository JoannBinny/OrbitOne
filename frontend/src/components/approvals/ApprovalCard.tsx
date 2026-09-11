import { useState } from "react";
import { motion } from "motion/react";
import type { Approval } from "../../types/api";
import { GlassPanel } from "../shared/GlassPanel";
import { StatusPill } from "../shared/StatusPill";
import { StarIcon } from "../shared/StarIcon";
import { formatCurrency, formatRelativeTime } from "../../lib/format";
import { useApproveApproval, useRejectApproval } from "../../hooks/useApprovals";
import { useEvent, useBudgetTotal } from "../../hooks/useEvents";
import { useAmbientStore } from "../../stores/ambientState";
import "./ApprovalCard.css";

interface ApprovalCardProps {
  approval: Approval;
}

/**
 * Approving/rejecting has real choreography: the card visually compresses
 * and the orb (via global ambient state) shifts into a focused "completing"
 * look WHILE the real request is in flight — never before it, never faked if
 * the request fails. The final state (approved/rejected/error) always comes
 * from the actual backend response, not from the animation.
 */
export function ApprovalCard({ approval }: ApprovalCardProps) {
  const { data: event } = useEvent(approval.event_id);
  const { data: budget } = useBudgetTotal(approval.event_id);
  const approve = useApproveApproval();
  const reject = useRejectApproval();
  const setAmbient = useAmbientStore((s) => s.set);
  const [actionError, setActionError] = useState<string | null>(null);

  const busy = approve.isPending || reject.isPending;
  const isPending = approval.status === "pending";

  async function handleApprove() {
    setActionError(null);
    setAmbient("completing");
    try {
      await approve.mutateAsync(approval.id);
      setAmbient("complete");
    } catch (err) {
      setAmbient("error");
      setActionError(err instanceof Error ? err.message : "I couldn't complete that.");
    }
  }

  async function handleReject() {
    setActionError(null);
    setAmbient("completing");
    try {
      await reject.mutateAsync(approval.id);
      setAmbient("idle");
    } catch (err) {
      setAmbient("error");
      setActionError(err instanceof Error ? err.message : "I couldn't complete that.");
    }
  }

  return (
    <motion.div layout animate={{ scale: busy ? 0.98 : 1 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
      <GlassPanel depth="crystal" className="approval-card" data-processing={busy}>
        <div className="approval-card__header">
          <span className="approval-card__title">{event?.title ?? `Event #${approval.event_id}`}</span>
          <StatusPill
            tone={approval.status === "approved" ? "green" : approval.status === "rejected" ? "neutral" : "amber"}
          >
            {busy ? (approve.isPending ? "approving" : "declining") : approval.status}
          </StatusPill>
        </div>

        <p className="approval-card__reason">{approval.reason}</p>

        {approval.amount != null && (
          <div className="approval-card__amount">
            <span>Estimated cost</span>
            <strong>{formatCurrency(approval.amount)}</strong>
          </div>
        )}

        {budget?.threshold != null && (
          <p className="approval-card__threshold">
            Organization threshold {formatCurrency(budget.threshold)} — exceeded by{" "}
            {formatCurrency((approval.amount ?? budget.total) - budget.threshold)}
          </p>
        )}

        <p className="approval-card__meta">Requested {formatRelativeTime(approval.created_at)}</p>

        {actionError && <p className="approval-card__error">{actionError}</p>}

        {isPending && (
          <div className="approval-card__actions">
            <button type="button" className="approval-card__decline" onClick={handleReject} disabled={busy}>
              {reject.isPending ? "Declining…" : "Decline"}
            </button>
            <button type="button" className="approval-card__approve" onClick={handleApprove} disabled={busy}>
              {busy && <StarIcon size={12} className="approval-card__approve-spin" />}
              {approve.isPending ? "Approving…" : "Approve"}
            </button>
          </div>
        )}
      </GlassPanel>
    </motion.div>
  );
}
