import { useEffect, useRef } from "react";

interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: "purple" | "white";
  twinkleSpeed: number;
  twinklePhase: number;
  tier: "distant" | "foreground";
}

const DISTANT_COUNT = 45;
const FOREGROUND_COUNT = 35;
const WARP_RADIUS = 160;
const WARP_STRENGTH = 46;
const SPRING = 0.06;
const DAMPING = 0.86;

// Parallax depth per tier, in px of offset at viewport edge — approximates
// frontend.md's layers 2 (distant particles, "very small movement") and
// 3+4 (mid/foreground, "slightly stronger"/"more noticeable") within one
// particle system rather than three separate canvases, for performance.
// See orbitone-design-system.
const PARALLAX_DEPTH = { distant: 6, foreground: 16 };

/**
 * A field of glitter particles that warp away from the cursor like a soft
 * gravity distortion, and ease back to their resting position — an
 * interactive interpretation of reactbits.dev's "Glitter Warp" concept
 * (their pro-tier source isn't accessible, so this is a from-scratch
 * re-theme to the OrbitOne purple identity, not a port). Two depth tiers:
 * distant particles barely move and never warp toward the cursor; foreground
 * particles respond to both the warp force and (more strongly) the global
 * parallax offset — real depth, not one flat layer. Canvas 2D, capped
 * particle count, pauses on tab-hidden and respects prefers-reduced-motion —
 * see orbitone-component-patterns §19 on performance.
 */
export function GlitterWarp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let raf = 0;
    let visible = true;

    function makeParticles() {
      const makeTier = (count: number, tier: Particle["tier"]) =>
        Array.from({ length: count }, () => {
          const x = Math.random() * width;
          const y = Math.random() * height;
          return {
            baseX: x,
            baseY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            size: tier === "distant" ? Math.random() * 0.9 + 0.4 : Math.random() * 1.7 + 0.8,
            hue: Math.random() > 0.82 ? "white" : "purple",
            twinkleSpeed: Math.random() * 0.02 + 0.006,
            twinklePhase: Math.random() * Math.PI * 2,
            tier,
          } as Particle;
        });
      particles = [...makeTier(DISTANT_COUNT, "distant"), ...makeTier(FOREGROUND_COUNT, "foreground")];
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    }

    function handleMove(e: PointerEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function handleLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    function handleVisibility() {
      visible = document.visibilityState === "visible";
      if (visible && !reducedMotion) tick();
    }

    let frame = 0;

    function tick() {
      if (!visible) return;
      frame++;
      ctx!.clearRect(0, 0, width, height);

      // Read the shared parallax vars directly (inline style, not
      // getComputedStyle — cheap enough to do once per frame).
      const parallaxX = parseFloat(root.style.getPropertyValue("--parallax-x")) || 0;
      const parallaxY = parseFloat(root.style.getPropertyValue("--parallax-y")) || 0;

      for (const p of particles) {
        if (p.tier === "foreground") {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.hypot(dx, dy);

          if (dist < WARP_RADIUS) {
            const force = (1 - dist / WARP_RADIUS) * WARP_STRENGTH;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 0.02;
            p.vy += Math.sin(angle) * force * 0.02;
          }
        }

        p.vx += (p.baseX - p.x) * SPRING;
        p.vy += (p.baseY - p.y) * SPRING;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        const depth = PARALLAX_DEPTH[p.tier];
        const drawX = p.x + parallaxX * depth;
        const drawY = p.y + parallaxY * depth;

        const twinkle = 0.35 + Math.abs(Math.sin(frame * p.twinkleSpeed + p.twinklePhase)) * 0.5;
        ctx!.beginPath();
        ctx!.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx!.fillStyle =
          p.hue === "white" ? `rgba(255,255,255,${twinkle * 0.8})` : `rgba(167,139,250,${twinkle})`;
        ctx!.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    if (reducedMotion) {
      // Static, no warp/parallax reactivity — still draw once so the layer isn't blank.
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === "white" ? "rgba(255,255,255,0.4)" : "rgba(167,139,250,0.5)";
        ctx.fill();
      }
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="glitter-warp" aria-hidden="true" />;
}
