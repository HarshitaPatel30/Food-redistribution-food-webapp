import { useEffect, useState } from "react";

export default function Listings() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("listings")) || [];
    setItems(saved);
  }, []);

 const claimItem = (id) => {
  const claimedItem = items.find(item => item.id === id);

  // Save to claims
  const existingClaims = JSON.parse(localStorage.getItem("claims")) || [];
  localStorage.setItem(
    "claims",
    JSON.stringify([{ ...claimedItem, status: "Claimed" }, ...existingClaims])
  );

  // Remove from listings
  const updated = items.filter(item => item.id !== id);
  setItems(updated);
  localStorage.setItem("listings", JSON.stringify(updated));
};


  return (
    <>
      <h1>Available Food Listings</h1>
      <p>Nearby surplus food ready for pickup</p>

      {items.length === 0 ? (
        <p>No listings available yet.</p>
      ) : (
        <div style={styles.grid}>
          {items.map(item => (
            <div key={item.id} style={styles.card}>
              <h3>{item.name}</h3>
              <p>🍽 {item.quantity}</p>
              <p>📦 {item.category}</p>
              <p>📍 {item.location}</p>
              <p>⏰ Expires in: {item.expiry}</p>
              <button style={styles.btn} onClick={() => claimItem(item.id)}>
                Claim Food
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginTop: "24px"
  },
  card: {
    background: "white",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
  },
  btn: {
    marginTop: "12px",
    background: "#ff6b35",
    color: "white",
    padding: "12px",
    borderRadius: "12px",
    width: "100%",
    fontWeight: "600"
  }
};
