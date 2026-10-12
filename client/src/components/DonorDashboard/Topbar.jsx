
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Search,
  CalendarDays,
  Moon,
  Sun,
  CheckCircle2,
  Utensils,
  Truck,
  Star,
  AlertCircle,
  Package,
  X,
  CheckCheck,
  Clock,
  RefreshCw,
} from "lucide-react";

import { getCurrentUser } from "../../services/auth";
import { getSocket } from "../../services/socket";

const API_BASE = "http://localhost:5000/api";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  JSON.parse(localStorage.getItem("user") || "{}")?.token ||
  "";

const Topbar = ({ isDark, setIsDark }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const userData = localStorage.getItem("user");
  const user = userData
    ? JSON.parse(userData)
    : getCurrentUser();

  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfileImage = async () => {
      const currentUser = getCurrentUser();

      if (!currentUser?.id) {
        setProfileImage("");
        return;
      }

      // Login data-তে image থাকলে প্রথমে সেটি দেখাবে
      const savedImage =
        currentUser.profileImage ||
        currentUser.restaurant?.profileImage;

      if (savedImage) {
        setProfileImage(
          savedImage.startsWith("http")
            ? savedImage
            : `http://localhost:5000${savedImage}`
        );
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/restaurants/profile/${currentUser.id}`
        );

        if (!response.ok) {
          throw new Error("Could not load latest profile image.");
        }

        const result = await response.json();
        const restaurant = result.restaurant;

        // API response-এ image যে field-এ আছে, সেখান থেকে নেবে
        const latestImage =
          restaurant?.profileImage ||
          restaurant?.user?.profileImage ||
          restaurant?.image;

        if (!cancelled) {
          setProfileImage(
            latestImage
              ? latestImage.startsWith("http")
                ? latestImage
                : `http://localhost:5000${latestImage}`
              : ""
          );
        }
      } catch (error) {
        console.error("Topbar profile image error:", error);
      }
    };

    loadProfileImage();

    return () => {
      cancelled = true;
    };
  }, []);

  // Greeting
  const hour = new Date().getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? "Good Morning"
      : hour >= 12 && hour < 17
        ? "Good Afternoon"
        : hour >= 17 && hour < 21
          ? "Good Evening"
          : "Good Night";

  // Today's date
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Load all notifications
  const loadNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setNotificationError("Please log in again to view notifications.");
      setLoadingNotifications(false);
      return;
    }

    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load notifications.");
      }

      const items = Array.isArray(result.notifications)
        ? result.notifications
        : [];

      setNotifications(items);
      setUnreadCount(items.filter((item) => !item.read).length);
    } catch (error) {
      console.error("Load notifications error:", error);
      setNotificationError(error.message || "Unable to load notifications.");
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setUnreadCount(result.count || 0);
      }
    } catch (error) {
      console.error("Unread count error:", error);
    }
  }, []);

  // Initial load and real-time notifications
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    const socket = getSocket();

    const handleNewNotification = (notification) => {
      if (!notification?._id) return;

      setNotifications((previous) => {
        if (previous.some((item) => item._id === notification._id)) {
          return previous;
        }

        return [notification, ...previous];
      });

      if (!notification.read) {
        setUnreadCount((previous) => previous + 1);
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [loadNotifications, loadUnreadCount]);

  // Close modal with Escape
  useEffect(() => {
    if (!showNotifications) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotifications]);

  // Mark one notification as read
  const markAsRead = async (notificationId) => {
    const token = getToken();
    if (!token || !notificationId) return false;

    const current = notifications.find(
      (item) => item._id === notificationId
    );

    if (!current || current.read) return true;

    try {
      const response = await fetch(
        `${API_BASE}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not mark as read.");
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notificationId
            ? { ...item, read: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(previous - 1, 0));
      return true;
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const token = getToken();

    if (!token || unreadCount === 0 || markingAll) return;

    try {
      setMarkingAll(true);

      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not mark all as read.");
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
      setNotificationError(error.message || "Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  // Clicking a notification marks it read without navigating away.
  const handleNotificationClick = async (notification) => {
    if (!notification?.read) {
      await markAsRead(notification._id);
    }
  };

  // Icon for notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "DONATION_ACCEPTED":
      case "DONATION_COMPLETED":
      case "PICKUP_COMPLETED":
        return CheckCircle2;

      case "DRIVER_ASSIGNED":
      case "PICKUP_STARTED":
        return Truck;

      case "RATING_RECEIVED":
      case "FEEDBACK_RECEIVED":
      case "FEEDBACK_RESPONSE":
        return Star;

      case "DONATION_REJECTED":
        return AlertCircle;

      case "NEW_DONATION":
      case "DONATION_REQUEST":
      default:
        return Utensils;
    }
  };

  // Notification time
  const formatNotificationTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const unreadNotifications = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <header
      className={`fixed top-0 right-0 left-[72px] z-[9999] border-b px-3 py-3 shadow-sm transition-colors duration-300 sm:px-5 sm:py-4 md:left-64 lg:px-8 ${isDark
        ? "border-slate-700 bg-slate-900"
        : "border-gray-200 bg-white"
        }`}
    >
      <div className="flex min-h-[64px] items-center justify-between gap-2 sm:gap-4">
        {/* LEFT: GREETING AND DATE */}
        <div className="min-w-0 flex-1">
          <h1
            className={`truncate text-base font-bold sm:text-xl md:text-2xl lg:text-3xl ${isDark ? "text-white" : "text-gray-800"
              }`}
          >
            {greeting}, {user?.name || "Restaurant"}
          </h1>

          <div
            className={`mt-1 flex min-w-0 items-center gap-1.5 sm:gap-2 ${isDark ? "text-slate-400" : "text-gray-500"
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

        {/* RIGHT: ACTIONS */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5">
          {/* Search */}
          <div className="relative hidden xl:block">
            <Search
              size={18}
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-gray-400"
                }`}
            />
            <input
              type="text"
              placeholder="Search donations, NGOs..."
              className={`w-60 rounded-xl border py-3 pl-11 pr-4 outline-none transition duration-300 2xl:w-72 ${isDark
                ? "border-slate-700 bg-slate-800 text-white placeholder-slate-400 focus:border-green-500"
                : "border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:border-green-500 focus:bg-white"
                }`}
            />
          </div>

          {/* Dark mode */}
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition duration-300 sm:h-10 sm:w-10 md:h-11 md:w-11 md:rounded-xl ${isDark
              ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
              : "bg-gray-100 text-gray-700 hover:bg-green-100"
              }`}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Notifications bell */}
          <button
            type="button"
            onClick={() => {
              setShowNotifications(true);
              loadNotifications();
            }}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition duration-300 sm:h-10 sm:w-10 md:h-11 md:w-11 md:rounded-xl ${isDark
              ? "bg-slate-800 hover:bg-slate-700"
              : "bg-gray-100 hover:bg-green-100"
              }`}
            aria-label="Open notifications"
            aria-haspopup="dialog"
            aria-expanded={showNotifications}
          >
            <Bell
              size={19}
              className={isDark ? "text-slate-200" : "text-gray-700"}
            />

            {unreadCount > 0 && (
              <span
                className={`absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ${isDark
                  ? "border-2 border-slate-900"
                  : "border-2 border-white"
                  }`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            type="button"
            className={`shrink-0 rounded-full p-1 transition ${isDark
              ? "ring-2 ring-slate-700 hover:ring-green-500"
              : "ring-2 ring-gray-200 hover:ring-green-500"
              }`}
            aria-label="Profile"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={user?.name || "Restaurant"}
                onError={() => setProfileImage("")}
                className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10 md:h-11 md:w-11"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 sm:h-10 sm:w-10 md:h-11 md:w-11">
                {user?.name?.charAt(0)?.toUpperCase() || "R"}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* FULL NOTIFICATIONS MODAL */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-[2px] sm:p-4 md:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowNotifications(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            className={`my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl min-w-0 flex-col overflow-hidden rounded-xl border shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl ${isDark
              ? "border-slate-700 bg-slate-800 text-white"
              : "border-gray-200 bg-white text-gray-800"
              }`}
          >
            {/* Modal header */}
            <div
              className={`flex items-center justify-between border-b px-5 py-4 sm:px-7 sm:py-5 ${isDark ? "border-slate-700" : "border-gray-200"
                }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                  <Bell size={23} />
                </div>

                <div className="min-w-0">
                  <h2
                    id="notifications-title"
                    className="text-lg font-bold sm:text-xl"
                  >
                    All Notifications
                  </h2>
                  <p
                    className={`mt-1 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    {notifications.length} total · {unreadNotifications} unread
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className={`rounded-lg p-2 transition ${isDark
                  ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                aria-label="Close notifications"
              >
                <X size={23} />
              </button>
            </div>

            {/* Modal toolbar */}
            <div
              className={`flex items-center justify-between gap-3 border-b px-5 py-3 sm:px-7 ${isDark ? "border-slate-700" : "border-gray-100"
                }`}
            >
              <span
                className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-600"
                  }`}
              >
                Recent activity
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadNotifications}
                  disabled={loadingNotifications}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs transition ${isDark
                    ? "text-slate-300 hover:bg-slate-700"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <RefreshCw
                    size={14}
                    className={loadingNotifications ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0 || markingAll}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-green-500 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  <CheckCheck size={15} />
                  {markingAll ? "Updating..." : "Mark all read"}
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadingNotifications && notifications.length === 0 ? (
                <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-slate-400">
                  <RefreshCw size={18} className="animate-spin" />
                  Loading notifications...
                </div>
              ) : notificationError && notifications.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <AlertCircle
                    className="mx-auto mb-3 text-red-500"
                    size={30}
                  />
                  <p className="text-sm text-red-500">{notificationError}</p>
                  <button
                    type="button"
                    onClick={loadNotifications}
                    className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${isDark
                      ? "bg-slate-700 text-slate-400"
                      : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    <Bell size={27} />
                  </div>
                  <h3 className="font-semibold">No notifications yet</h3>
                  <p
                    className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    Updates about your donations will appear here.
                  </p>
                </div>
              ) : (
                <div
                  className={`divide-y ${isDark ? "divide-slate-700" : "divide-gray-100"
                    }`}
                >
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);

                    return (
                      <button
                        type="button"
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full items-start gap-3 px-5 py-4 text-left transition sm:gap-4 sm:px-7 sm:py-5 ${!notification.read
                          ? isDark
                            ? "bg-green-500/[0.06] hover:bg-green-500/[0.12]"
                            : "bg-green-50/70 hover:bg-green-50"
                          : isDark
                            ? "hover:bg-slate-700/60"
                            : "hover:bg-gray-50"
                          }`}
                      >
                        <div
                          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isDark
                            ? "bg-slate-700 text-green-400"
                            : "bg-green-50 text-green-700"
                            }`}
                        >
                          <Icon size={21} />

                          {!notification.read && (
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold sm:text-base">
                              {notification.title}
                            </h3>

                            {!notification.read && (
                              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-500">
                                UNREAD
                              </span>
                            )}
                          </div>

                          <p
                            className={`mt-1 text-sm leading-6 ${isDark ? "text-slate-300" : "text-gray-600"
                              }`}
                          >
                            {notification.message}
                          </p>

                          <p
                            className={`mt-2 flex items-center gap-1.5 text-xs ${isDark ? "text-slate-500" : "text-gray-400"
                              }`}
                          >
                            <Clock size={13} />
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>

                        {!notification.read && (
                          <span
                            className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500"
                            aria-label="Unread notification"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              className={`flex items-center justify-between gap-3 border-t px-5 py-3 sm:px-7 sm:py-4 ${isDark ? "border-slate-700" : "border-gray-200"
                }`}
            >
              <span
                className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                {unreadNotifications} unread
              </span>

              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
