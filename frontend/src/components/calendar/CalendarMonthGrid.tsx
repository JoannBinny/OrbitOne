import { motion, AnimatePresence } from "motion/react";
import type { Event } from "../../types/api";
import { WEEKDAY_LABELS, getMonthGrid, groupEventsByDay } from "../../lib/calendar";
import { CalendarEventChip } from "./CalendarEventChip";
import "./CalendarMonthGrid.css";

interface CalendarMonthGridProps {
  year: number;
  month: number;
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onSelectDay: (date: Date) => void;
}

const MAX_VISIBLE_PER_DAY = 3;

/** Desktop month grid. Every event rendered here is real backend data —
 * grouped by real start_time, never invented. */
export function CalendarMonthGrid({ year, month, events, onSelectEvent, onSelectDay }: CalendarMonthGridProps) {
  const weeks = getMonthGrid(year, month);
  const byDay = groupEventsByDay(events);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${year}-${month}`}
        className="calendar-grid"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="calendar-grid__weekdays">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="calendar-grid__weekday">
              {label}
            </span>
          ))}
        </div>

        <div className="calendar-grid__weeks">
          {weeks.map((week) => (
            <div className="calendar-grid__week" key={week[0].key}>
              {week.map((day) => {
                const dayEvents = byDay.get(day.key) ?? [];
                const overflow = dayEvents.length - MAX_VISIBLE_PER_DAY;
                return (
                  <div
                    key={day.key}
                    className="calendar-grid__day"
                    data-in-month={day.inCurrentMonth}
                    data-today={day.isToday}
                  >
                    <button
                      type="button"
                      className="calendar-grid__day-number"
                      onClick={() => onSelectDay(day.date)}
                      aria-label={`View ${day.date.toDateString()}`}
                    >
                      {day.date.getDate()}
                    </button>
                    <div className="calendar-grid__day-events">
                      {dayEvents.slice(0, MAX_VISIBLE_PER_DAY).map((event) => (
                        <CalendarEventChip key={event.id} event={event} onSelect={onSelectEvent} />
                      ))}
                      {overflow > 0 && (
                        <button
                          type="button"
                          className="calendar-grid__overflow"
                          onClick={() => onSelectDay(day.date)}
                        >
                          +{overflow} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
