import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import "./ClickSpark.css";

interface Spark {
  id: number;
  x: number;
  y: number;
}

let sparkId = 0;

/**
 * A small four-point spark burst wherever the user clicks (reactbits
 * "ClickSpark" concept, re-themed to the OrbitOne star mark rather than a
 * generic circle). Purely decorative feedback — never gates or represents
 * backend state.
 */
export function ClickSpark() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const handleClick = useCallback((e: MouseEvent) => {
    const id = sparkId++;
    setSparks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    window.setTimeout(() => {
      setSparks((prev) => prev.filter((s) => s.id !== id));
    }, 500);
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  return (
    <div className="click-spark-layer" aria-hidden="true">
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.span
            key={spark.id}
            className="click-spark"
            style={{ left: spark.x, top: spark.y }}
            initial={{ opacity: 1, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
