import { useEffect } from "react";
import { motion } from "motion/react";
import { useApprovals } from "../hooks/useApprovals";
import { ApprovalCard } from "../components/approvals/ApprovalCard";
import { OrbCore } from "../components/core/OrbCore";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { useAmbientStore } from "../stores/ambientState";
import "./Approvals.css";

export default function Approvals() {
  const approvals = useApprovals("pending");
  const setAmbient = useAmbientStore((s) => s.set);
  const hasPending = (approvals.data?.length ?? 0) > 0;

  useEffect(() => {
    setAmbient(hasPending ? "waiting_for_approval" : "idle");
    return () => setAmbient("idle");
  }, [hasPending, setAmbient]);

  return (
    <div className="approvals-page" data-has-pending={hasPending}>
      {hasPending && (
        <motion.div
          className="approvals-page__orb"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <OrbCore state="waiting_for_approval" size="large" />
        </motion.div>
      )}

      <div className="approvals-page__body">
        <header className="approvals-page__header">
          <p className="approvals-page__eyebrow">{hasPending ? "ORBITONE NEEDS YOU" : "APPROVAL REQUIRED"}</p>
          <h1 className="approvals-page__headline">
            {hasPending ? "One decision is ready." : "Nothing needs you."}
          </h1>
        </header>

        {approvals.isError && <ErrorState error={approvals.error} onRetry={() => approvals.refetch()} />}

        {approvals.isSuccess && approvals.data.length === 0 && (
          <EmptyState title="Nothing needs you." subtitle="OrbitOne has everything under control." />
        )}

        <div className="approvals-page__list">
          {(approvals.data ?? []).map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </div>
      </div>
    </div>
  );
}
