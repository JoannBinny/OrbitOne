import { useEffect, useRef } from "react";
import type { AmbientState } from "../../stores/ambientState";

/**
 * "Specter Orb" — the Core's primary internal visual: ghostly energy
 * contained inside a glass-like field.
 *
 * This is a from-scratch, hand-written reinterpretation, not the licensed
 * React Bits Pro "Specter Orb" component. That component ships only through
 * a paid registry (pro.reactbits.dev, $129+, Bearer-token auth via a
 * REACTBITS_LICENSE_KEY) — confirmed live by actually running
 * `npx shadcn add @reactbits-starter/specter-orb-tw` (registry not
 * configured) and then looking up the real install docs, rather than
 * assumed. No license key was available, so — per the same "read the
 * concept, hand-write the visual" pattern already used in this codebase for
 * GlitterWarp/ParticleText (see their doc comments) — this builds the same
 * described visual target (mysterious, spatial, alive, slightly
 * supernatural) natively: 4 soft energy blobs on independent Lissajous
 * paths, additive ("lighter") blend so overlaps glow rather than muddy,
 * cycling through purple / blue-indigo / soft pink — no cyan. Replaces the
 * old OrbParticleSphere (rigid rotating point-cloud) as the Core's primary
 * visual; that component has been removed, not kept alongside this one.
 */

interface Blob {
  freqX: number;
  freqY: number;
  phaseX: number;
  phaseY: number;
  radiusFactor: number;
  colorIndex: number;
  breathePhase: number;
}

const BLOB_COUNT = 4;
// purple, blue-indigo, soft pink, purple-bright — the OrbitOne palette,
// deliberately no cyan.
const BLOB_COLORS = ["139,92,246", "99,102,241", "216,180,254", "167,139,250"];

const SPEED_BY_STATE: Record<AmbientState, number> = {
  idle: 0.00028,
  listening: 0.00046,
  thinking: 0.00075,
  working: 0.0013,
  waiting_for_approval: 0.00034,
  completing: 0.0003,
  complete: 0.0006,
  error: 0.00012,
};

const INTENSITY_BY_STATE: Record<AmbientState, number> = {
  idle: 0.5,
  listening: 0.62,
  thinking: 0.72,
  working: 0.92,
  waiting_for_approval: 0.55,
  completing: 0.6,
  complete: 0.85,
  error: 0.32,
};

function makeBlobs(): Blob[] {
  return Array.from({ length: BLOB_COUNT }, (_, i) => ({
    freqX: 0.7 + Math.random() * 0.6,
    freqY: 0.7 + Math.random() * 0.6,
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    radiusFactor: 0.26 + Math.random() * 0.12,
    colorIndex: i % BLOB_COLORS.length,
    breathePhase: Math.random() * Math.PI * 2,
  }));
}

export function SpecterOrb({ state, approvalAccent }: { state: AmbientState; approvalAccent?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blobs = makeBlobs();
    let t = 0;
    let raf = 0;

    // Measure the parent, not the canvas itself — a <canvas> is a replaced
    // element whose layout box can otherwise fall back to its own
    // width/height attributes, turning self-measurement into a runaway
    // feedback loop. Same lesson as the old OrbParticleSphere; documented
    // here again since that file is gone.
    function measure() {
      const parent = canvas!.parentElement;
      return parent ? parent.getBoundingClientRect() : canvas!.getBoundingClientRect();
    }

    function resize() {
      const rect = measure();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const rect = measure();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) / 2;
      const intensity = INTENSITY_BY_STATE[state] ?? INTENSITY_BY_STATE.idle;

      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      for (const blob of blobs) {
        const bx = cx + Math.sin(t * blob.freqX + blob.phaseX) * radius * 0.42;
        const by = cy + Math.cos(t * blob.freqY + blob.phaseY) * radius * 0.42;
        const breathe = 0.85 + Math.sin(t * 2.2 + blob.breathePhase) * 0.15;
        const r = radius * blob.radiusFactor * breathe;

        const gradient = ctx!.createRadialGradient(bx, by, 0, bx, by, r);
        const [rr, gg, bb] = BLOB_COLORS[blob.colorIndex].split(",");
        gradient.addColorStop(0, `rgba(${rr},${gg},${bb},${0.7 * intensity})`);
        gradient.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);

        ctx!.beginPath();
        ctx!.fillStyle = gradient;
        ctx!.arc(bx, by, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // A subtle amber accent enters the atmosphere while waiting on a
      // human decision — the orb itself must stay purple-dominant, so this
      // is one small, dim accent light, never a hue swap of the whole orb.
      if (approvalAccent) {
        const ax = cx + Math.sin(t * 0.5) * radius * 0.2;
        const ay = cy + Math.cos(t * 0.4) * radius * 0.2;
        const accent = ctx!.createRadialGradient(ax, ay, 0, ax, ay, radius * 0.3);
        accent.addColorStop(0, "rgba(245,158,11,0.22)");
        accent.addColorStop(1, "rgba(245,158,11,0)");
        ctx!.beginPath();
        ctx!.fillStyle = accent;
        ctx!.arc(ax, ay, radius * 0.3, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "source-over";
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    if (!reducedMotion) {
      const tick = () => {
        t += SPEED_BY_STATE[state] ?? SPEED_BY_STATE.idle;
        draw();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [state, approvalAccent]);

  return <canvas ref={canvasRef} className="orb-core__specter" aria-hidden="true" />;
}
