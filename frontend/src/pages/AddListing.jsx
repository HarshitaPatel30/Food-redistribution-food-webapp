import { useState } from "react";

export default function AddListing() {
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    category: "",
    location: "",
    expiry: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.quantity || !form.category || !form.location || !form.expiry) {
      alert("Please fill all fields");
      return;
    }

    // Simulating save
    const existing = JSON.parse(localStorage.getItem("listings")) || [];

    const newListing = {
      id: Date.now(),
      ...form
    };

    localStorage.setItem("listings", JSON.stringify([newListing, ...existing]));

    alert("Food listing added successfully!");

    setForm({
      name: "",
      quantity: "",
      category: "",
      location: "",
      expiry: ""
    });
  };

  return (
    <>
      <h1>Add Food Listing</h1>
      <p>Help reduce food wastage by sharing surplus food</p>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.group}>
          <label>Food Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Cooked Rice"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div style={styles.group}>
          <label>Quantity</label>
          <input
            type="text"
            name="quantity"
            placeholder="e.g. 20 plates"
            value={form.quantity}
            onChange={handleChange}
          />
        </div>

        <div style={styles.group}>
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">Select category</option>
            <option>Cooked Food</option>
            <option>Bakery</option>
            <option>Packaged</option>
            <option>Fruits</option>
          </select>
        </div>

        <div style={styles.group}>
          <label>Pickup Location</label>
          <input
            type="text"
            name="location"
            placeholder="e.g. Hostel A"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div style={styles.group}>
          <label>Expiry Time</label>
          <input
            type="text"
            name="expiry"
            placeholder="e.g. 45 minutes"
            value={form.expiry}
            onChange={handleChange}
          />
        </div>

        <button style={styles.btn}>Add Listing</button>
      </form>
    </>
  );
}

const styles = {
  form: {
    maxWidth: "520px",
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
    marginTop: "25px"
  },
  group: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px"
  },
  btn: {
    marginTop: "10px",
    background: "#ff6b35",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "600",
    width: "100%",
    fontSize: "16px"
  }
};
