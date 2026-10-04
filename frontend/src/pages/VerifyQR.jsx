import { useState } from "react";
import { verifyClaimToken } from "../utils/api";

export default function VerifyQR() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) { setError("Please enter a token"); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const claim = await verifyClaimToken(trimmed);
      setResult(claim);
    } catch (e) {
      setError(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>📷 QR Code Verification</h1>
      <p className="muted">Enter the claim verification token to confirm delivery.</p>

      <div style={styles.card}>
        <div style={styles.icon}>🔍</div>
        <h2 style={{ marginTop: 12 }}>Verify Delivery</h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Enter the token shown on the claim QR code. This marks the claim as verified and the food listing as delivered.
        </p>

        <form onSubmit={handleVerify} style={styles.form}>
          <input
            type="text"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste verification token (UUID)"
            style={styles.input}
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Verifying…" : "✅ Verify Token"}
          </button>
        </form>

        {error && (
          <div style={styles.error}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={styles.success}>
            <div style={{ fontSize: 40, textAlign: "center" }}>🎉</div>
            <h3 style={{ textAlign: "center", color: "#166534" }}>Delivery Verified!</h3>
            <div style={styles.resultDetails}>
              <div>🆔 Claim ID: <strong>#{result.id}</strong></div>
              <div>🏢 NGO: <strong>{result.ngoName}</strong></div>
              {result.contactInfo && <div>📧 Contact: {result.contactInfo}</div>}
              <div>📦 Food ID: #{result.foodId}</div>
              <div>📅 Claimed: {new Date(result.claimedAt).toLocaleString()}</div>
              {result.verifiedAt && (
                <div>✅ Verified at: <strong>{new Date(result.verifiedAt).toLocaleString()}</strong></div>
              )}
              <div style={{ ...styles.statusBadge }}>
                Status: {result.status}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.infoBox}>
        <strong>How it works:</strong>
        <ol style={{ margin: "10px 0 0", paddingLeft: 20, fontSize: 14, color: "#374151" }}>
          <li>NGO claims a food listing — a unique token is generated</li>
          <li>QR code displayed on the claim contains this token</li>
          <li>At delivery, scan the QR or enter the token here</li>
          <li>System verifies the token and marks delivery complete</li>
          <li>Token is one-time use — re-verification is rejected</li>
        </ol>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    borderRadius: 20,
    padding: "32px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.09)",
    marginTop: 28,
    maxWidth: 500,
  },
  icon: { fontSize: 36 },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: 20,
  },
  input: {
    padding: "13px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 14,
    fontFamily: "monospace",
  },
  btn: {
    background: "#ff6b35",
    color: "white",
    padding: "13px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    border: "none",
    cursor: "pointer",
  },
  error: {
    marginTop: 16,
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
  },
  success: {
    marginTop: 16,
    background: "#f0fdf4",
    border: "1px solid #86efac",
    padding: "20px",
    borderRadius: 14,
  },
  resultDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 14,
    color: "#374151",
    marginTop: 12,
  },
  statusBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 14px",
    borderRadius: 10,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 8,
  },
  infoBox: {
    marginTop: 24,
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: 14,
    padding: "20px 24px",
    maxWidth: 500,
  },
};
