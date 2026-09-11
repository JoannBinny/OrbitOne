import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { listAvailableLocations } from "../../api/locations";
import { ApiError } from "../../api/client";
import { GlassPanel } from "../shared/GlassPanel";
import "./FindTimePanel.css";

interface FindTimePanelProps {
  organizationId: number;
  onOpenNewEvent: () => void;
}

interface SlotDefinition {
  label: string;
  startHour: number;
  endHour: number;
}

const SLOTS: SlotDefinition[] = [
  { label: "9 – 11 AM", startHour: 9, endHour: 11 },
  { label: "11 AM – 1 PM", startHour: 11, endHour: 13 },
  { label: "2 – 4 PM", startHour: 14, endHour: 16 },
  { label: "4 – 6 PM", startHour: 16, endHour: 18 },
];

interface SlotResult {
  slot: SlotDefinition;
  roomNames: string[];
}

function todayInputValue(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * "Find a time" — every slot shown is backed by a REAL
 * GET /locations/available call for that exact date/time window. No
 * fabricated availability; a slot with zero real rooms simply shows none.
 * This is a small, honest search across a handful of common time blocks —
 * not a full scheduling engine, since the backend has no "find any free
 * slot in a day" endpoint.
 */
export function FindTimePanel({ organizationId, onOpenNewEvent }: FindTimePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [date, setDate] = useState(todayInputValue());
  const [participants, setParticipants] = useState(10);
  const [needsComputers, setNeedsComputers] = useState(false);
  const [needsProjector, setNeedsProjector] = useState(false);
  const [results, setResults] = useState<SlotResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const settled = await Promise.all(
        SLOTS.map(async (slot) => {
          const startTime = `${date}T${String(slot.startHour).padStart(2, "0")}:00:00`;
          const endTime = `${date}T${String(slot.endHour).padStart(2, "0")}:00:00`;
          const rooms = await listAvailableLocations({
            start_time: startTime,
            end_time: endTime,
            organization_id: organizationId,
            min_capacity: participants,
            needs_computers: needsComputers,
            needs_projector: needsProjector,
          });
          return { slot, roomNames: rooms.map((r) => r.name) };
        })
      );
      setResults(settled);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "I couldn't check availability.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="find-time">
      <button type="button" className="find-time__toggle" onClick={() => setExpanded((v) => !v)}>
        ◷ Find a time
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="find-time__panel-wrap"
          >
            <GlassPanel depth="crystal" className="find-time__panel">
              <div className="find-time__row">
                <label className="find-time__field">
                  <span>Date</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label className="find-time__field">
                  <span>Participants</span>
                  <input
                    type="number"
                    min={1}
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value) || 1)}
                  />
                </label>
              </div>

              <div className="find-time__row find-time__row--checks">
                <label className="find-time__check">
                  <input
                    type="checkbox"
                    checked={needsComputers}
                    onChange={(e) => setNeedsComputers(e.target.checked)}
                  />
                  Computers
                </label>
                <label className="find-time__check">
                  <input
                    type="checkbox"
                    checked={needsProjector}
                    onChange={(e) => setNeedsProjector(e.target.checked)}
                  />
                  Projector
                </label>
              </div>

              <button type="button" className="find-time__search" onClick={handleSearch} disabled={loading}>
                {loading ? "Checking real availability…" : "Check availability"}
              </button>

              {error && <p className="find-time__error">{error}</p>}

              {results && (
                <ul className="find-time__results">
                  {results.map(({ slot, roomNames }) => (
                    <li key={slot.label} data-available={roomNames.length > 0}>
                      <span className="find-time__slot-label">{slot.label}</span>
                      {roomNames.length > 0 ? (
                        <span className="find-time__slot-rooms">
                          {roomNames.slice(0, 2).join(", ")}
                          {roomNames.length > 2 && ` +${roomNames.length - 2} more`}
                        </span>
                      ) : (
                        <span className="find-time__slot-empty">No rooms available</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {results && results.some((r) => r.roomNames.length > 0) && (
                <button type="button" className="find-time__use" onClick={onOpenNewEvent}>
                  Organize something for one of these →
                </button>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
