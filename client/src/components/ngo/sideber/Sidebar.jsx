import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

import {
  Home,
  MapPin,
  Clock,
  History,
  ShieldCheck,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from "lucide-react";

// -------------------------------------------------------------
// 1. SIDEBAR COMPONENT
// -------------------------------------------------------------
export function Sidebar({ handleLogout }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/ngo/dashboard", name: "HOME", icon: Home },
    { path: "/ngo/donation-map", name: "DONATION MAP", icon: MapPin },
    { path: "/ngo/active-requests", name: "ACTIVE REQUESTS", icon: Clock },
    { path: "/ngo/history", name: "HISTORY & LOGS", icon: History },
    { path: "/ngo/trust-score", name: "TRUST SCORE", icon: ShieldCheck },
    { path: "/ngo/feedback", name: "FEEDBACK", icon: MessageSquare },
    { path: "/ngo/settings", name: "SETTINGS", icon: Settings },
  ];

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <aside
      className={`ngo-sidebar ${
        isExpanded ? "ngo-sidebar-expanded" : "ngo-sidebar-collapsed"
      }`}
    >
      {/* TOP SECTION */}
      <div>
        {/* Logo */}
        <div className="ngo-sidebar-logo-container">
          {isExpanded ? (
            <div>
              <h1 className="ngo-sidebar-title">
                FEED
                <span className="ngo-sidebar-title-highlight">LINK</span>
              </h1>
            </div>
          ) : (
            <div className="ngo-sidebar-icon-box">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ngo-collapse-btn"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* NAVIGATION */}
        <nav className="ngo-nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`ngo-nav-item ${
                  isActive ? "ngo-nav-item-active" : "ngo-nav-item-inactive"
                }`}
                title={!isExpanded ? item.name : ""}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "ngo-nav-icon-active" : "ngo-nav-icon-inactive"
                  }`}
                />
                {isExpanded && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT */}
      <div className="ngo-sidebar-footer">
        <button
          onClick={handleLogout}
          className={`ngo-logout-btn ${
            !isExpanded ? "ngo-logout-center" : ""
          }`}
          title={!isExpanded ? "Logout" : ""}
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// -------------------------------------------------------------
// 2. MAIN LAYOUT COMPONENT (DEFAULT EXPORT)
// -------------------------------------------------------------
export default function NgoLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. LocalStorage & SessionStorage ক্লিয়ার করা
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // 2. ইউজারকে লগইন পেজে রিডাইরেক্ট করা
    navigate("/login");
  };

  return (
    <div className="flex">
      {/* Integrated Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Dynamic Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}