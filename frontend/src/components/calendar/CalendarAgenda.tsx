import { motion } from "motion/react";
import type { Event } from "../../types/api";
import { dateKey, getWeekDays } from "../../lib/calendar";
import { CalendarEventChip } from "./CalendarEventChip";
import { EmptyState } from "../shared/EmptyState";
import "./CalendarAgenda.css";

interface CalendarAgendaProps {
  weekAnchor: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  byDay: Map<string, Event[]>;
  onSelectEvent: (event: Event) => void;
}

/**
 * Mobile/narrow-viewport view: a compact horizontally-laid-out week strip
 * plus a real agenda list for the selected day underneath, instead of
 * squeezing an unreadable month grid onto a small screen.
 */
export function CalendarAgenda({ weekAnchor, selectedDate, onSelectDate, byDay, onSelectEvent }: CalendarAgendaProps) {
  const days = getWeekDays(weekAnchor);
  const selectedKey = dateKey(selectedDate);
  const dayEvents = byDay.get(selectedKey) ?? [];
  const today = dateKey(new Date());

  return (
    <div className="calendar-agenda">
      <div className="calendar-agenda__strip">
        {days.map((day) => {
          const key = dateKey(day);
          const count = (byDay.get(key) ?? []).length;
          return (
            <button
              type="button"
              key={key}
              className="calendar-agenda__strip-day"
              data-selected={key === selectedKey}
              data-today={key === today}
              onClick={() => onSelectDate(day)}
            >
              <span className="calendar-agenda__strip-weekday">
                {day.toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
              <span className="calendar-agenda__strip-number">{day.getDate()}</span>
              {count > 0 && <span className="calendar-agenda__strip-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <motion.div
        key={selectedKey}
        className="calendar-agenda__list"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        {dayEvents.length === 0 ? (
          <EmptyState title="Nothing scheduled." subtitle="This day is open." />
        ) : (
          dayEvents.map((event) => (
            <CalendarEventChip key={event.id} event={event} onSelect={onSelectEvent} />
          ))
        )}
      </motion.div>
    </div>
  );
}
