import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  Search,
  Bell,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Header.css";

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export default function Header({ themeMode }) {
  const isDark = themeMode === "dark";

  const location = useLocation();
  const navigate = useNavigate();

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [showNotification, setShowNotification] =
    useState(false);

  // ==========================================
  // NEW DONATION
  // ==========================================

  const [newDonation, setNewDonation] =
    useState(null);

  // ==========================================
  // FRESHNESS ALERT
  // ==========================================

  const [freshnessNotification, setFreshnessNotification] =
    useState(null);

  const [notificationType, setNotificationType] =
    useState(null);

  const modalRef = useRef(null);
  const notificationRef = useRef(null);

  // Prevent the same freshness alert from appearing
  // repeatedly during the same urgency level.
  const freshnessAlertKeysRef = useRef(
    new Set()
  );

  // ==========================================
  // NGO USER DATA
  // ==========================================

  const [ngoData, setNgoData] = useState({
    id: "",
    name: "User",
    email: "",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
  });

  // ==========================================
  // LOAD LOGGED-IN NGO DATA
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

      setNgoData({
        id: parsedUser.id || "",
        name:
          parsedUser.name ||
          parsedUser.organizationName ||
          parsedUser.ngoName ||
          "User",
        email: parsedUser.email || "",
        image:
          parsedUser.image ||
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
      });
    } catch (error) {
      console.error(
        "Error parsing user data:",
        error
      );
    }
  }, []);

  // ==========================================
  // PROFILE / NOTIFICATION OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        modalRef.current &&
        !modalRef.current.contains(
          event.target
        )
      ) {
        setShowProfileModal(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotification(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================
  // SOCKET.IO
  // ==========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    let user = null;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Error parsing user for socket:",
        error
      );

      return;
    }

    if (!user?.id) {
      console.error(
        "NGO user ID not found. Socket skipped."
      );

      return;
    }

    console.log(
      "Connecting NGO socket..."
    );

    const socket = io(SOCKET_URL, {
      transports: [
        "websocket",
        "polling",
      ],
    });

    // ==========================================
    // SOCKET CONNECTED
    // ==========================================

    socket.on("connect", () => {
      console.log(
        "✅ NGO SOCKET CONNECTED:",
        socket.id
      );

      // IMPORTANT:
      // This must match server/utils/socket.js
      socket.emit("identify", {
        role: "ngo",
        userId: user.id,
      });

      console.log(
        "✅ NGO IDENTIFIED:",
        user.id
      );
    });

    // ==========================================
    // NEW DONATION
    // ==========================================

    socket.on(
      "donation:new",
      (donation) => {
        console.log(
          "🟢 NEW DONATION RECEIVED:",
          donation
        );

        if (!donation) {
          return;
        }

        setNewDonation(donation);
        setFreshnessNotification(null);

        setNotificationType(
          "new-donation"
        );

        setShowNotification(true);
      }
    );

    // ==========================================
    // FRESHNESS ALERT
    // ==========================================

    socket.on(
      "donation:freshness-alert",
      (notification) => {
        console.log(
          "🔴 FRESHNESS ALERT RECEIVED:",
          notification
        );

        if (!notification) {
          return;
        }

        const donationId =
          notification.donationId ||
          notification.customDonationId;

        if (!donationId) {
          return;
        }

        /*
         * Same donation + same urgency should
         * not repeatedly replace the popup.
         *
         * When urgency changes:
         *
         * warning
         *    ↓
         * urgent
         *    ↓
         * critical
         *    ↓
         * expired
         *
         * a new notification can appear.
         */

        const alertKey =
          `${donationId}-${notification.urgency}`;

        if (
          freshnessAlertKeysRef.current.has(
            alertKey
          )
        ) {
          return;
        }

        freshnessAlertKeysRef.current.add(
          alertKey
        );

        setFreshnessNotification(
          notification
        );

        setNewDonation(null);

        setNotificationType(
          "freshness"
        );

        setShowNotification(true);
      }
    );

    // ==========================================
    // DONATION UPDATED
    // ==========================================

    socket.on(
      "donation:updated",
      (updatedDonation) => {
        console.log(
          "🔵 DONATION UPDATED:",
          updatedDonation
        );

        if (!updatedDonation) {
          return;
        }

        // --------------------------------------
        // Current new donation notification
        // --------------------------------------

        const currentDonationId =
          newDonation?._id ||
          newDonation?.id;

        const updatedDonationId =
          updatedDonation?._id ||
          updatedDonation?.id;

        if (
          currentDonationId &&
          updatedDonationId &&
          String(currentDonationId) ===
            String(updatedDonationId)
        ) {
          if (
            updatedDonation.pipelineStatus ===
              "Accepted" ||
            updatedDonation.pipelineStatus ===
              "Rejected"
          ) {
            setNewDonation(null);

            if (
              notificationType ===
              "new-donation"
            ) {
              setShowNotification(false);
              setNotificationType(null);
            }
          }
        }

        // --------------------------------------
        // Freshness notification
        // --------------------------------------

        const freshnessDonationId =
          freshnessNotification?.donationId;

        if (
          freshnessDonationId &&
          updatedDonationId &&
          String(freshnessDonationId) ===
            String(updatedDonationId)
        ) {
          if (
            updatedDonation.pipelineStatus ===
              "Accepted" ||
            updatedDonation.pipelineStatus ===
              "Rejected" ||
            updatedDonation.pipelineStatus ===
              "Completed"
          ) {
            setFreshnessNotification(null);

            if (
              notificationType ===
              "freshness"
            ) {
              setShowNotification(false);
              setNotificationType(null);
            }
          }
        }
      }
    );

    // ==========================================
    // SOCKET CONNECTION ERROR
    // ==========================================

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "❌ NGO SOCKET CONNECTION ERROR:",
          error
        );
      }
    );

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      console.log(
        "Disconnecting NGO socket..."
      );

      socket.off("connect");
      socket.off("donation:new");
      socket.off(
        "donation:freshness-alert"
      );
      socket.off(
        "donation:updated"
      );
      socket.off(
        "connect_error"
      );

      socket.disconnect();
    };
  }, []);

  // ==========================================
  // REQUEST DONATION
  // ==========================================

  const handleRequestDonation =
    async () => {
      if (!newDonation) {
        return;
      }

      const donationId =
        newDonation._id ||
        newDonation.id;

      if (!donationId) {
        console.error(
          "Donation ID not found."
        );

        return;
      }

      try {
        const storedUser =
          localStorage.getItem("user");

        const user = storedUser
          ? JSON.parse(storedUser)
          : null;

        if (!user?.id) {
          alert(
            "User information not found."
          );

          return;
        }

        const token =
          localStorage.getItem("token");

        const response =
          await fetch(
            `http://localhost:5000/api/donations/${donationId}/accept`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify({
                ngoId: user.id,
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "ACCEPT DONATION RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to request donation."
          );
        }

        setNewDonation(null);
        setShowNotification(false);
        setNotificationType(null);

        navigate(
          "/ngo/active-requests"
        );
      } catch (error) {
        console.error(
          "REQUEST DONATION ERROR:",
          error
        );

        alert(
          error.message ||
            "Failed to request donation."
        );
      }
    };

  // ==========================================
  // DISMISS NOTIFICATION
  // ==========================================

  const handleDismissNotification =
    () => {
      setNewDonation(null);
      setFreshnessNotification(null);
      setShowNotification(false);
      setNotificationType(null);
    };

  // ==========================================
  // PAGE TITLE
  // ==========================================

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/ngo/dashboard":
        return `Good Evening, ${ngoData.name}`;

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
        return `Good Evening, ${ngoData.name}`;
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <header
      className={`ngo-header ${
        isDark
          ? "ngo-header-dark"
          : "ngo-header-light"
      }`}
    >
      {/* ========================================
          LEFT SIDE — PAGE TITLE
      ========================================= */}

      <div>
        <h2 className="ngo-header-title">
          {getPageTitle()}
        </h2>

        <p
          className={`ngo-header-subtitle ${
            isDark
              ? "ngo-header-subtitle-dark"
              : "ngo-header-subtitle-light"
          }`}
        >
          NGO Portal • FeedLink
        </p>
      </div>

      {/* ========================================
          RIGHT SIDE
      ========================================= */}

      <div className="ngo-header-right">

        {/* ======================================
            THEME INDICATOR
        ====================================== */}

        <span
          className={`ngo-theme-badge ${
            isDark
              ? "ngo-theme-badge-dark"
              : "ngo-theme-badge-light"
          }`}
        >
          {isDark
            ? "🌙 Dark Mode"
            : "☀️ Light Mode"}
        </span>

        {/* ======================================
            SEARCH BAR
        ====================================== */}

        <div className="ngo-search-container">
          <Search className="ngo-search-icon" />

          <input
            type="text"
            placeholder="Search Nearby Donations..."
            className={`ngo-search-input ${
              isDark
                ? "ngo-search-input-dark"
                : "ngo-search-input-light"
            }`}
          />
        </div>

        {/* ======================================
            NOTIFICATION
        ====================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setShowNotification(
                !showNotification
              )
            }
            className={`ngo-bell-btn ${
              isDark
                ? "ngo-bell-btn-dark"
                : "ngo-bell-btn-light"
            }`}
          >
            <Bell className="w-4 h-4" />

            {(newDonation ||
              freshnessNotification) && (
              <span className="ngo-bell-dot" />
            )}
          </button>

          {/* ====================================
              NEW DONATION POPUP
          ==================================== */}

          {showNotification &&
            notificationType ===
              "new-donation" &&
            newDonation && (
              <div
                className={`absolute right-0 top-12 z-50 w-[340px] rounded-2xl border p-4 shadow-xl ${
                  isDark
                    ? "border-slate-700 bg-slate-800"
                    : "border-emerald-200 bg-white"
                }`}
              >
                {/* HEADER */}

                <div className="mb-3 flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl">
                      🍱
                    </div>

                    <div>
                      <h4
                        className={`font-semibold ${
                          isDark
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        New Donation Available
                      </h4>

                      <p
                        className={`text-xs ${
                          isDark
                            ? "text-slate-400"
                            : "text-gray-500"
                        }`}
                      >
                        Just now
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleDismissNotification
                    }
                    className={`rounded-lg p-1 ${
                      isDark
                        ? "text-slate-400 hover:bg-slate-700"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

                {/* DONATION INFORMATION */}

                <div
                  className={`rounded-xl p-3 ${
                    isDark
                      ? "bg-slate-700"
                      : "bg-emerald-50"
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      isDark
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {newDonation.foodName ||
                      "Food Donation"}
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      isDark
                        ? "text-slate-300"
                        : "text-gray-600"
                    }`}
                  >
                    Quantity:{" "}
                    {newDonation.quantity ||
                      0}{" "}
                    KG
                  </p>

                  {newDonation.foodType && (
                    <p
                      className={`text-sm ${
                        isDark
                          ? "text-slate-300"
                          : "text-gray-600"
                      }`}
                    >
                      Type:{" "}
                      {newDonation.foodType}
                    </p>
                  )}

                  {newDonation.pickupAddress && (
                    <p
                      className={`mt-1 text-xs ${
                        isDark
                          ? "text-slate-400"
                          : "text-gray-500"
                      }`}
                    >
                      📍{" "}
                      {
                        newDonation.pickupAddress
                      }
                    </p>
                  )}
                </div>

                {/* REQUEST */}

                <button
                  type="button"
                  onClick={
                    handleRequestDonation
                  }
                  className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Request Donation
                </button>
              </div>
            )}

          {/* ====================================
              FRESHNESS ALERT POPUP
          ==================================== */}

          {showNotification &&
            notificationType ===
              "freshness" &&
            freshnessNotification && (
              <div
                className={`absolute right-0 top-12 z-50 w-[360px] rounded-2xl border p-4 shadow-xl ${
                  isDark
                    ? "border-red-900 bg-slate-800"
                    : "border-red-200 bg-white"
                }`}
              >
                {/* HEADER */}

                <div className="mb-3 flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl">
                      ⏰
                    </div>

                    <div>
                      <h4
                        className={`font-semibold ${
                          isDark
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {freshnessNotification.title ||
                          "Food Expiry Alert"}
                      </h4>

                      <p
                        className={`text-xs ${
                          isDark
                            ? "text-slate-400"
                            : "text-gray-500"
                        }`}
                      >
                        Freshness notification
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleDismissNotification
                    }
                    className={`rounded-lg p-1 ${
                      isDark
                        ? "text-slate-400 hover:bg-slate-700"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

                {/* ALERT INFORMATION */}

                <div
                  className={`rounded-xl border p-3 ${
                    isDark
                      ? "border-red-900 bg-red-950/40"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  <p
                    className={`font-semibold ${
                      isDark
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {freshnessNotification.foodName ||
                      "Food Donation"}
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      isDark
                        ? "text-red-300"
                        : "text-red-600"
                    }`}
                  >
                    {freshnessNotification.message ||
                      "This food is approaching its expiry time."}
                  </p>

                  {freshnessNotification.quantity && (
                    <p
                      className={`mt-1 text-xs ${
                        isDark
                          ? "text-slate-400"
                          : "text-gray-500"
                      }`}
                    >
                      Quantity:{" "}
                      {
                        freshnessNotification.quantity
                      }{" "}
                      KG
                    </p>
                  )}
                </div>

                {/* ACTION */}

                <div className="mt-3 flex gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setShowNotification(
                        false
                      );
                    }}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      isDark
                        ? "bg-slate-700 text-white hover:bg-slate-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Dismiss
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNotification(
                        false
                      );

                      if (
                        freshnessNotification.donationId
                      ) {
                        navigate(
                          `/ngo/active-requests`
                        );
                      }
                    }}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    View Donation
                  </button>

                </div>
              </div>
            )}
        </div>

        {/* ======================================
            PROFILE
        ====================================== */}

        <div
          onClick={() =>
            setShowProfileModal(
              !showProfileModal
            )
          }
          className={`ngo-profile-box ${
            isDark
              ? "ngo-profile-box-dark"
              : "ngo-profile-box-light"
          }`}
        >
          <img
            src={ngoData.image}
            alt={ngoData.name}
            className="ngo-profile-img"
          />

          <div className="text-left">
            <p
              className={`ngo-profile-text ${
                isDark
                  ? "ngo-profile-text-dark"
                  : "ngo-profile-text-light"
              }`}
            >
              Welcome, {ngoData.name}!
            </p>
          </div>
        </div>

        {/* ======================================
            NGO PROFILE MODAL
        ====================================== */}

        {showProfileModal && (
          <div
            ref={modalRef}
            className={`ngo-profile-modal ${
              isDark
                ? "ngo-profile-modal-dark"
                : "ngo-profile-modal-light"
            }`}
          >
            {/* PROFILE HEADER */}

            <div className="ngo-modal-header">

              <div className="flex items-center gap-3">

                <div className="ngo-modal-avatar">
                  {ngoData.name
                    ? ngoData.name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </div>

                <div>

                  <h3 className="font-bold text-sm">
                    {ngoData.name}
                  </h3>

                  <p className="ngo-modal-tag">
                    Verified Partner NGO •
                    Chattogram
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setShowProfileModal(
                    false
                  )
                }
                className="ngo-modal-close"
              >
                ×
              </button>

            </div>

            {/* DESCRIPTION */}

            <div className="ngo-modal-desc">

              <p
                className={
                  isDark
                    ? "text-slate-300"
                    : "text-slate-600"
                }
              >
                <strong className="text-emerald-500">
                  {ngoData.name}
                </strong>{" "}
                is a well-known non-profit
                social organization dedicated
                to collecting surplus food and
                distributing nutritious meals
                to underprivileged people.
              </p>

              <div className="ngo-modal-notice">
                ✨ NGO Details: Doing an
                exceptional job in food waste
                reduction and public welfare.
              </div>

            </div>

            {/* STATISTICS */}

            <div className="ngo-modal-stats">

              <div
                className={`ngo-stat-card ${
                  isDark
                    ? "ngo-stat-card-dark"
                    : "ngo-stat-card-light"
                }`}
              >
                <p className="ngo-stat-number">
                  1,450+
                </p>

                <p className="ngo-stat-label">
                  Total Food Donations
                  Collected
                </p>
              </div>

              <div
                className={`ngo-stat-card ${
                  isDark
                    ? "ngo-stat-card-dark"
                    : "ngo-stat-card-light"
                }`}
              >
                <p className="ngo-stat-number">
                  25+
                </p>

                <p className="ngo-stat-label">
                  Partner Restaurants
                </p>
              </div>

            </div>
          </div>
        )}
      </div>
    </header>
  );
}