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
 * Custom four-point-star cursor with a spring-lagged trailing glow
 * (reactbits "GlowCursor" concept, re-themed to the OrbitOne star/purple
 * identity rather than copied verbatim). The star tip tracks the pointer
 * exactly for precision; only the soft glow behind it lags. Disabled on
 * coarse/touch pointers so it never interferes with real pointer semantics.
 *
 * Semantic modes reflect the REAL global ambient state (never invented):
 * default (idle/nav) · activity (agent thinking/working — purple halo,
 * stronger glow) · approval (waiting_for_approval — warm amber) · success
 * (a brief pulse the moment a run completes) · error (subdued, dimmer, no
 * aggressive red).
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
  const glowX = useSpring(mx, { damping: 24, stiffness: 160, mass: 0.7 });
  const glowY = useSpring(my, { damping: 24, stiffness: 160, mass: 0.7 });

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
      <motion.div
        className="cursor-glow__trail"
        style={{ x: glowX, y: glowY }}
        data-interactive={interactive}
        data-mode={mode}
        data-pulsing={pulsing}
        aria-hidden="true"
      />
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
