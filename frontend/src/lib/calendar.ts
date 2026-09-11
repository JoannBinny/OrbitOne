import type { Event } from "../types/api";
import type { StatusTone } from "../components/shared/StatusPill";

export interface CalendarDay {
  date: Date;
  key: string;
  inCurrentMonth: boolean;
  isToday: boolean;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Builds the calendar grid for a month as full weeks (Sun-Sat), trimmed to
 * only the weeks actually needed (5 or 6), not a fixed 6 rows every time —
 * matches the restrained, non-generic-SaaS visual goal.
 */
export function getMonthGrid(year: number, month: number): CalendarDay[][] {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset);

  const daysNeeded = startOffset + new Date(year, month + 1, 0).getDate();
  const weekCount = Math.ceil(daysNeeded / 7);

  const today = toDateKey(new Date());
  const weeks: CalendarDay[][] = [];

  for (let w = 0; w < weekCount; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      const key = toDateKey(date);
      week.push({
        date,
        key,
        inCurrentMonth: date.getMonth() === month,
        isToday: key === today,
      });
    }
    weeks.push(week);
  }
  return weeks;
}

/** Buckets real events by their LOCAL calendar date (wall-clock start_time —
 * same convention as formatTimeRange/formatDateTime, not a UTC instant). */
export function groupEventsByDay(events: Event[]): Map<string, Event[]> {
  const map = new Map<string, Event[]>();
  for (const event of events) {
    const key = toDateKey(new Date(event.start_time));
    const bucket = map.get(key);
    if (bucket) bucket.push(event);
    else map.set(key, [event]);
  }
  for (const bucket of map.values()) {
    bucket.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }
  return map;
}

export function dateKey(date: Date): string {
  return toDateKey(date);
}

/**
 * Real backend event status → the existing StatusPill tone vocabulary.
 * No new colors invented: purple = OrbitOne-managed/active (draft — the
 * agent is still handling it), amber = needs_approval, green = confirmed,
 * neutral = cancelled (dimmed, not a new "failure" red — cancellation is a
 * normal outcome, not an error).
 */
export function eventTone(status: string): StatusTone {
  switch (status) {
    case "needs_approval":
      return "amber";
    case "confirmed":
      return "green";
    case "cancelled":
      return "neutral";
    default:
      return "purple";
  }
}

export function eventStatusLabel(status: string): string {
  switch (status) {
    case "needs_approval":
      return "Needs approval";
    case "confirmed":
      return "Confirmed";
    case "cancelled":
      return "Cancelled";
    case "draft":
      return "In progress";
    default:
      return status;
  }
}

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function addWeeks(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta * 7);
  return next;
}

/** The 7 dates (Sun-Sat) of the week containing `date`. */
export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
