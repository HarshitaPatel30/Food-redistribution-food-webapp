import { useEffect, useState } from "react";

export default function MyClaims() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("claims")) || [];
    setClaims(saved);
  }, []);

  const updateStatus = (id, newStatus) => {
    const updated = claims.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setClaims(updated);
    localStorage.setItem("claims", JSON.stringify(updated));
  };

  return (
    <div className="page">
      <h1>My Claims</h1>
      <p>Track the food you have claimed</p>

      {claims.length === 0 ? (
        <p>No claimed food yet.</p>
      ) : (
        <div style={styles.grid}>
          {claims.map((item, index) => (
            <div
              key={item.id}
              className="card stagger"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <h3>{item.name}</h3>
              <p>🍽 {item.quantity}</p>
              <p>📦 {item.category}</p>
              <p>📍 {item.location}</p>
              <p>⏰ {item.expiry}</p>

              <span style={{ ...styles.badge, ...statusColor(item.status) }}>
                {item.status}
              </span>

              <div style={styles.actions}>
                {item.status === "Claimed" && (
                  <button
                    className="btn"
                    onClick={() => updateStatus(item.id, "Picked Up")}
                  >
                    Mark Picked
                  </button>
                )}

                {item.status === "Picked Up" && (
                  <button
                    className="btn"
                    onClick={() => updateStatus(item.id, "Delivered")}
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const statusColor = (status) => {
  if (status === "Delivered") return { background: "#e6fffa", color: "#065f46" };
  if (status === "Picked Up") return { background: "#fff7ed", color: "#9a3412" };
  return { background: "#ffe6dc", color: "#ff6b35" };
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginTop: "24px"
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "10px"
  },
  actions: {
    marginTop: "14px"
  }
};
