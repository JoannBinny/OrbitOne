import { Link } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { GlassPanel } from "../components/shared/GlassPanel";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { formatTimeRange } from "../lib/format";
import "./Events.css";

export default function Events() {
  const events = useEvents();

  return (
    <div className="events-page">
      <header className="events-page__header">
        <p className="events-page__eyebrow">EVENTS</p>
        <h1 className="events-page__headline">Everything OrbitOne is organizing.</h1>
      </header>

      {events.isError && <ErrorState error={events.error} onRetry={() => events.refetch()} />}

      {events.isSuccess && events.data.length === 0 && (
        <EmptyState title="Nothing yet." subtitle="Start a new event and I'll take it from here." />
      )}

      <div className="events-page__list">
        {(events.data ?? []).map((event) => (
          <Link to={`/events/${event.id}`} key={event.id} className="events-page__item">
            <GlassPanel className="events-page__card">
              <div>
                <p className="events-page__title">{event.title}</p>
                <p className="events-page__meta">
                  {event.participants} participants · {formatTimeRange(event.start_time, event.end_time)}
                </p>
              </div>
              <span className="events-page__status">{event.status}</span>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
