import { NavLink } from "react-router-dom";
import { getRole } from "../utils/auth";

export default function Sidebar() {
  const role = getRole(); // role from login (NGO / Donor / Volunteer / Admin)

  return (
    <div className="sidebar">

      {/* NAVIGATION */}
      <div className="sidebar-nav">
        <NavLink to="/" end className="sidebar-link">
          <span className="sidebar-icon">🏠</span>
          Dashboard
        </NavLink>

        <NavLink to="/listings" className="sidebar-link">
          <span className="sidebar-icon">📦</span>
          Food Listings
        </NavLink>

        <NavLink to="/add" className="sidebar-link">
          <span className="sidebar-icon">➕</span>
          Add Food
        </NavLink>

        <NavLink to="/claims" className="sidebar-link">
          <span className="sidebar-icon">🤝</span>
          My Claims
        </NavLink>
      </div>

      {/* USER FOOTER */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">
          {role ? role.charAt(0).toUpperCase() : "U"}
        </div>

        <div>
          <div style={{ fontWeight: "600" }}>
            Logged User
          </div>

          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            {role || "Guest"}
          </div>
        </div>
      </div>

    </div>
  );
}
