import { NavLink } from "react-router-dom";
import { getRole } from "../utils/auth";

export default function Sidebar() {
  const role = getRole();

  const navItems = [
    { to: "/", label: "Dashboard", icon: "🏠", end: true },
    { to: "/listings", label: "Food Listings", icon: "📦" },
    { to: "/add", label: "Add Food", icon: "➕" },
    { to: "/claims", label: "All Claims", icon: "🤝" },
    { to: "/verify", label: "Verify QR", icon: "📷" },
  ];

  return (
    <div className="sidebar">

      {/* BRAND */}
      <div className="sidebar-brand">
        <h2>🍽️ FoodRescue</h2>
        <span>Real-Time Redistribution</span>
      </div>

      {/* NAVIGATION */}
      <div className="sidebar-nav">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className="sidebar-link">
            <span className="sidebar-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* USER FOOTER */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          {role ? role.charAt(0).toUpperCase() : "U"}
        </div>
        <div>
          <div style={{ fontWeight: "600" }}>Logged User</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>{role || "Guest"}</div>
        </div>
      </div>

    </div>
  );
}
