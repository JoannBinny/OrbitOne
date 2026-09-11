import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { StarIcon } from "../shared/StarIcon";
import { useAmbientStore } from "../../stores/ambientState";
import "./CursorGlow.css";

type CursorMode = "default" | "activity" | "approval" | "success" | "error";

function modeForAmbientState(state: string): CursorMode {
  if (state === "thinking" || state === "working" || state === "listening") return "activity";
  if (state === "waiting_for_approval") return "approval";
  if (state === "complete") return "success";
  if (state === "error") return "error";
  return "default";
}

/**
 * Custom four-point-star cursor. The star IS the cursor identity and stays
 * pixel-exact on the pointer. A soft "Smooth Cursor"-style trail follows
 * behind it: a fixed chain of springs, each one tracking the previous
 * segment's position with progressively softer physics, so the trail tapers
 * smoothly instead of one single lagging blob. This is a from-scratch,
 * hand-built reinterpretation of the concept — the real React Bits Pro
 * "Smooth Cursor" component ships only via a paid pro.reactbits.dev
 * registry (confirmed unavailable this session: `npx shadcn add
 * @reactbits-starter/smooth-cursor-tw` fails with "Unknown registry", and
 * the real registry requires a purchased REACTBITS_LICENSE_KEY — see
 * orbitone-frontend-build). Kept restrained per the brief: purple/lavender,
 * low opacity, blurred, screen-blended, never a thick neon comet.
 *
 * Disabled entirely on coarse/touch pointers so it never interferes with
 * real pointer semantics.
 *
 * Semantic modes reflect the REAL global ambient state (never invented):
 * default (idle/nav) · activity (agent thinking/working — purple halo,
 * stronger glow) · approval (waiting_for_approval — warm amber) · success
 * (a brief pulse the moment a run completes) · error (subdued, dimmer, no
 * aggressive red). Smooth Cursor itself has no notion of these states, so —
 * per the brief — the semantic color stays on the star/halo layer; the
 * trail only inherits a restrained tint per mode.
 */
export function CursorGlow() {
  const starRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const ambientState = useAmbientStore((s) => s.state);
  const mode = modeForAmbientState(ambientState);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Fixed 3-segment chain, softening as it goes — each useSpring call is
  // unconditional and always present, so this respects the rules of hooks
  // while still producing a real tapering trail (segment 3 lags behind
  // segment 2, which lags behind segment 1, which lags behind the pointer).
  const s1x = useSpring(mx, { stiffness: 240, damping: 26, mass: 0.5 });
  const s1y = useSpring(my, { stiffness: 240, damping: 26, mass: 0.5 });
  const s2x = useSpring(s1x, { stiffness: 140, damping: 24, mass: 0.6 });
  const s2y = useSpring(s1y, { stiffness: 140, damping: 24, mass: 0.6 });
  const s3x = useSpring(s2x, { stiffness: 80, damping: 22, mass: 0.7 });
  const s3y = useSpring(s2y, { stiffness: 80, damping: 22, mass: 0.7 });

  const segments = [
    { x: s1x, y: s1y },
    { x: s2x, y: s2y },
    { x: s3x, y: s3y },
  ];

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("has-custom-cursor");
    setActive(true);

    function handleMove(e: PointerEvent) {
      mx.set(e.clientX);
      my.set(e.clientY);
      const el = starRef.current;
      if (el) el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const target = e.target as HTMLElement | null;
      setInteractive(!!target?.closest("button, a, input, textarea, [role='button']"));
    }

    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [mx, my]);

  useEffect(() => {
    if (mode !== "success") return;
    setPulsing(true);
    const timeout = window.setTimeout(() => setPulsing(false), 700);
    return () => window.clearTimeout(timeout);
  }, [mode]);

  if (!active) return null;

  const iconSize = interactive ? 30 : 24;

  return (
    <>
      <div className="cursor-glow__trail-group" data-mode={mode} data-pulsing={pulsing} aria-hidden="true">
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            className="cursor-glow__trail-segment"
            data-index={i}
            style={{ x: seg.x, y: seg.y }}
          />
        ))}
      </div>
      <div ref={starRef} className="cursor-glow" data-interactive={interactive} data-mode={mode} aria-hidden="true">
        <StarIcon
          size={iconSize}
          className="cursor-glow__star"
          style={{ marginTop: -iconSize / 2, marginLeft: -iconSize / 2 }}
        />
      </div>
    </>
  );
}
