import { StarIcon } from "./StarIcon";
import "./EmptyState.css";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <StarIcon size={22} className="empty-state__star" />
      <p className="empty-state__title">{title}</p>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
    </div>
  );
}
