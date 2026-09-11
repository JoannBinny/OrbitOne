import { useEffect, useRef } from "react";
import type { AmbientState } from "../../stores/ambientState";

interface Point {
  theta: number;
  phi: number;
  speedFactor: number;
  wobblePhase: number;
  wobbleAmount: number;
}

const POINT_COUNT = 140;

const SPEED_BY_STATE: Record<AmbientState, number> = {
  idle: 0.0018,
  listening: 0.003,
  thinking: 0.005,
  working: 0.009,
  waiting_for_approval: 0.0022,
  completing: 0.002,
  complete: 0.004,
  error: 0.0006,
};

function fibonacciSphere(count: number): Point[] {
  const points: Point[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const theta = goldenAngle * i;
    points.push({
      theta,
      phi: Math.acos(y),
      // Not every particle orbits at the same rate — some drift faster/
      // slower and bob independently, so the sphere reads as many small
      // bodies inside a shell rather than one rigid rotating object.
      speedFactor: 0.65 + Math.random() * 0.7,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleAmount: 0.015 + Math.random() * 0.025,
    });
  }
  return points;
}

/**
 * The Core rendered as a rotating particle sphere (a "miniature universe" —
 * frontend.md §11) rather than a flat gradient, inspired by reactbits.dev
 * pro's "Particle Text" assemble aesthetic applied to a 3D point cloud
 * instead of glyphs. Canvas 2D, ~140 points, capped and paused under
 * prefers-reduced-motion (renders one static frame instead).
 */
export function OrbParticleSphere({ state, amber }: { state: AmbientState; amber?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const points = fibonacciSphere(POINT_COUNT);
    let rotation = 0;
    let raf = 0;

    // Measure the parent, never the canvas's own rect — a canvas is a
    // "replaced element" whose CSS box can fall back to its own width/height
    // attributes if positioning alone doesn't constrain it, which turns
    // self-measurement into a runaway feedback loop (canvas.width feeds
    // getBoundingClientRect() feeds canvas.width...). Measuring the parent
    // sidesteps that class of bug entirely, independent of what CSS does.
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
      const radius = Math.min(w, h) / 2 - 2;

      ctx!.clearRect(0, 0, w, h);

      const projected = points
        .map((p) => {
          const theta = p.theta + rotation * p.speedFactor;
          const phi = p.phi + Math.sin(rotation * 55 + p.wobblePhase) * p.wobbleAmount;
          const x = Math.sin(phi) * Math.cos(theta);
          const y = Math.cos(phi);
          const z = Math.sin(phi) * Math.sin(theta);
          return { x, y, z };
        })
        .sort((a, b) => a.z - b.z);

      for (const pt of projected) {
        const depth = (pt.z + 1) / 2;
        const screenX = cx + pt.x * radius;
        const screenY = cy + pt.y * radius;
        const size = 0.9 + depth * 1.7;
        const alpha = 0.55 + depth * 0.45;

        // Dark halo first so the glint reads against a bright plasma
        // background, then the bright core on top — otherwise a light dot
        // washes out against the near-white plasma hotspot.
        ctx!.beginPath();
        ctx!.arc(screenX, screenY, size + 0.9, 0, Math.PI * 2);
        ctx!.fillStyle = amber ? "rgba(70,40,0,0.45)" : "rgba(30,12,60,0.45)";
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx!.fillStyle = amber ? `rgba(255,214,140,${alpha})` : `rgba(255,255,255,${alpha})`;
        ctx!.fill();
      }
    }

    resize();
    draw();
    window.addEventListener("resize", () => {
      resize();
      draw();
    });

    if (!reducedMotion) {
      const tick = () => {
        rotation += SPEED_BY_STATE[state] ?? SPEED_BY_STATE.idle;
        draw();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [state, amber]);

  return <canvas ref={canvasRef} className="orb-core__particle-sphere" aria-hidden="true" />;
}
