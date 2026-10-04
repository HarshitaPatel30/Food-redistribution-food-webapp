import { useEffect, useState, useCallback } from "react";
import { fetchDashboardStats, fetchAllListings } from "../utils/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, listings] = await Promise.all([
        fetchDashboardStats(),
        fetchAllListings(),
      ]);
      setStats(s);
      // Show 5 most recent listings
      const sorted = [...listings].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentListings(sorted.slice(0, 5));
    } catch {
      setError("Backend unavailable. Start the Spring Boot server on port 8085.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="page"><div className="dashboard-container"><p className="muted">Loading dashboard…</p></div></div>;

  if (error) return (
    <div className="page">
      <div className="dashboard-container">
        <div style={styles.errorBanner}>⚠️ {error}</div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="dashboard-container">

        {/* HEADER */}
        <div>
          <div className="dashboard-title">Welcome back 👋</div>
          <div className="dashboard-subtitle">
            Here's what's happening in food redistribution today
          </div>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <Stat icon="📦" value={stats?.availableListings ?? 0} label="Available" />
          <Stat icon="🤝" value={stats?.claimedListings ?? 0} label="Claimed" />
          <Stat icon="⏰" value={stats?.expiredListings ?? 0} label="Expired" urgent />
          <Stat icon="✅" value={stats?.verifiedClaims ?? 0} label="Verified Deliveries" />
        </div>

        {/* PANELS */}
        <div className="dashboard-panels">

          {/* RECENT LISTINGS */}
          <div className="panel">
            <div className="panel-title">📋 Recent Listings</div>
            {recentListings.length === 0 ? (
              <p className="muted">No listings yet. <Link to="/add">Add one!</Link></p>
            ) : recentListings.map((l) => (
              <div key={l.id} className="urgent-item">
                <span>{l.foodName} — {l.donorName}</span>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>

          {/* SUMMARY COUNTS */}
          <div className="panel">
            <div className="panel-title">📊 Platform Summary</div>
            <div className="activity-item">Total listings: <strong>{stats?.totalListings ?? 0}</strong></div>
            <div className="activity-item">Total claims: <strong>{stats?.totalClaims ?? 0}</strong></div>
            <div className="activity-item">Delivered &amp; verified: <strong>{stats?.verifiedClaims ?? 0}</strong></div>
            <div className="activity-item">Expired without claim: <strong>{stats?.expiredListings ?? 0}</strong></div>
          </div>

        </div>

        {/* WORKFLOW EXPLANATION */}
        <div style={styles.workflow}>
          <div style={styles.workflowTitle}>📌 How it works</div>
          <div style={styles.workflowSteps}>
            {[
              { step: "1", label: "Donor adds food listing" },
              { step: "2", label: "NGO claims available food" },
              { step: "3", label: "QR code generated for claim" },
              { step: "4", label: "Scan QR to verify delivery" },
            ].map(({ step, label }) => (
              <div key={step} style={styles.workflowStep}>
                <div style={styles.stepNum}>{step}</div>
                <div style={styles.stepLabel}>{label}</div>
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

          <Link to="/verify" style={{ textDecoration: "none" }}>
            <div className="action-card">
              <div className="action-icon">📷</div>
              <div className="action-text">
                <h4>Verify QR</h4>
                <p>Verify delivery by QR code</p>
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

function StatusBadge({ status }) {
  const colorMap = {
    AVAILABLE: { bg: "#d1fae5", color: "#065f46" },
    CLAIMED: { bg: "#dbeafe", color: "#1e40af" },
    EXPIRED: { bg: "#fee2e2", color: "#991b1b" },
    DELIVERED: { bg: "#f3e8ff", color: "#6b21a8" },
    VERIFIED: { bg: "#f0fdf4", color: "#166534" },
  };
  const c = colorMap[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "3px 10px", borderRadius: "10px",
      fontSize: "12px", fontWeight: "600"
    }}>
      {status}
    </span>
  );
}

const styles = {
  errorBanner: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "16px 20px",
    borderRadius: "12px",
    marginTop: "20px"
  },
  workflow: {
    background: "linear-gradient(135deg, #fff7ed, #fff)",
    border: "1px solid #fed7aa",
    borderRadius: "18px",
    padding: "24px",
    marginTop: "28px"
  },
  workflowTitle: {
    fontWeight: "700",
    fontSize: "17px",
    marginBottom: "18px"
  },
  workflowSteps: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  },
  workflowStep: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: "1 1 180px"
  },
  stepNum: {
    background: "#ff6b35",
    color: "white",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0
  },
  stepLabel: {
    fontSize: "14px",
    color: "#374151"
  }
};
