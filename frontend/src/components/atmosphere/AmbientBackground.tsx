import { useEffect, useRef } from "react";
import { useAmbientStore } from "../../stores/ambientState";
import { GlitterWarp } from "./GlitterWarp";
import "./AmbientBackground.css";

/**
 * Level 1: the environment itself. Large, heavily blurred gradients that
 * shift subtly with the ambient state and follow the cursor as a soft local
 * light source. No canvas/WebGL — plain CSS custom properties + transitions,
 * per the performance guidance in orbitone-component-patterns.
 */
export function AmbientBackground() {
  const state = useAmbientStore((s) => s.state);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    function handleMove(e: PointerEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const xPct = (e.clientX / window.innerWidth) * 100;
        const yPct = (e.clientY / window.innerHeight) * 100;
        el.style.setProperty("--cursor-x", `${xPct}%`);
        el.style.setProperty("--cursor-y", `${yPct}%`);
      });
    }
    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="ambient-background" data-ambient-state={state} aria-hidden="true">
      <div className="ambient-blob ambient-blob--a" />
      <div className="ambient-blob ambient-blob--b" />
      <div className="ambient-blob ambient-blob--cursor" />
      <GlitterWarp />
      <div className="ambient-grain" />
    </div>
  );
}
