
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/admin/users", icon: "👥", label: "Donors" },
  { path: "/admin/donations", icon: "🍱", label: "Donations" },
  { path: "/admin/orphanages", icon: "🏠", label: "NGOs" },
  { path: "/admin/feedback", icon: "💬", label: "Feedback" },
  { path: "/admin/reports", icon: "📈", label: "Reports" },
  { path: "/admin/inventory", icon: "📦", label: "Inventory" },
  { path: "/admin/settings", icon: "👤", label: "Profile" },
];

const Sidebar = ({ mobileOpen = false, onClose }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && onClose) {
      onClose();
    }
    // Close mobile sidebar whenever the route changes.
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobile, mobileOpen, onClose]);

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}

      <aside
        id="admin-sidebar"
        className={`sidebar ${isMobile ? "sidebar-mobile" : ""} ${mobileOpen ? "sidebar-open" : ""
          }`}
        aria-label="Admin navigation"
      >
        {isMobile && (
          <div className="sidebar-mobile-header">
            <span>Admin Menu</span>
            <button
              type="button"
              className="sidebar-close"
              aria-label="Close menu"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        )}

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobile && onClose) onClose();
              }}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
