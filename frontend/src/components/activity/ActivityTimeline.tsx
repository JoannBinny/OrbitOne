import { motion } from "motion/react";
import type { AgentAction } from "../../types/api";
import { StarIcon } from "../shared/StarIcon";
import { EmptyState } from "../shared/EmptyState";
import { describeActivityAction, formatRelativeTime } from "../../lib/format";
import "./ActivityTimeline.css";

interface ActivityTimelineProps {
  items: AgentAction[];
  emptyTitle?: string;
  emptySubtitle?: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export function ActivityTimeline({
  items,
  emptyTitle = "It's quiet here.",
  emptySubtitle = "I'll let you know when something happens.",
}: ActivityTimelineProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return (
    <motion.ol className="activity-timeline" variants={container} initial="hidden" animate="show">
      {items.map((entry) => (
        <motion.li
          key={entry.id}
          className="activity-timeline__item"
          variants={item}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <StarIcon size={12} className="activity-timeline__marker" />
          <div className="activity-timeline__body">
            <div className="activity-timeline__row">
              <span className="activity-timeline__action">{describeActivityAction(entry.action)}</span>
              <span className="activity-timeline__time">{formatRelativeTime(entry.timestamp)}</span>
            </div>
            {entry.details && <p className="activity-timeline__details">{entry.details}</p>}
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
}
