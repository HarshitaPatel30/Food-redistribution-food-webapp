import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/auth";

export default function Login() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      alert("Choose a demo role to continue");
      return;
    }
    login(role);
    navigate("/");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {/* BRANDING */}
        <div style={styles.brand}>
          <div style={styles.logo}>🍽️</div>
          <h1 style={styles.title}>Food Rescue</h1>
          <p style={styles.subtitle}>
            Real-Time Food Redistribution Platform
          </p>
          <p style={styles.demoNotice}>
            Demo role selection only. This application does not authenticate users.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Choose demo role</option>
            <option value="Donor">Donor</option>
            <option value="NGO">NGO</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Admin">Admin</option>
          </select>

          <button className="btn">Continue in demo mode</button>
        </form>

      </div>
    </div>
  );
}

/* STYLES */

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #fff7f3, #f9fafb)"
  },
  card: {
    width: "420px",
    background: "white",
    padding: "36px",
    borderRadius: "22px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.12)"
  },
  brand: {
    textAlign: "center",
    marginBottom: "26px"
  },
  logo: {
    fontSize: "44px",
    marginBottom: "10px"
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700"
  },
  subtitle: {
    marginTop: "6px",
    fontSize: "14px",
    color: "#6b7280"
  },
  demoNotice: {
    margin: "12px 0 0",
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#92400e",
    background: "#fffbeb",
    borderRadius: "10px",
    padding: "10px 12px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  }
};
