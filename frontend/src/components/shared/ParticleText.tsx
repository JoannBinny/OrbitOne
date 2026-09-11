import { useEffect, useRef, useState } from "react";
import "./ParticleText.css";

interface ParticleTextProps {
  text: string;
  className?: string;
  color?: string;
}

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
}

const MAX_PARTICLES = 360;
const SAMPLE_STRIDE = 3;

/**
 * A headline that assembles itself from scattered particles into real text
 * (from-scratch interpretation of reactbits.dev pro's "Particle Text"
 * concept — their source isn't accessible without a pro account, so this is
 * built independently, not ported). The real text stays in the DOM
 * (visually hidden, not display:none) for accessibility/SEO; the canvas is
 * a decorative overlay. Skips the animation entirely under
 * prefers-reduced-motion — text just renders normally.
 */
export function ParticleText({ text, className, color = "#f5f3ff" }: ParticleTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (reducedMotion) return;
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !textEl || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    let frame = 0;
    const settleFrame = 60;

    function setup() {
      const rect = textEl!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);

      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const style = window.getComputedStyle(textEl!);
      const sample = document.createElement("canvas");
      sample.width = width;
      sample.height = height;
      const sctx = sample.getContext("2d")!;
      sctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      sctx.textBaseline = "middle";
      sctx.fillStyle = "#fff";
      sctx.fillText(text, 0, height / 2);

      const data = sctx.getImageData(0, 0, width, height).data;
      const targets: { x: number; y: number }[] = [];
      for (let y = 0; y < height; y += SAMPLE_STRIDE) {
        for (let x = 0; x < width; x += SAMPLE_STRIDE) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 120) targets.push({ x, y });
        }
      }

      const picked =
        targets.length > MAX_PARTICLES
          ? targets.sort(() => Math.random() - 0.5).slice(0, MAX_PARTICLES)
          : targets;

      particles = picked.map((t) => ({
        x: Math.random() * width,
        y: height + Math.random() * 40,
        tx: t.x,
        ty: t.y,
        vx: 0,
        vy: 0,
      }));
      frame = 0;
    }

    function tick() {
      const rect = textEl!.getBoundingClientRect();
      ctx!.clearRect(0, 0, rect.width, rect.height);
      frame++;
      const progress = Math.min(frame / settleFrame, 1);
      const spring = 0.05 + progress * 0.12;

      for (const p of particles) {
        p.vx += (p.tx - p.x) * spring;
        p.vy += (p.ty - p.y) * spring;
        p.vx *= 0.78;
        p.vy *= 0.78;
        p.x += p.vx;
        p.y += p.vy;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.fill();
      }

      if (frame < settleFrame + 40) {
        raf = requestAnimationFrame(tick);
      }
    }

    setup();
    raf = requestAnimationFrame(tick);
    const handleResize = () => setup();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [text, color, reducedMotion]);

  return (
    <div ref={wrapRef} className={["particle-text", className].filter(Boolean).join(" ")}>
      <span ref={textRef} className="particle-text__real" data-hidden={!reducedMotion}>
        {text}
      </span>
      {!reducedMotion && <canvas ref={canvasRef} className="particle-text__canvas" aria-hidden="true" />}
    </div>
  );
}
