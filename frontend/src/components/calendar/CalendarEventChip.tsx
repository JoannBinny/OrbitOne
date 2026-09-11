import { motion } from "motion/react";
import type { Event } from "../../types/api";
import { eventTone } from "../../lib/calendar";
import "./CalendarEventChip.css";

interface CalendarEventChipProps {
  event: Event;
  onSelect: (event: Event) => void;
  compact?: boolean;
}

/** One real event, rendered as a small colored chip. Color comes only from
 * the event's real backend status (see lib/calendar.ts::eventTone) — never
 * fabricated. */
export function CalendarEventChip({ event, onSelect, compact }: CalendarEventChipProps) {
  const time = new Date(event.start_time).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <motion.button
      type="button"
      className="calendar-chip"
      data-tone={eventTone(event.status)}
      data-compact={compact}
      onClick={() => onSelect(event)}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="calendar-chip__dot" aria-hidden="true" />
      {!compact && <span className="calendar-chip__time">{time}</span>}
      <span className="calendar-chip__title">{event.title}</span>
    </motion.button>
  );
}
