import { useState } from "react";

import {
  Bell,
  Search,
  CalendarDays,
  Moon,
  Sun,
  CheckCircle2,
  Utensils,
  X,
} from "lucide-react";

const Topbar = ({ isDark, setIsDark }) => {
  const [showNotifications, setShowNotifications] =
    useState(false);

  // =====================================
  // USER / PROFILE IMAGE
  // =====================================

  const userData =
    localStorage.getItem("user");

  const user = userData
    ? JSON.parse(userData)
    : null;

  const profileImage = user?.profileImage
    ? `http://localhost:5000${user.profileImage}`
    : "";

  // =====================================
  // GREETING
  // =====================================

  const hour = new Date().getHours();

  let greeting = "";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
  } else {
    greeting = "Good Night";
  }

  // =====================================
  // TODAY
  // =====================================

  const today = new Date().toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  // =====================================
  // NOTIFICATIONS
  // =====================================

  const notifications = [
    {
      id: 1,
      title: "New Donation Update",
      message:
        "Your recent donation has been received.",
      icon: Utensils,
    },
    {
      id: 2,
      title: "Pickup Completed",
      message:
        "An NGO successfully collected your donation.",
      icon: CheckCircle2,
    },
  ];

  return (
    <header
      className={`fixed top-0 right-0 left-[72px] z-50 border-b px-3 py-3 shadow-sm transition-colors duration-300 sm:px-5 sm:py-4 md:left-64 lg:px-8 ${
        isDark
          ? "border-slate-700 bg-slate-900"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex min-h-[64px] items-center justify-between gap-2 sm:gap-4">

        {/* ================= LEFT ================= */}

        <div className="min-w-0 flex-1">

          <h1
            className={`truncate text-base font-bold sm:text-xl md:text-2xl lg:text-3xl ${
              isDark
                ? "text-white"
                : "text-gray-800"
            }`}
          >
            {greeting}, {user?.name || "Restaurant"}
          </h1>

          <div
            className={`mt-1 flex min-w-0 items-center gap-1.5 sm:gap-2 ${
              isDark
                ? "text-slate-400"
                : "text-gray-500"
            }`}
          >
            <CalendarDays
              size={15}
              className="shrink-0 text-green-500 sm:h-[17px] sm:w-[17px]"
            />

            <span className="truncate text-[10px] font-medium sm:text-xs md:text-sm">
              {today}
            </span>
          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5">

          {/* ================= SEARCH ================= */}

          <div className="relative hidden xl:block">

            <Search
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark
                  ? "text-slate-400"
                  : "text-gray-400"
              }`}
            />

            <input
              type="text"
              placeholder="Search donations, NGOs..."
              className={`w-60 rounded-xl border py-3 pl-11 pr-4 outline-none transition duration-300 2xl:w-72 ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-green-500"
                  : "border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:border-green-500 focus:bg-white"
              }`}
            />

          </div>

          {/* ================= DARK MODE ================= */}

          <button
            onClick={() =>
              setIsDark(!isDark)
            }
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition duration-300 sm:h-10 sm:w-10 md:h-11 md:w-11 md:rounded-xl ${
              isDark
                ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                : "bg-gray-100 text-gray-700 hover:bg-green-100"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          {/* ================= NOTIFICATION ================= */}

          <div className="relative">

            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition duration-300 sm:h-10 sm:w-10 md:h-11 md:w-11 md:rounded-xl ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700"
                  : "bg-gray-100 hover:bg-green-100"
              }`}
              aria-label="Notifications"
            >
              <Bell
                size={19}
                className={
                  isDark
                    ? "text-slate-200"
                    : "text-gray-700"
                }
              />

              <span
                className={`absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 sm:right-1.5 sm:top-1.5 sm:h-2.5 sm:w-2.5 ${
                  isDark
                    ? "border-2 border-slate-800"
                    : "border-2 border-white"
                }`}
              />
            </button>

            {/* ================= NOTIFICATION DROPDOWN ================= */}

            {showNotifications && (
              <div
                className={`absolute right-0 top-11 z-[100] w-[calc(100vw-1rem)] max-w-80 overflow-hidden rounded-2xl border shadow-2xl sm:top-13 sm:w-80 ${
                  isDark
                    ? "border-slate-700 bg-slate-900"
                    : "border-gray-200 bg-white"
                }`}
              >

                {/* Header */}

                <div
                  className={`flex items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4 ${
                    isDark
                      ? "border-slate-700"
                      : "border-gray-100"
                  }`}
                >
                  <div>

                    <h3
                      className={`font-bold ${
                        isDark
                          ? "text-white"
                          : "text-gray-800"
                      }`}
                    >
                      Notifications
                    </h3>

                    <p className="text-xs text-green-500">
                      2 new updates
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                    className={`rounded-lg p-1 transition ${
                      isDark
                        ? "text-slate-400 hover:bg-slate-800"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    aria-label="Close notifications"
                  >
                    <X size={18} />
                  </button>

                </div>

                {/* Notification Items */}

                <div>

                  {notifications.map(
                    (notification) => {

                      const Icon =
                        notification.icon;

                      return (
                        <div
                          key={notification.id}
                          className={`flex gap-3 border-b px-4 py-3 sm:px-5 sm:py-4 ${
                            isDark
                              ? "border-slate-800 hover:bg-slate-800"
                              : "border-gray-100 hover:bg-gray-50"
                          }`}
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 sm:h-10 sm:w-10">
                            <Icon size={18} />
                          </div>

                          <div className="min-w-0">

                            <h4
                              className={`text-sm font-semibold ${
                                isDark
                                  ? "text-slate-100"
                                  : "text-gray-800"
                              }`}
                            >
                              {notification.title}
                            </h4>

                            <p
                              className={`mt-1 text-xs leading-5 ${
                                isDark
                                  ? "text-slate-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {notification.message}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* Footer */}

                <button
                  className={`w-full px-4 py-3 text-center text-sm font-semibold text-green-500 transition sm:px-5 sm:py-4 ${
                    isDark
                      ? "hover:bg-slate-800"
                      : "hover:bg-green-50"
                  }`}
                >
                  View all notifications
                </button>

              </div>
            )}

          </div>

          {/* ================= PROFILE ================= */}

          <button
            className={`shrink-0 rounded-full p-1 transition ${
              isDark
                ? "ring-2 ring-slate-700 hover:ring-green-500"
                : "ring-2 ring-gray-200 hover:ring-green-500"
            }`}
            aria-label="Profile"
          >

            {profileImage ? (
              <img
                src={profileImage}
                alt={
                  user?.name || "Restaurant"
                }
                className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10 md:h-11 md:w-11"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 sm:h-10 sm:w-10 md:h-11 md:w-11">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "R"}
              </div>
            )}

          </button>

        </div>

      </div>
    </header>
  );
};

export default Topbar;