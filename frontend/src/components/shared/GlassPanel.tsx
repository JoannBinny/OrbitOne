import type { HTMLAttributes, PointerEvent as ReactPointerEvent } from "react";
import "./GlassPanel.css";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  depth?: "standard" | "crystal";
}

/**
 * Level 2 (standard) / Level 3 (crystal) glass surfaces — frontend.md §7.
 * Includes a pointer-tracked light-sweep reflection on hover (reactbits
 * "GlareHover" concept, re-themed): a radial highlight follows the cursor
 * across the surface via CSS custom properties, restrained to a subtle
 * opacity so it reads as glass, not a spotlight.
 */
export function GlassPanel({ depth = "standard", className, onPointerMove, ...rest }: GlassPanelProps) {
  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--glare-x", `${x}%`);
    e.currentTarget.style.setProperty("--glare-y", `${y}%`);
    onPointerMove?.(e);
  }

  return (
    <div
      className={["glass-panel", `glass-panel--${depth}`, className].filter(Boolean).join(" ")}
      onPointerMove={handlePointerMove}
      {...rest}
    />
  );
}
