import { useNavigate } from "react-router-dom";
import { logout, getRole } from "../utils/auth";
import { toggleTheme, getTheme } from "../utils/theme";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole();
  const [theme, setThemeState] = useState(getTheme());

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTheme = () => {
    toggleTheme();
    setThemeState(getTheme());
  };

  return (
    <div className="navbar" style={styles.nav}>

      {/* BRAND */}
      <div style={styles.brand}>
        <span style={styles.logo}>🍽️</span>
        <span style={styles.name}>Food Rescue</span>
      </div>

      {/* RIGHT ACTIONS */}
      <div style={styles.actions}>
        <span style={styles.welcome}>
          Hi, {role || "User"}
        </span>

        <button className="theme-btn" onClick={handleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <button style={styles.notify}>🔔</button>

        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>

    </div>
  );
}

const styles = {
  nav: {
    height: "64px",
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 26px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: "700"
  },
  logo: {
    fontSize: "22px"
  },
  name: {
    fontWeight: "700"
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },
  welcome: {
    fontSize: "14px",
    color: "#6b7280"
  },
  notify: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer"
  },
  logout: {
    background: "#f3f4f6",
    border: "none",
    padding: "8px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "500"
  }
};
