import { useEffect } from "react";

/**
 * Sets two CSS custom properties on the document root — `--parallax-x` and
 * `--parallax-y`, normalized to roughly [-1, 1] from viewport center — that
 * any layer anywhere in the app can read to offset itself by a DIFFERENT
 * amount, creating real depth instead of one blob following the cursor.
 * Mounted once (AppLayout) rather than duplicated per component.
 *
 * A layer opts in with plain CSS:
 *   transform: translate(calc(var(--parallax-x, 0) * 4px), calc(var(--parallax-y, 0) * 4px));
 * — a small multiplier (px) reads as "close/responsive", a large one as
 * "distant/still". See orbitone-design-system for the layer/depth table.
 *
 * rAF-throttled (never more than once per frame), skipped entirely under
 * prefers-reduced-motion (vars stay at 0 — every layer's calc() collapses to
 * no offset, so nothing needs its own reduced-motion check).
 */
export function useParallaxPointer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;

    function apply() {
      raf = 0;
      root.style.setProperty("--parallax-x", pendingX.toFixed(4));
      root.style.setProperty("--parallax-y", pendingY.toFixed(4));
    }

    function handleMove(e: PointerEvent) {
      pendingX = (e.clientX / window.innerWidth) * 2 - 1;
      pendingY = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    }

    window.addEventListener("pointermove", handleMove);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      if (raf) cancelAnimationFrame(raf);
      root.style.removeProperty("--parallax-x");
      root.style.removeProperty("--parallax-y");
    };
  }, []);
}
