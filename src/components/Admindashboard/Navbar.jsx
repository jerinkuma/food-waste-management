import React from 'react';
import './Navbar.css';

const Navbar = () => {
  const handleLogout = () => {
    window.location.reload();
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