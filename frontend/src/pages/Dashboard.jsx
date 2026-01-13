import { useEffect, useState } from "react";
import { getListings, getClaims } from "../utils/data";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    setListings(getListings());
    setClaims(getClaims());
  }, []);

  const urgent = listings.filter(l => l.expiry.includes("min"));
  const delivered = claims.filter(c => c.status === "Delivered");

  return (
    <div className="page">
      <div className="dashboard-container">

        {/* HEADER */}
        <div>
          <div className="dashboard-title">Welcome back 👋</div>
          <div className="dashboard-subtitle">
            Here’s what’s happening in food redistribution today
          </div>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <Stat icon="📦" value={listings.length} label="Available Food" />
          <Stat icon="⏱" value={urgent.length} label="Urgent Pickups" urgent />
          <Stat icon="🍽" value={delivered.length} label="Meals Delivered" />
          <Stat icon="🤝" value={claims.length} label="Active Claims" />
        </div>

        {/* PANELS */}
        <div className="dashboard-panels">

          {/* URGENT */}
          <div className="panel">
            <div className="panel-title">⏰ Urgent Pickups</div>

            {urgent.length === 0 ? (
              <p>No urgent food right now</p>
            ) : urgent.map((u, i) => (
              <div key={i} className="urgent-item">
                <span>{u.name}</span>
                <span className="urgent-badge">{u.expiry}</span>
              </div>
            ))}
          </div>

          {/* ACTIVITY */}
          <div className="panel">
            <div className="panel-title">📢 Recent Activity</div>

            {claims.length === 0 ? (
              <p>No recent activity</p>
            ) : claims.slice(0, 5).map((c, i) => (
              <div key={i} className="activity-item">
                {c.name} • {c.status}
              </div>
            ))}
          </div>

        </div>

        {/* ACTIONS */}
       <div className="action-cards">

  <Link to="/add" style={{ textDecoration: "none" }}>
    <div className="action-card action-primary">
      <div className="action-icon">➕</div>
      <div className="action-text">
        <h4>Add Food</h4>
        <p>Create a new food listing</p>
      </div>
    </div>
  </Link>

  <Link to="/listings" style={{ textDecoration: "none" }}>
    <div className="action-card">
      <div className="action-icon">📦</div>
      <div className="action-text">
        <h4>View Listings</h4>
        <p>See available food near you</p>
      </div>
    </div>
  </Link>

  <Link to="/claims" style={{ textDecoration: "none" }}>
    <div className="action-card">
      <div className="action-icon">🤝</div>
      <div className="action-text">
        <h4>My Claims</h4>
        <p>Track claimed food status</p>
      </div>
    </div>
  </Link>

</div>


      </div>
    </div>
  );
}

function Stat({ icon, value, label, urgent }) {
  return (
    <div className={`stat-card ${urgent ? "stat-urgent" : ""}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
