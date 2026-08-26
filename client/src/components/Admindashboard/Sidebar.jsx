import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const menuItems = [
  { path: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { path: "/admin/users", icon: "👥", label: "Users" },
  { path: "/admin/donations", icon: "🍱", label: "Donations" },
  { path: "/admin/orphanages", icon: "🏠", label: "Orphanages" },
  { path: "/admin/feedback", icon: "💬", label: "Feedback" },
  { path: "/admin/reports", icon: "📈", label: "Reports" },
  { path: "/admin/inventory", icon: "📦", label: "Inventory" },
  { path: "/admin/settings", icon: "⚙️", label: "Settings" },
];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;