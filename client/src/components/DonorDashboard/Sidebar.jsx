import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";

import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={21} />,
      path: "/restaurant/dashboard",
    },
    {
      title: "Add Donation",
      icon: <PlusCircle size={21} />,
      path: "/restaurant/add-donation",
    },
    {
      title: "Donation History",
      icon: <History size={21} />,
      path: "/restaurant/donation-history",
    },
    {
      title: "Analytics",
      icon: <BarChart3 size={21} />,
      path: "/restaurant/analytics",
    },
    {
      title: "Profile",
      icon: <User size={21} />,
      path: "/restaurant/profile",
    },
  ];

  return (
    <aside className="donor-sidebar">
      {/* Logo */}
      <div className="donor-sidebar-logo">

        {/* Small Screen Logo */}
        <div className="donor-logo-small">
          F<span>L</span>
        </div>

        {/* Desktop Logo */}
        <div className="donor-logo-desktop">
          <h1>
            Feed<span>Link</span>
          </h1>

          <p>Restaurant Dashboard</p>
        </div>

      </div>

      {/* Navigation */}
      <nav className="donor-sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `donor-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <span className="donor-nav-icon">
                  {item.icon}
                </span>

                <span className="donor-nav-text">
                  {item.title}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="donor-sidebar-logout">
        <button
          onClick={() => navigate("/")}
        >
          <LogOut size={21} />

          <span className="donor-logout-text">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;