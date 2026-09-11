import "./StatusPill.css";

export type StatusTone = "neutral" | "purple" | "amber" | "green" | "red";

interface StatusPillProps {
  tone: StatusTone;
  children: React.ReactNode;
}

/** Semantic status indicator. Purple = AI/autonomous, amber = needs you, green = healthy, red = error. */
export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span className="status-pill" data-tone={tone}>
      <span className="status-pill__dot" />
      {children}
    </span>
  );
}
