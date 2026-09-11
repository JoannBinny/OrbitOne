import { NavLink } from "react-router-dom";
import { useState } from "react";
import { StarIcon } from "../shared/StarIcon";
import { useApprovals } from "../../hooks/useApprovals";
import { useOrganization } from "../../hooks/useOrganization";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "New Event", glyph: "✦", end: true },
  { to: "/dashboard", label: "Overview", glyph: "◉" },
  { to: "/events", label: "Events", glyph: "◌" },
  { to: "/tasks", label: "Tasks", glyph: "✓" },
  { to: "/approvals", label: "Approvals", glyph: "◇" },
  { to: "/calendar", label: "Calendar", glyph: "◷" },
  { to: "/activity", label: "Orbit", glyph: "✦" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [logoSpinning, setLogoSpinning] = useState(false);
  const { organization } = useOrganization();
  const { data: pending } = useApprovals("pending", organization?.id);
  const pendingCount = pending?.length ?? 0;

  function handleLogoClick() {
    setLogoSpinning(true);
    window.setTimeout(() => setLogoSpinning(false), 800);
  }

  return (
    <aside className="sidebar" data-collapsed={collapsed}>
      <button type="button" className="sidebar__brand" onClick={handleLogoClick} data-spinning={logoSpinning}>
        <StarIcon size={18} className="sidebar__brand-star" />
        {!collapsed && <span>ORBITONE</span>}
      </button>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar__item${isActive ? " sidebar__item--active" : ""}`}
          >
            <span className="sidebar__glyph" aria-hidden="true">
              {item.glyph}
            </span>
            {!collapsed && <span className="sidebar__label">{item.label}</span>}
            {item.to === "/approvals" && pendingCount > 0 && (
              <span className="sidebar__badge">{pendingCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar__collapse"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {collapsed ? "»" : "«"}
      </button>
    </aside>
  );
}
