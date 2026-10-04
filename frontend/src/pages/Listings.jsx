import { useEffect, useState, useCallback } from "react";
import { fetchAllListings, createClaim } from "../utils/api";
import { getRole } from "../utils/auth";
import { QRCodeSVG } from "qrcode.react";

const STATUS_COLORS = {
  AVAILABLE: { bg: "#d1fae5", color: "#065f46" },
  CLAIMED: { bg: "#dbeafe", color: "#1e40af" },
  EXPIRED: { bg: "#fee2e2", color: "#991b1b" },
  DELIVERED: { bg: "#f3e8ff", color: "#6b21a8" },
  VERIFIED: { bg: "#f0fdf4", color: "#166534" },
};

export default function Listings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimModal, setClaimModal] = useState(null); // { listing }
  const [claimForm, setClaimForm] = useState({ ngoName: "", contactInfo: "" });
  const [claimResult, setClaimResult] = useState(null); // { claim, qrToken }
  const [claimError, setClaimError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const role = getRole();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllListings();
      setItems(data);
    } catch {
      setError("Could not load listings. Backend may be offline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openClaim = (listing) => {
    setClaimModal(listing);
    setClaimForm({ ngoName: "", contactInfo: "" });
    setClaimError(null);
    setClaimResult(null);
  };

  const closeClaim = () => {
    setClaimModal(null);
    setClaimResult(null);
    setClaimError(null);
    load(); // refresh list
  };

  const submitClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.ngoName.trim()) { setClaimError("NGO name is required"); return; }
    setSubmitting(true);
    setClaimError(null);
    try {
      const claim = await createClaim({
        foodId: claimModal.id,
        ngoName: claimForm.ngoName,
        contactInfo: claimForm.contactInfo,
      });
      setClaimResult(claim);
      // Update item in list locally
      setItems(prev => prev.map(i => i.id === claimModal.id ? { ...i, status: "CLAIMED" } : i));
    } catch (e) {
      setClaimError(e.message || "Failed to claim listing");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === "ALL" ? items : items.filter(i => i.status === filter);

  const isExpired = (listing) => new Date(listing.expiryTime) < new Date();

  if (loading) return <div className="page"><p className="muted" style={{ padding: 24 }}>Loading listings…</p></div>;

  return (
    <div className="page">
      <h1>Available Food Listings</h1>
      <p className="muted">Surplus food available for redistribution</p>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        {["ALL", "AVAILABLE", "CLAIMED", "EXPIRED", "DELIVERED"].map(f => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
        <button style={styles.refreshBtn} onClick={load}>↻ Refresh</button>
      </div>

      {filtered.length === 0 ? (
        <p className="muted" style={{ marginTop: 24 }}>No listings match the selected filter.</p>
      ) : (
        <div style={styles.grid}>
          {filtered.map(item => {
            const expired = isExpired(item);
            const claimable = item.status === "AVAILABLE" && !expired;
            const statusColors = STATUS_COLORS[item.status] || {};
            return (
              <div key={item.id} style={{
                ...styles.card,
                opacity: item.status === "EXPIRED" ? 0.7 : 1,
                border: claimable ? "2px solid #d1fae5" : "2px solid #f3f4f6"
              }}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.foodName}>{item.foodName}</h3>
                  <span style={{ ...styles.badge, background: statusColors.bg, color: statusColors.color }}>
                    {item.status}
                  </span>
                </div>

                {item.description && <p style={styles.desc}>{item.description}</p>}

                <div style={styles.meta}>
                  <div>👤 <strong>{item.donorName}</strong></div>
                  <div>🍽️ Qty: <strong>{item.quantity}</strong></div>
                  <div>📦 {item.category}</div>
                  <div>📍 {item.location}</div>
                  <div style={{ color: expired ? "#991b1b" : "#065f46" }}>
                    ⏰ Expires: {new Date(item.expiryTime).toLocaleString()}
                    {expired && item.status === "AVAILABLE" && " (EXPIRED)"}
                  </div>
                  <div className="muted">Added: {new Date(item.createdAt).toLocaleDateString()}</div>
                </div>

                {claimable && (role === "NGO" || role === "Volunteer" || role === "Admin") && (
                  <button style={styles.claimBtn} onClick={() => openClaim(item)}>
                    🤝 Claim This Food
                  </button>
                )}

                {!claimable && item.status === "AVAILABLE" && expired && (
                  <div style={styles.expiredNote}>⛔ Expired — cannot be claimed</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CLAIM MODAL */}
      {claimModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {!claimResult ? (
              <>
                <h2 style={{ marginTop: 0 }}>Claim: {claimModal.foodName}</h2>
                <p className="muted">Submit your details to claim this food listing.</p>
                {claimError && <div style={styles.error}>{claimError}</div>}
                <form onSubmit={submitClaim}>
                  <div style={styles.formGroup}>
                    <label>NGO / Organisation Name *</label>
                    <input
                      type="text"
                      value={claimForm.ngoName}
                      onChange={e => setClaimForm(f => ({ ...f, ngoName: e.target.value }))}
                      placeholder="e.g. Hope Foundation"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Contact Info</label>
                    <input
                      type="text"
                      value={claimForm.contactInfo}
                      onChange={e => setClaimForm(f => ({ ...f, contactInfo: e.target.value }))}
                      placeholder="Email or phone"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                    <button type="submit" style={styles.claimBtn} disabled={submitting}>
                      {submitting ? "Submitting…" : "✅ Submit Claim"}
                    </button>
                    <button type="button" style={styles.cancelBtn} onClick={closeClaim}>Cancel</button>
                  </div>
                </form>
              </>
            ) : (
              /* SUCCESS: show QR */
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>🎉</div>
                <h2>Claim Successful!</h2>
                <p className="muted">Your claim has been registered. Use the QR code below to verify delivery.</p>
                <div style={styles.qrBox}>
                  <div style={styles.qrLabel}>Verification Token:</div>
                  <div style={styles.tokenText}>{claimResult.verificationToken}</div>
                  <QRCodeDisplay token={claimResult.verificationToken} />
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 10 }}>
                    Scan this QR code at delivery time to verify. Token ID: #{claimResult.id}
                  </p>
                </div>
                <button style={styles.claimBtn} onClick={closeClaim}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QRCodeDisplay({ token }) {
  return (
    <div style={{ margin: "16px auto", width: 180 }}>
      <QRCodeSVG value={token} size={180} level="M" title="Claim verification token" />
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
    transition: "transform 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  foodName: { margin: 0, fontSize: 18 },
  badge: {
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
  },
  desc: { color: "#6b7280", fontSize: 14, marginBottom: 10 },
  meta: { display: "flex", flexDirection: "column", gap: 6, fontSize: 14 },
  claimBtn: {
    marginTop: 14,
    background: "#ff6b35",
    color: "white",
    padding: "11px 20px",
    borderRadius: "12px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    width: "100%",
    fontSize: 15,
  },
  cancelBtn: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "11px 20px",
    borderRadius: "12px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
  },
  expiredNote: {
    marginTop: 14,
    color: "#991b1b",
    fontSize: 13,
    fontWeight: 600,
    background: "#fee2e2",
    padding: "8px 12px",
    borderRadius: "10px",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: 16,
    fontSize: 14,
  },
  filterBar: {
    display: "flex",
    gap: 8,
    marginTop: 20,
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13,
  },
  filterActive: {
    background: "#ff6b35",
    color: "white",
    border: "1px solid #ff6b35",
  },
  refreshBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13,
    marginLeft: "auto",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: "white",
    borderRadius: 20,
    padding: 32,
    maxWidth: 460,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 16,
  },
  qrBox: {
    background: "#f9fafb",
    borderRadius: 14,
    padding: 20,
    margin: "16px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  qrLabel: { fontWeight: 600, fontSize: 14, marginBottom: 8 },
  tokenText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#374151",
    wordBreak: "break-all",
    textAlign: "center",
    background: "#e5e7eb",
    padding: "6px 10px",
    borderRadius: 8,
    marginBottom: 8,
  },
};
