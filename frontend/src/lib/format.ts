export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const day = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTime = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${startTime} → ${endTime}`;
}

/**
 * Backend timestamps (AgentAction.timestamp, Approval.created_at,
 * AgentRun.created_at/updated_at) come from Python's `datetime.utcnow()`,
 * serialized WITHOUT a timezone suffix ("2026-09-11T11:58:08", no "Z").
 * `new Date(...)` parses a bare ISO string like that as LOCAL time, not
 * UTC — for anyone not in UTC this silently shifts every "time ago" by the
 * local offset (e.g. "6h ago" for something that just happened, in IST).
 * Only used for real elapsed-time math; event start/end times are
 * intentionally left alone (see formatDateTime/formatTimeRange) since those
 * represent the schedule's wall-clock intent, not a UTC instant.
 */
function parseUtcTimestamp(iso: string): number {
  const hasTimezone = /Z$|[+-]\d\d:?\d\d$/.test(iso);
  return new Date(hasTimezone ? iso : `${iso}Z`).getTime();
}

export function formatRelativeTime(iso: string): string {
  const then = parseUtcTimestamp(iso);
  const diffMs = Date.now() - then;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

/** Translates raw backend AgentAction.action strings into human-readable copy.
 * Only covers actions the backend actually emits — see orbitone-api-contract.
 * Falls back to the raw action string (with underscores replaced) rather than
 * inventing wording for something unrecognized. */
export function describeActivityAction(action: string): string {
  const map: Record<string, string> = {
    event_created: "Event created",
    task_created: "Task created",
    budget_item_added: "Budget item added",
    approval_requested: "Approval requested",
    approval_approved: "Approval approved",
    approval_rejected: "Approval rejected",
  };
  return map[action] ?? action.replace(/_/g, " ");
}
