import { useState } from "react";
import { createListing } from "../utils/api";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Cooked Food", "Bakery", "Packaged", "Fruits", "Vegetables", "Dairy", "Other"];

export default function AddListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    donorName: "",
    foodName: "",
    description: "",
    quantity: "",
    category: "",
    location: "",
    expiryTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!form.donorName.trim()) { setError("Donor name is required"); return; }
    if (!form.foodName.trim()) { setError("Food name is required"); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { setError("Quantity must be a positive number"); return; }
    if (!form.expiryTime) { setError("Expiry date/time is required"); return; }

    const expiryDate = new Date(form.expiryTime);
    if (expiryDate <= new Date()) { setError("Expiry time must be in the future"); return; }

    setSubmitting(true);
    try {
      const payload = {
        donorName: form.donorName.trim(),
        foodName: form.foodName.trim(),
        description: form.description.trim(),
        quantity: parseInt(form.quantity),
        category: form.category,
        location: form.location.trim(),
        // datetime-local already represents local wall-clock time; preserve it for LocalDateTime.
        expiryTime: `${form.expiryTime}:00`,
      };

      const created = await createListing(payload);
      setSuccess(`Food listing "${created.foodName}" added successfully! ID: #${created.id}`);
      setForm({ donorName: "", foodName: "", description: "", quantity: "", category: "", location: "", expiryTime: "" });
    } catch (e) {
      setError(e.message || "Failed to add listing. Check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Add Food Listing</h1>
      <p className="muted">Help reduce food wastage by sharing surplus food with those in need.</p>

      {success && (
        <div style={styles.success}>
          ✅ {success}
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button style={styles.successBtn} onClick={() => navigate("/listings")}>View Listings</button>
            <button style={styles.successBtnAlt} onClick={() => setSuccess(null)}>Add Another</button>
          </div>
        </div>
      )}

      {!success && (
        <form style={styles.form} onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.grid2}>
            <div style={styles.group}>
              <label>Donor Name *</label>
              <input
                type="text"
                name="donorName"
                placeholder="Your name or organisation"
                value={form.donorName}
                onChange={handleChange}
              />
            </div>

            <div style={styles.group}>
              <label>Food Name *</label>
              <input
                type="text"
                name="foodName"
                placeholder="e.g. Cooked Rice, Bread"
                value={form.foodName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={styles.group}>
            <label>Description</label>
            <input
              type="text"
              name="description"
              placeholder="Additional details about the food"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div style={styles.grid2}>
            <div style={styles.group}>
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                placeholder="Number of servings/portions"
                value={form.quantity}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div style={styles.group}>
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.group}>
              <label>Pickup Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Hostel A, Main Gate"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div style={styles.group}>
              <label>Expiry Date &amp; Time *</label>
              <input
                type="datetime-local"
                name="expiryTime"
                value={form.expiryTime}
                onChange={handleChange}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <button type="submit" style={styles.btn} disabled={submitting}>
            {submitting ? "Adding Listing…" : "➕ Add Food Listing"}
          </button>
        </form>
      )}
    </div>
  );
}

const styles = {
  form: {
    maxWidth: "700px",
    background: "white",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.09)",
    marginTop: "28px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "18px",
  },
  btn: {
    marginTop: "8px",
    background: "#ff6b35",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "700",
    width: "100%",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  success: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "20px 24px",
    borderRadius: "14px",
    marginTop: "24px",
    fontWeight: "500",
  },
  successBtn: {
    background: "#16a34a",
    color: "white",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  successBtnAlt: {
    background: "#f3f4f6",
    color: "#374151",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
};
