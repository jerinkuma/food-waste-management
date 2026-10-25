
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  X,
  MapPin,
  Phone,
  UserPlus,
  Utensils,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./Header.css";

const API_URL = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function normalizeNgo(user = {}) {
  return {
    id: user.id || user._id || "",
    name:
      user.ngoName ||
      user.fullName ||
      user.organizationName ||
      user.name ||
      "User",
    email: user.email || "",
    image: user.image || user.avatar || user.profileImage || DEFAULT_IMAGE,
  };
}

export default function Header({
  userProfile,
  themeMode = "light",
  toggleTheme,
}) {
  const isDark = themeMode === "dark";
  const location = useLocation();
  const navigate = useNavigate();

  const [ngoData, setNgoData] = useState(() =>
    normalizeNgo({ ...getStoredUser(), ...userProfile })
  );

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    restaurants: [],
    donations: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isFollowingBusy, setIsFollowingBusy] = useState(false);

  const modalRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Sync NGO details with localStorage and profile updates.
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = getStoredUser();
      const profile = userProfile || {};

      setNgoData(
        normalizeNgo({
          ...profile,
          ...storedUser,
          id:
            storedUser.id ||
            storedUser._id ||
            profile.id ||
            profile._id ||
            "",
          name:
            storedUser.ngoName ||
            storedUser.fullName ||
            storedUser.organizationName ||
            storedUser.name ||
            profile.ngoName ||
            profile.fullName ||
            profile.organizationName ||
            profile.name ||
            "User",
          image:
            storedUser.image ||
            storedUser.avatar ||
            storedUser.profileImage ||
            profile.image ||
            profile.avatar ||
            DEFAULT_IMAGE,
        })
      );
    };

    loadUserData();
    window.addEventListener("storage", loadUserData);
    window.addEventListener("ngo_profile_updated", loadUserData);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("ngo_profile_updated", loadUserData);
    };
  }, [userProfile]);

  // Close popups when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotification(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications.
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const items =
        data.notifications ||
        data.data ||
        (Array.isArray(data) ? data : []);

      const safeItems = Array.isArray(items) ? items : [];

      setNotifications(safeItems);
      setUnreadCount(safeItems.filter((item) => !item.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Receive real-time notifications.
  useEffect(() => {
    const storedUser = getStoredUser();
    const userId = storedUser.id || storedUser._id || ngoData.id;

    if (!userId) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("identify", { role: "ngo", userId });
    });

    const handleNewNotification = (notification) => {
      if (notification?._id) {
        setNotifications((previous) => [
          notification,
          ...previous.filter((item) => item._id !== notification._id),
        ]);

        if (!notification.read) {
          setUnreadCount((previous) => previous + 1);
        }
      } else {
        fetchNotifications();
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("donation:priority-new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("donation:priority-new", handleNewNotification);
      socket.disconnect();
    };
  }, [fetchNotifications, ngoData.id]);

  // Debounced search.
  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults({ restaurants: [], donations: [] });
      setShowSearchDropdown(false);
      setIsSearching(false);
      return undefined;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setIsSearching(true);

      try {
        const response = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        if (cancelled) return;

        if (response.ok && data.success) {
          setSearchResults({
            restaurants: Array.isArray(data.restaurants)
              ? data.restaurants
              : [],
            donations: Array.isArray(data.donations)
              ? data.donations
              : [],
          });
        } else {
          setSearchResults({ restaurants: [], donations: [] });
        }

        setShowSearchDropdown(true);
      } catch (error) {
        if (!cancelled) {
          console.error("Search failed:", error);
          setSearchResults({ restaurants: [], donations: [] });
          setShowSearchDropdown(true);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleMarkAsRead = async (notificationId) => {
    const notification = notifications.find(
      (item) => item._id === notificationId
    );

    if (!notification || notification.read) return;

    const token = localStorage.getItem("token");

    try {
      if (token) {
        const response = await fetch(
          `${API_URL}/api/notifications/${notificationId}/read`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          console.error("Could not mark notification as read.");
          return;
        }
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notificationId ? { ...item, read: true } : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        const response = await fetch(
          `${API_URL}/api/notifications/read-all`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          console.error("Could not mark all notifications as read.");
          return;
        }
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleFollowRestaurantFromSearch = async (restaurant) => {
    const currentUserId = ngoData.id;
    const targetId =
      typeof restaurant.user === "object"
        ? restaurant.user?._id || restaurant.user?.id
        : restaurant.user || restaurant._id;

    if (!currentUserId || !targetId) {
      alert("NGO or restaurant information is missing.");
      return;
    }

    setIsFollowingBusy(true);

    try {
      const response = await fetch(`${API_URL}/api/partners/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: currentUserId,
          followerRole: "ngo",
          followingId: targetId,
          followingRole: restaurant.role || "donor",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        alert(data.message || "Could not follow this partner.");
        return;
      }

      window.dispatchEvent(new Event("partner_status_changed"));

      setSelectedRestaurant(null);
      alert(
        data.message ||
          `Follow request sent to ${
            restaurant.organizationName || restaurant.name || "restaurant"
          }.`
      );
    } catch (error) {
      console.error("Follow error:", error);
      alert("Failed to follow restaurant. Please try again.");
    } finally {
      setIsFollowingBusy(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return `Good Morning, ${ngoData.name}`;
    if (hour < 17) return `Good Afternoon, ${ngoData.name}`;
    return `Good Evening, ${ngoData.name}`;
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/ngo/dashboard":
        return getGreeting();
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
      case "/ngo/partners":
        return "Partners & Connections";
      default:
        return getGreeting();
    }
  };

  return (
    <header
      className={`ngo-header ${
        isDark ? "ngo-header-dark" : "ngo-header-light"
      }`}
    >
      <div>
        <h2 className="ngo-header-title">{getPageTitle()}</h2>
        <p
          className={`ngo-header-subtitle ${
            isDark
              ? "ngo-header-subtitle-dark"
              : "ngo-header-subtitle-light"
          }`}
        >
          NGO Portal · FeedLink
        </p>
      </div>

      <div className="ngo-header-right">
        <button
          type="button"
          onClick={toggleTheme}
          disabled={!toggleTheme}
          className={`ngo-theme-badge cursor-pointer flex items-center gap-1.5 ${
            isDark
              ? "ngo-theme-badge-dark"
              : "ngo-theme-badge-light"
          }`}
          title="Toggle theme"
        >
          {isDark ? (
            <>
              <Moon className="h-3.5 w-3.5" /> Dark Mode
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5" /> Light Mode
            </>
          )}
        </button>

        <div ref={searchRef} className="ngo-search-container relative">
          <Search className="ngo-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setShowSearchDropdown(true);
            }}
            placeholder="Search cafes, food, donations..."
            className={`ngo-search-input ${
              isDark
                ? "ngo-search-input-dark"
                : "ngo-search-input-light"
            }`}
          />

          {showSearchDropdown && (
            <div
              className={`absolute top-12 left-0 z-50 w-80 sm:w-96 max-w-[90vw] rounded-2xl border p-3 shadow-2xl ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-white"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              {isSearching ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  Searching...
                </div>
              ) : searchResults.restaurants.length === 0 &&
                searchResults.donations.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No restaurants or donations found.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-3">
                  {searchResults.restaurants.length > 0 && (
                    <section>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 mb-1.5 px-2">
                        Restaurants & Cafes
                      </p>

                      {searchResults.restaurants.map((restaurant) => (
                        <button
                          type="button"
                          key={restaurant._id}
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setShowSearchDropdown(false);
                          }}
                          className={`w-full text-left flex items-center gap-2.5 p-2 rounded-xl transition ${
                            isDark
                              ? "hover:bg-slate-700/60"
                              : "hover:bg-emerald-50"
                          }`}
                        >
                          <span className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                            {(restaurant.organizationName ||
                              restaurant.name ||
                              "R")
                              .charAt(0)
                              .toUpperCase()}
                          </span>

                          <span className="overflow-hidden">
                            <span className="block font-semibold text-xs truncate">
                              {restaurant.organizationName ||
                                restaurant.name ||
                                "Restaurant"}
                            </span>
                            <span className="block text-[10px] text-gray-400 truncate">
                              {restaurant.address || restaurant.email || ""}
                            </span>
                          </span>
                        </button>
                      ))}
                    </section>
                  )}

                  {searchResults.donations.length > 0 && (
                    <section>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-amber-500 mb-1.5 px-2">
                        Available Donations
                      </p>

                      {searchResults.donations.map((donation) => (
                        <button
                          type="button"
                          key={donation._id}
                          onClick={() => {
                            setSelectedDonation(donation);
                            setShowSearchDropdown(false);
                          }}
                          className={`w-full text-left flex items-center gap-2.5 p-2 rounded-xl transition ${
                            isDark
                              ? "hover:bg-slate-700/60"
                              : "hover:bg-amber-50"
                          }`}
                        >
                          <span className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Utensils className="h-4 w-4" />
                          </span>

                          <span className="overflow-hidden">
                            <span className="block font-semibold text-xs truncate">
                              {donation.foodName || "Food donation"}
                            </span>
                            <span className="block text-[10px] text-gray-400 truncate">
                              By{" "}
                              {donation.donor?.organizationName ||
                                donation.donor?.name ||
                                "Restaurant"}
                            </span>
                          </span>
                        </button>
                      ))}
                    </section>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotification((previous) => !previous)}
            className={`ngo-bell-btn relative ${
              isDark ? "ngo-bell-btn-dark" : "ngo-bell-btn-light"
            }`}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotification && (
            <div
              className={`absolute right-0 top-12 z-50 w-[min(420px,90vw)] rounded-2xl border p-4 shadow-2xl ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-white"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-emerald-500" />
                  <div>
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <p className="text-xs text-gray-400">
                      {notifications.length} total · {unreadCount} unread
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNotification(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                  aria-label="Close notifications"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                <span>Recent activity</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="font-medium text-emerald-500 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-400">
                    No notifications available.
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <button
                      type="button"
                      key={notification._id || `notification-${index}`}
                      onClick={() => handleMarkAsRead(notification._id)}
                      className={`block w-full text-left rounded-xl border p-3 text-xs transition ${
                        !notification.read
                          ? isDark
                            ? "bg-slate-700/80 border-emerald-500/40"
                            : "bg-emerald-50 border-emerald-200"
                          : isDark
                            ? "bg-slate-900/40 border-slate-700"
                            : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <span className="block font-semibold text-sm text-emerald-600">
                        {notification.title || "Notification"}
                      </span>
                      <span className="block mt-1 text-gray-600 dark:text-gray-300">
                        {notification.message || "You have a new notification."}
                      </span>
                      <span className="block mt-2 text-[10px] text-gray-400">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString()
                          : "Just now"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={modalRef}>
          <button
            type="button"
            onClick={() => setShowProfileModal((previous) => !previous)}
            className={`ngo-profile-box ${
              isDark ? "ngo-profile-box-dark" : "ngo-profile-box-light"
            }`}
          >
            <img
              src={ngoData.image}
              alt={ngoData.name}
              className="ngo-profile-img"
            />
            <span className="text-left">
              <span
                className={`ngo-profile-text ${
                  isDark
                    ? "ngo-profile-text-dark"
                    : "ngo-profile-text-light"
                }`}
              >
                Welcome, {ngoData.name}!
              </span>
            </span>
          </button>

          {showProfileModal && (
            <div
              className={`ngo-profile-modal ${
                isDark
                  ? "ngo-profile-modal-dark"
                  : "ngo-profile-modal-light"
              }`}
            >
              <div className="ngo-modal-header">
                <div className="flex items-center gap-3">
                  <div className="ngo-modal-avatar">
                    {ngoData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{ngoData.name}</h3>
                    <p className="ngo-modal-tag">
                      NGO Partner · FeedLink
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="ngo-modal-close"
                  aria-label="Close profile"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="ngo-modal-desc">
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  <strong className="text-emerald-500">
                    {ngoData.name}
                  </strong>{" "}
                  is helping reduce food waste and support communities through
                  surplus food distribution.
                </p>
                {ngoData.email && (
                  <p className="mt-2 text-sm text-gray-500">
                    {ngoData.email}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedRestaurant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedRestaurant(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Close restaurant details"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4 flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-lg font-bold text-white">
                {(selectedRestaurant.organizationName ||
                  selectedRestaurant.name ||
                  "R")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {selectedRestaurant.organizationName ||
                    selectedRestaurant.name ||
                    "Restaurant"}
                </h3>
                <p className="text-xs font-medium text-emerald-500">
                  Restaurant / Cafe
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  {selectedRestaurant.address || "Address not available"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  {selectedRestaurant.phone || "Phone not available"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isFollowingBusy}
                onClick={() =>
                  handleFollowRestaurantFromSearch(selectedRestaurant)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                {isFollowingBusy ? "Following..." : "Follow Restaurant"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedRestaurant(null)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold dark:border-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDonation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedDonation(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Close donation details"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">
              Available Food Donation
            </span>

            <h3 className="mt-3 text-lg font-bold">
              {selectedDonation.foodName || "Food donation"}
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Posted by{" "}
              <strong className="text-emerald-500">
                {selectedDonation.donor?.organizationName ||
                  selectedDonation.donor?.name ||
                  "Restaurant"}
              </strong>
            </p>

            <div className="my-5 space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 dark:border-slate-600 dark:bg-slate-700/50 dark:text-gray-300">
              <p>
                <MapPin className="mr-1 inline h-4 w-4" />
                <strong>Pickup address:</strong>{" "}
                {selectedDonation.pickupAddress ||
                  selectedDonation.address ||
                  "Address not available"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedDonation.status || "Status not available"}
              </p>
              {selectedDonation.quantity != null && (
                <p>
                  <strong>Quantity:</strong> {selectedDonation.quantity}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedDonation(null);
                navigate("/ngo/donation-map");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-600"
            >
              <Utensils className="h-4 w-4" />
              View Donation Map
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
