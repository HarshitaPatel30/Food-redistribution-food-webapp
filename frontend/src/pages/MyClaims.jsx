import { useEffect, useState, useCallback } from "react";
import { fetchAllClaims } from "../utils/api";
import { QRCodeSVG } from "qrcode.react";

const STATUS_COLORS = {
  CLAIMED: { bg: "#dbeafe", color: "#1e40af" },
  VERIFIED: { bg: "#f0fdf4", color: "#166534" },
  CANCELLED: { bg: "#fef2f2", color: "#991b1b" },
};

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllClaims();
      // Sort newest first
      const sorted = [...data].sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt));
      setClaims(sorted);
    } catch {
      setError("Could not load claims. Backend may be offline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="page"><p className="muted" style={{ padding: 24 }}>Loading claims…</p></div>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>All Claims</h1>
          <p className="muted">All food claims with verification status</p>
        </div>
        <button style={styles.refreshBtn} onClick={load}>↻ Refresh</button>
      </div>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {claims.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48 }}>🤝</div>
          <p>No claims yet. Visit <a href="/listings">Listings</a> to claim food.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {claims.map((item, index) => {
            const sc = STATUS_COLORS[item.status] || { bg: "#f3f4f6", color: "#374151" };
            return (
              <div
                key={item.id}
                className="card stagger"
                style={{ ...styles.card, animationDelay: `${index * 0.06}s` }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.claimId}>Claim #{item.id}</div>
                  <span style={{ ...styles.badge, background: sc.bg, color: sc.color }}>
                    {item.verified ? "✅ VERIFIED" : item.status}
                  </span>
                </div>

                <div style={styles.info}>
                  <div>🏢 <strong>{item.ngoName}</strong></div>
                  {item.contactInfo && <div>📧 {item.contactInfo}</div>}
                  <div>📦 Food ID: #{item.foodId}</div>
                  <div>📅 Claimed: {new Date(item.claimedAt).toLocaleString()}</div>
                  {item.verifiedAt && (
                    <div style={{ color: "#166534" }}>✅ Verified: {new Date(item.verifiedAt).toLocaleString()}</div>
                  )}
                </div>

                {/* Show QR token */}
                {item.verificationToken && !item.verified && (
                  <div style={styles.tokenBox}>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>🔑 Verification Token:</div>
                    <div style={styles.tokenText}>{item.verificationToken}</div>
                    <QRImg token={item.verificationToken} />
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                      Scan at delivery to verify
                    </div>
                  </div>
                )}

                {item.verified && (
                  <div style={styles.verifiedBanner}>🎉 Delivery verified!</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QRImg({ token }) {
  return (
    <div style={{ textAlign: "center", marginTop: 8 }}>
      <QRCodeSVG value={token} size={120} level="M" title="Claim verification token" />
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    marginTop: "24px",
  },
  card: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  claimId: { fontWeight: 700, fontSize: 16 },
  badge: {
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    color: "#374151",
  },
  tokenBox: {
    marginTop: 14,
    background: "#f9fafb",
    borderRadius: 10,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  tokenText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#374151",
    wordBreak: "break-all",
    textAlign: "center",
    background: "#e5e7eb",
    padding: "4px 8px",
    borderRadius: 6,
  },
  verifiedBanner: {
    marginTop: 14,
    background: "#f0fdf4",
    color: "#166534",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: "700",
    textAlign: "center",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "10px",
    marginTop: 16,
    fontSize: 14,
  },
  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#6b7280",
  },
  refreshBtn: {
    padding: "8px 18px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    cursor: "pointer",
    fontWeight: 500,
  },
};
