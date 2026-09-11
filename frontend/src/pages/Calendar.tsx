import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { useEvents } from "../hooks/useEvents";
import { useLocations } from "../hooks/useLocations";
import { useApprovals } from "../hooks/useApprovals";
import { useAgentRuns } from "../hooks/useAgentRun";
import { CalendarMonthGrid } from "../components/calendar/CalendarMonthGrid";
import { CalendarAgenda } from "../components/calendar/CalendarAgenda";
import { EventPreviewPanel } from "../components/calendar/EventPreviewPanel";
import { FindTimePanel } from "../components/calendar/FindTimePanel";
import { OrbCore } from "../components/core/OrbCore";
import { ErrorState } from "../components/shared/ErrorState";
import { addMonths, groupEventsByDay } from "../lib/calendar";
import type { Event } from "../types/api";
import type { AmbientState } from "../stores/ambientState";
import "./Calendar.css";

const MONTH_FORMAT: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };

export default function CalendarPage() {
  const navigate = useNavigate();
  const { organization } = useOrganization();
  const events = useEvents(organization?.id);
  const locations = useLocations(organization?.id);
  const approvals = useApprovals(undefined, organization?.id);
  const agentRuns = useAgentRuns(organization?.id);

  const now = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDate, setSelectedDate] = useState(now);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const activeRuns = (agentRuns.data ?? []).filter((r) => r.status === "queued" || r.status === "running");
  const orbState: AmbientState = activeRuns.length === 0 ? "idle" : activeRuns[0].status === "queued" ? "thinking" : "working";

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, MONTH_FORMAT);
  const byDay = useMemo(() => groupEventsByDay(events.data ?? []), [events.data]);

  function goToday() {
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(now);
  }

  // Keeps the mobile week-strip/agenda's selected date inside whatever
  // month the header now shows — otherwise prev/next month only moves the
  // desktop grid (which reads `cursor` directly) while the mobile strip
  // (which reads `selectedDate`) silently stays on the old week.
  function changeMonth(delta: number) {
    const next = addMonths(cursor.year, cursor.month, delta);
    setCursor(next);
    setSelectedDate(new Date(next.year, next.month, 1));
  }

  function handleSelectDay(date: Date) {
    setSelectedDate(date);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  }

  return (
    <div className="calendar-page">
      <header className="calendar-page__header">
        <div className="calendar-page__title-row">
          <div>
            <p className="calendar-page__eyebrow">CALENDAR</p>
            <h1 className="calendar-page__headline">{monthLabel}</h1>
          </div>
          {activeRuns.length > 0 && (
            <div className="calendar-page__orb" title={`${activeRuns.length} run(s) in progress`}>
              <OrbCore state={orbState} size="small" />
            </div>
          )}
        </div>

        <div className="calendar-page__controls">
          <div className="calendar-page__nav">
            <button
              type="button"
              className="calendar-page__nav-btn"
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button type="button" className="calendar-page__today" onClick={goToday}>
              Today
            </button>
            <button
              type="button"
              className="calendar-page__nav-btn"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="calendar-page__actions">
            {organization && (
              <FindTimePanel organizationId={organization.id} onOpenNewEvent={() => navigate("/")} />
            )}
            <Link to="/" className="calendar-page__new">
              + Organize something
            </Link>
          </div>
        </div>
      </header>

      {events.isError ? (
        <ErrorState error={events.error} onRetry={() => events.refetch()} />
      ) : (
        <>
          <CalendarMonthGrid
            year={cursor.year}
            month={cursor.month}
            events={events.data ?? []}
            onSelectEvent={setSelectedEvent}
            onSelectDay={handleSelectDay}
          />
          <CalendarAgenda
            weekAnchor={selectedDate}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            byDay={byDay}
            onSelectEvent={setSelectedEvent}
          />
        </>
      )}

      {selectedEvent && (
        <EventPreviewPanel
          event={selectedEvent}
          locations={locations.data ?? []}
          approvals={approvals.data ?? []}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
