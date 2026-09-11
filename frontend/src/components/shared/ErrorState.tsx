import { ApiError } from "../../api/client";
import "./ErrorState.css";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "I couldn't reach the operations system.";
    return error.detail;
  }
  if (error instanceof Error) return error.message;
  return "Something unexpected happened.";
}

/** OrbitOne-voiced error state — never a raw stack trace or generic 500. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <p className="error-state__headline">I couldn't complete that.</p>
      <p className="error-state__detail">{describeError(error)}</p>
      {onRetry && (
        <button type="button" className="error-state__retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
