import { AnimatePresence, motion } from "motion/react";
import type { AgentAction } from "../../types/api";
import { StarIcon } from "../shared/StarIcon";
import { describeActivityAction } from "../../lib/format";
import "./RunChecklist.css";

interface RunChecklistProps {
  items: AgentAction[];
}

/**
 * Live checklist of real steps OrbitOne has actually completed so far in
 * this run, oldest first. Built from real /activity rows only — no
 * fabricated steps, no percentage/progress-bar invention. Each new real step
 * animates in with a spring pop as it lands.
 */
export function RunChecklist({ items }: RunChecklistProps) {
  const ordered = [...items].reverse();
  return (
    <ul className="run-checklist">
      <AnimatePresence initial={false}>
        {ordered.map((item) => (
          <motion.li
            key={item.id}
            className="run-checklist__item"
            layout
            initial={{ opacity: 0, x: -10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
          >
            <StarIcon size={11} className="run-checklist__mark" />
            <span>{describeActivityAction(item.action)}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
