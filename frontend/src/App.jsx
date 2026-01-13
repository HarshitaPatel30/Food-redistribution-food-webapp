import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import AddListing from "./pages/AddListing";
import MyClaims from "./pages/MyClaims";
import Login from "./pages/Login";

import { getTheme, setTheme } from "./utils/theme";

import "./styles/global.css";

export default function App() {

  // Apply saved theme on app load
  useEffect(() => {
    setTheme(getTheme());
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex", height: "100vh" }}>

                {/* SIDEBAR */}
                <Sidebar />

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  
                  {/* TOP NAVBAR */}
                  <Navbar />

                  {/* PAGE CONTENT */}
                  <div
                    className="container"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "24px"
                    }}
                  >
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/listings" element={<Listings />} />
                      <Route path="/add" element={<AddListing />} />
                      <Route path="/claims" element={<MyClaims />} />
                    </Routes>
                  </div>

                </div>
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
