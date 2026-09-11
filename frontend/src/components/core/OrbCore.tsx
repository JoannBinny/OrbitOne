import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { StarIcon } from "../shared/StarIcon";
import { SpecterOrb } from "./SpecterOrb";
import type { AmbientState } from "../../stores/ambientState";
import "./OrbCore.css";

interface OrbCoreProps {
  state: AmbientState;
  size?: "hero" | "large" | "medium" | "small";
  /**
   * Pass a shared string (e.g. "new-event-orb") from two places that should
   * feel like the SAME physical orb gliding between them — Motion's
   * layoutId tracks the element's screen position/size across mount/unmount
   * boundaries (even across separate AnimatePresence branches) and
   * interpolates a smooth FLIP transition instead of a cut. Leave unset
   * (default) everywhere else — Dashboard/Approvals/EventOrbit orbs are
   * independent objects, not the same orb moving, and must not accidentally
   * share layout with each other or with New Event's orb.
   */
  layoutId?: string;
}

const PARTICLE_ANGLES = [0, 90, 160, 250];

/**
 * The OrbitOne Core — a floating glass sphere with luminous plasma inside,
 * translucent orbital rings, orbiting particles, and a four-point star
 * center. Each AmbientState changes motion/brightness/particle behavior
 * distinctly, not just "more glow" — see orbitone-frontend-build Phase 3.
 * Pure CSS, no canvas/WebGL, for performance.
 */
export function OrbCore({ state, size = "medium", layoutId }: OrbCoreProps) {
  return (
    <motion.div
      className="orb-core"
      data-state={state}
      data-size={size}
      key={state === "complete" ? "complete-pulse" : undefined}
      layoutId={layoutId}
      layout={!!layoutId}
      transition={layoutId ? { layout: { type: "spring", stiffness: 130, damping: 20, mass: 1 } } : undefined}
      role="img"
      aria-label={`OrbitOne — ${state.replace(/_/g, " ")}`}
    >
      <div className="orb-core__pulse" aria-hidden="true" />
      <div className="orb-core__ring orb-core__ring--outer" />
      <div className="orb-core__ring orb-core__ring--inner" />

      <div className="orb-core__particles" aria-hidden="true">
        {PARTICLE_ANGLES.map((angle) => (
          <span key={angle} className="orb-core__particle" style={{ "--angle": `${angle}deg` } as CSSProperties} />
        ))}
      </div>

      <div className="orb-core__glass">
        <div className="orb-core__plasma" />
        {/* Portal — inner energy/depth: two soft rotating iris rings sitting
            BEHIND the Specter Orb's energy so it reads as "energy existing
            deep inside/behind the glass," not a second graphic stacked next
            to it. Pure CSS (no second canvas) — kept deliberately the
            lowest-priority layer to cut first under perf pressure. */}
        <div className="orb-core__portal orb-core__portal--outer" aria-hidden="true" />
        <div className="orb-core__portal orb-core__portal--inner" aria-hidden="true" />
        <SpecterOrb state={state} approvalAccent={state === "waiting_for_approval"} />
        <div className="orb-core__highlight" aria-hidden="true" />
        <StarIcon size={20} className="orb-core__star" />
        {state === "complete" && <span className="orb-core__sparkle" aria-hidden="true" />}
      </div>
    </motion.div>
  );
}
