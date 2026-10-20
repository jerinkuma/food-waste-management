
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
          aria-controls="admin-sidebar"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="navbar-brand">
          <span className="brand-icon">🍽️</span>
          <span className="brand-name">FeedLink</span>
        </div>
      </div>

      <div className="navbar-right">
        <span className="admin-name">Admin</span>
        <div className="avatar">A</div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
