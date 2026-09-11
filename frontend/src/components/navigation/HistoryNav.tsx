import { useNavigate } from "react-router-dom";
import "./HistoryNav.css";

/** Back/forward controls for in-app navigation history, since this is a spatial
 * environment rather than a conventional page-by-page site. */
export function HistoryNav() {
  const navigate = useNavigate();

  return (
    <div className="history-nav">
      <button type="button" className="history-nav__button" onClick={() => navigate(-1)} aria-label="Go back">
        ‹
      </button>
      <button type="button" className="history-nav__button" onClick={() => navigate(1)} aria-label="Go forward">
        ›
      </button>
    </div>
  );
}
