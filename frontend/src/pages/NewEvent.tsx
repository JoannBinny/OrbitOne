import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "../hooks/useOrganization";
import { useStartAgentRun, useAgentRunStatus } from "../hooks/useAgentRun";
import { useActivity } from "../hooks/useActivity";
import { OrbCore } from "../components/core/OrbCore";
import { GlassPanel } from "../components/shared/GlassPanel";
import { RunChecklist } from "../components/agent/RunChecklist";
import { ExecutionSummary } from "../components/agent/ExecutionSummary";
import { AgentResultText } from "../components/agent/AgentResultText";
import { ErrorState } from "../components/shared/ErrorState";
import { ParticleText } from "../components/shared/ParticleText";
import { useAmbientStore } from "../stores/ambientState";
import type { AmbientState } from "../stores/ambientState";
import "./NewEvent.css";

const EXAMPLE = "Organize a cybersecurity workshop for 60 students next Friday from 2 PM to 4 PM. We need computers and a projector.";

export default function NewEvent() {
  const { organization } = useOrganization();
  const [searchParams, setSearchParams] = useSearchParams();
  const runFromUrl = searchParams.get("run");
  const [message, setMessage] = useState("");
  // Real resume, not a fake "return to run" link: Dashboard's active-run
  // surface links to /?run=<id>, and this reads it on mount to pick the
  // real polling back up — no separate global run store needed.
  const [runId, setRunId] = useState<number | null>(runFromUrl ? Number(runFromUrl) : null);
  const startRun = useStartAgentRun();
  const runStatus = useAgentRunStatus(runId);
  const queryClient = useQueryClient();
  const setAmbient = useAmbientStore((s) => s.set);

  const run = runStatus.data;
  // enabled=false until run.event_id is known — GET /activity with no
  // event_id filter returns EVERY event's activity system-wide, which would
  // show unrelated historical steps as if they belonged to this run.
  const liveActivity = useActivity(run?.event_id ?? undefined, run?.status === "running", !!run?.event_id);

  const orbState: AmbientState = !run
    ? "idle"
    : run.status === "queued"
      ? "thinking"
      : run.status === "running"
        ? "working"
        : run.status === "paused_for_approval"
          ? "waiting_for_approval"
          : run.status === "completed"
            ? "complete"
            : "error";

  useEffect(() => {
    setAmbient(orbState);
    return () => setAmbient("idle");
  }, [orbState, setAmbient]);

  useEffect(() => {
    if (
      run?.status === "completed" ||
      run?.status === "paused_for_approval" ||
      run?.status === "rejected"
    ) {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  }, [run?.status, queryClient]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!organization || !message.trim()) return;
    setAmbient("listening");
    const created = await startRun.mutateAsync({ organization_id: organization.id, message: message.trim() });
    setRunId(created.id);
    setSearchParams({ run: String(created.id) }, { replace: true });
  }

  function handleReset() {
    setRunId(null);
    setMessage("");
    setAmbient("idle");
    setSearchParams({}, { replace: true });
  }

  const ORB_LAYOUT_ID = "new-event-orb";

  return (
    <AnimatePresence mode="popLayout">
      {!runId ? (
        <motion.div
          key="hero"
          className="new-event new-event--hero"
          exit={{ opacity: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
        >
          <OrbCore layoutId={ORB_LAYOUT_ID} state="idle" size="hero" />
          <p className="new-event__prompt">WHAT DO YOU NEED TO ORGANIZE?</p>
          <form className="new-event__form" onSubmit={handleSubmit}>
            <textarea
              className="new-event__input"
              placeholder={EXAMPLE}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={!organization}
            />
            <button
              type="submit"
              className="new-event__submit star-border"
              disabled={!organization || !message.trim() || startRun.isPending}
            >
              {startRun.isPending ? "Sending…" : "Let OrbitOne Handle It"}
            </button>
          </form>
          {startRun.isError && <ErrorState error={startRun.error} onRetry={() => startRun.reset()} />}
          {!organization && !startRun.isPending && (
            <p className="new-event__hint">Connecting to the operations system…</p>
          )}
        </motion.div>
      ) : (
        <motion.div key="active" className="new-event new-event--active">
          <div className="new-event__stage">
            <OrbCore layoutId={ORB_LAYOUT_ID} state={orbState} size="hero" />
            {run?.status === "completed" ? (
              <ParticleText text="Got it. I'll take it from here." className="new-event__status" />
            ) : (
              <p className="new-event__status">
                {run?.status === "queued" && "Understanding your request"}
                {run?.status === "running" && "Working on it"}
                {run?.status === "paused_for_approval" && "Waiting on your approval"}
                {run?.status === "rejected" && "Not approved"}
                {run?.status === "failed" && "I couldn't complete that."}
                {!run && "Connecting…"}
              </p>
            )}

            {(run?.status === "queued" || run?.status === "running") && (liveActivity.data?.length ?? 0) > 0 && (
              <div className="new-event__checklist">
                <RunChecklist items={liveActivity.data ?? []} />
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <GlassPanel depth="crystal" className="new-event__result">
              <p className="new-event__request-label">REQUEST</p>
              <p className="new-event__request-text">{run?.message ?? message}</p>

              {run?.status === "failed" && (
                <ErrorState error={new Error(run.error ?? "The agent run failed.")} onRetry={handleReset} />
              )}

              {(run?.status === "completed" ||
                run?.status === "paused_for_approval" ||
                run?.status === "rejected") &&
                run.event_id && <ExecutionSummary eventId={run.event_id} resultText={run.result_text} />}

              {run?.status === "completed" && !run.event_id && (
                <div className="new-event__fallback">
                  <p className="new-event__fallback-note">
                    I couldn't automatically link this run to a specific event, so here's exactly what I did:
                  </p>
                  {run.result_text && <AgentResultText text={run.result_text} />}
                </div>
              )}

              {(run?.status === "completed" || run?.status === "rejected") && (
                <div className="new-event__result-actions">
                  {run.event_id && (
                    <Link to={`/events/${run.event_id}`} className="new-event__view-event">
                      Full event details →
                    </Link>
                  )}
                  <button type="button" className="new-event__again" onClick={handleReset}>
                    New request
                  </button>
                </div>
              )}
            </GlassPanel>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
