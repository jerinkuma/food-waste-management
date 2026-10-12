import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("user") || "{}")?.token ||
    ""
  );
};

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
      return Star;
    case "DONATION_REJECTED":
      return AlertCircle;
    default:
      return Package;
  }
};

const formatTime = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please log in again to view your notifications.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load notifications.");
      }

      setNotifications(
        Array.isArray(result.notifications) ? result.notifications : []
      );
    } catch (err) {
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleNotificationClick = async (notification) => {
    const token = getToken();

    if (!notification.read && token) {
      try {
        const response = await fetch(
          `${API_BASE}/notifications/${notification._id}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setNotifications((previous) =>
            previous.map((item) =>
              item._id === notification._id
                ? { ...item, read: true }
                : item
            )
          );
        }
      } catch (err) {
        console.error("Mark notification as read failed:", err);
      }
    }

    const donationId =
      notification.data?.donationId ||
      (typeof notification.donation === "object"
        ? notification.donation?.donationId ||
          notification.donation?._id
        : notification.donation);

    if (donationId) {
      navigate(
        `/restaurant/donation-history?donationId=${encodeURIComponent(
          donationId
        )}`
      );
    }
  };

  const handleMarkAllRead = async () => {
    const token = getToken();

    if (!token || unreadCount === 0) return;

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
        throw new Error(result.message || "Could not mark notifications as read.");
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      );
    } catch (err) {
      setError(err.message || "Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Bell size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Stay updated on your donations.
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-700">
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markingAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />
            {markingAll ? "Updating..." : "Mark all as read"}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-800">
              All notifications
            </h2>

            <button
              type="button"
              onClick={loadNotifications}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading notifications...
            </div>
          ) : error ? (
            <div className="px-5 py-12 text-center">
              <AlertCircle className="mx-auto mb-3 text-red-500" size={30} />
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={loadNotifications}
                className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Bell className="mx-auto mb-3 text-slate-300" size={38} />
              <h3 className="font-semibold text-slate-700">
                No notifications yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Updates about your donations will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);

                return (
                  <button
                    type="button"
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex w-full items-start gap-3 px-4 py-5 text-left transition hover:bg-slate-50 sm:gap-4 sm:px-6 ${
                      !notification.read ? "bg-emerald-50/50" : "bg-white"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-emerald-700">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            NEW
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={13} />
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.read && (
                      <span
                        className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600"
                        aria-label="Unread"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
