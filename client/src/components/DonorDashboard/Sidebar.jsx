
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  User,
  LogOut,
  MessageSquareText,
  MessageCircle,
  Images,
} from "lucide-react";

import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

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
      title: "Distribution Proof",
      icon: <Images size={21} />,
      path: "/restaurant/distribution-proofs",
    },
    {
      title: "Analytics",
      icon: <BarChart3 size={21} />,
      path: "/restaurant/analytics",
    },
    {
      title: "NGO Reviews",
      icon: <MessageSquareText size={21} />,
      path: "/restaurant/ngo-reviews",
    },
    {
      title: "Feedback & Rating",
      icon: <MessageCircle size={21} />,
      path: "/restaurant/feedback",
    },
    {
      title: "Profile",
      icon: <User size={21} />,
      path: "/restaurant/profile",
    },
  ];

  return (
    <aside className="donor-sidebar">
      <div className="donor-sidebar-logo">
        <div className="donor-logo-small">
          F<span>L</span>
        </div>

        <div className="donor-logo-desktop">
          <h1>
            Feed<span>Link</span>
          </h1>
          <p>Restaurant Dashboard</p>
        </div>
      </div>

      <nav className="donor-sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `donor-nav-link ${isActive ? "active" : ""}`
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

      <div className="donor-sidebar-logout">
        <button onClick={handleLogout}>
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
