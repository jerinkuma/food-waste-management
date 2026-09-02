import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Login data remove
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Home page এ নিয়ে যাবে
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🍽️</span>
        <span className="brand-name">FeedLink</span>
      </div>

      <div className="navbar-right">
        <span className="admin-name">Admin</span>
        <div className="avatar">A</div>

        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;