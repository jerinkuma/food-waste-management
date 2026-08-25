import React, { useState, useRef, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import "./Header.css"; // আলাদা সিএসএস ফাইল ইমপোর্ট করা হলো

export default function Header({ themeMode }) {
  const isDark = themeMode === "dark";
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const modalRef = useRef(null);

  // Close profile popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get Page Title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/ngo/dashboard":
        return "Good Evening, Hope Foundation";
      case "/ngo/donation-map":
        return "Donation Map";
      case "/ngo/active-requests":
        return "Active Requests";
      case "/ngo/history":
        return "History & Logs";
      case "/ngo/trust-score":
        return "Trust Score";
      case "/ngo/feedback":
        return "Feedback";
      case "/ngo/settings":
        return "Settings";
      default:
        return "Good Evening, Hope Foundation";
    }
  };

  return (
    <header className={`ngo-header ${isDark ? "ngo-header-dark" : "ngo-header-light"}`}>
      {/* LEFT SIDE — PAGE TITLE */}
      <div>
        <h2 className="ngo-header-title">{getPageTitle()}</h2>
        <p className={`ngo-header-subtitle ${isDark ? "ngo-header-subtitle-dark" : "ngo-header-subtitle-light"}`}>
          NGO Portal • FeedLink
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="ngo-header-right">
        {/* THEME INDICATOR */}
        <span className={`ngo-theme-badge ${isDark ? "ngo-theme-badge-dark" : "ngo-theme-badge-light"}`}>
          {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </span>

        {/* SEARCH BAR */}
        <div className="ngo-search-container">
          <Search className="ngo-search-icon" />
          <input
            type="text"
            placeholder="Search Nearby Donations..."
            className={`ngo-search-input ${isDark ? "ngo-search-input-dark" : "ngo-search-input-light"}`}
          />
        </div>

        {/* NOTIFICATION */}
        <button className={`ngo-bell-btn ${isDark ? "ngo-bell-btn-dark" : "ngo-bell-btn-light"}`}>
          <Bell className="w-4 h-4" />
          <span className="ngo-bell-dot" />
        </button>

        {/* PROFILE */}
        <div
          onClick={() => setShowProfileModal(!showProfileModal)}
          className={`ngo-profile-box ${isDark ? "ngo-profile-box-dark" : "ngo-profile-box-light"}`}
        >
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80"
            alt="Hope Foundation"
            className="ngo-profile-img"
          />
          <div className="text-left">
            <p className={`ngo-profile-text ${isDark ? "ngo-profile-text-dark" : "ngo-profile-text-light"}`}>
              Welcome, Hope Foundation!
            </p>
          </div>
        </div>

        {/* NGO PROFILE MODAL */}
        {showProfileModal && (
          <div ref={modalRef} className={`ngo-profile-modal ${isDark ? "ngo-profile-modal-dark" : "ngo-profile-modal-light"}`}>
            {/* Profile Header */}
            <div className="ngo-modal-header">
              <div className="flex items-center gap-3">
                <div className="ngo-modal-avatar">HF</div>
                <div>
                  <h3 className="font-bold text-sm">Hope Foundation</h3>
                  <p className="ngo-modal-tag">Verified Partner NGO • Chattogram</p>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="ngo-modal-close">
                ×
              </button>
            </div>

            {/* Description */}
            <div className="ngo-modal-desc">
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                <strong className="text-emerald-500">Hope Foundation</strong> is a well-known non-profit social organization dedicated to collecting surplus food and distributing nutritious meals to underprivileged people.
              </p>
              <div className="ngo-modal-notice">
                ✨ NGO Details: Doing an exceptional job in food waste reduction and public welfare.
              </div>
            </div>

            {/* Statistics */}
            <div className="ngo-modal-stats">
              <div className={`ngo-stat-card ${isDark ? "ngo-stat-card-dark" : "ngo-stat-card-light"}`}>
                <p className="ngo-stat-number">1,450+</p>
                <p className="ngo-stat-label">Total Food Donations Collected</p>
              </div>
              <div className={`ngo-stat-card ${isDark ? "ngo-stat-card-dark" : "ngo-stat-card-light"}`}>
                <p className="ngo-stat-number">25+</p>
                <p className="ngo-stat-label">Partner Restaurants</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}