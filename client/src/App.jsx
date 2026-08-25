import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/ngo/sideber/Sidebar";
import Header from "./components/ngo/header/Header";

import DonationMap from "./pages/ngo/donationmap/DonationMap";
import ActiveRequests from "./pages/ngo/activerequest/ActiveRequests";
import DonationHistoryLogs from "./pages/ngo/donationlogs/DonationHistoryLogs";
import TrustScore from "./pages/ngo/trustscore/TrustScore";
import Feedback from "./pages/ngo/feedback/Feedback";
import Settings from "./pages/ngo/setting/Settings";

import NGODashboard from "./pages/ngo/NGODashboard";

const initialRequests = [
  {
    id: "req_1",
    donor: "Café 1",
    timeAgo: "2h ago",
    trustScore: 4.5,
    logistics: "Food Panda Option",
    foodTypes: "Rice, Chicken Curry (Prepared Meal)",
    quantity: "~20 meals",
    prepTime: "1h ago",
  },
  {
    id: "req_2",
    donor: "Restaurant Name 2",
    timeAgo: "2h ago",
    trustScore: 4.2,
    logistics: "By Self Option",
    foodTypes: "Chinese, Chow Mein, Sauce...",
    quantity: "~15 meals",
    prepTime: "30m ago",
  },
  {
    id: "req_3",
    donor: "Hotel Agrabad",
    timeAgo: "3h ago",
    trustScore: 4.8,
    logistics: "By Self Option",
    foodTypes: "Pasta, Soup, Bread Rolls...",
    quantity: "~30 meals",
    prepTime: "2h ago",
  },
  {
    id: "req_4",
    donor: "Royal Dine",
    timeAgo: "4h ago",
    trustScore: 4.6,
    logistics: "Food Panda Option",
    foodTypes: "Biryani, Salad, Borhani",
    quantity: "~50 meals",
    prepTime: "1h ago",
  },
];

function NGOLayout({
  requests,
  handleAccept,
  handleDecline,
  themeMode,
  setThemeMode,
}) {
  return (
    <div
      className={`flex h-screen font-sans transition-colors duration-300 ${
        themeMode === "dark"
          ? "bg-[#0f172a] text-slate-100"
          : "bg-[#F8FAFC] text-slate-800"
      }`}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header themeMode={themeMode} />

        <main className="px-8 py-6 flex-1">
          <Routes>
            <Route
              path="dashboard"
              element={
                <NGODashboard
                  requests={requests}
                  handleAccept={handleAccept}
                  handleDecline={handleDecline}
                />
              }
            />

            <Route
              path="donation-map"
              element={
                <DonationMap
                  requests={requests}
                  handleAccept={handleAccept}
                  handleDecline={handleDecline}
                />
              }
            />

            <Route
              path="active-requests"
              element={
                <ActiveRequests
                  requests={requests}
                />
              }
            />

            <Route
              path="history"
              element={
                <DonationHistoryLogs />
              }
            />

            <Route
              path="trust-score"
              element={
                <TrustScore themeMode={themeMode} />
              }
            />

            <Route
              path="feedback"
              element={
                <Feedback />
              }
            />

            <Route
              path="settings"
              element={
                <Settings
                  themeMode={themeMode}
                  setThemeMode={setThemeMode}
                />
              }
            />
          </Routes>
        </main>

        <footer
          className={`text-center py-3 text-[11px] border-t mt-auto transition-colors ${
            themeMode === "dark"
              ? "text-slate-500 border-slate-800"
              : "text-slate-400 border-slate-200/60"
          }`}
        >
          FeedLink NGO Portal, Chattogram • FeedLink © 2026
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  const [requests, setRequests] = useState(initialRequests);

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  const handleAccept = (id) => {
    setRequests((prev) =>
      prev.filter((request) => request.id !== id)
    );
    alert("Request Accepted! Moved to Active Pickups.");
  };

  const handleDecline = (id) => {
    setRequests((prev) =>
      prev.filter((request) => request.id !== id)
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/ngo/*"
          element={
            <NGOLayout
              requests={requests}
              handleAccept={handleAccept}
              handleDecline={handleDecline}
              themeMode={themeMode}
              setThemeMode={setThemeMode}
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/ngo/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}