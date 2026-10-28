import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

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

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Header.css";

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export default function Header({ userProfile, themeMode, toggleTheme }) {
  const isDark = themeMode === "dark";

  const location = useLocation();
  const navigate = useNavigate();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // SEARCH & RESULTS STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ restaurants: [], donations: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // SELECTED ITEM MODAL STATE
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isFollowingBusy, setIsFollowingBusy] = useState(false);

  const modalRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // NGO USER DATA (Synced with localStorage & props - Fixed Priority for ngoName/fullName)
  const [ngoData, setNgoData] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return {
          id: parsed.id || parsed._id || userProfile?.id || "",
          name: parsed.ngoName || parsed.fullName || parsed.organizationName || parsed.name || userProfile?.ngoName || "User",
          email: parsed.email || userProfile?.email || "",
          image: parsed.image || parsed.avatar || userProfile?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      id: userProfile?.id || userProfile?._id || "",
      name: userProfile?.ngoName || userProfile?.fullName || userProfile?.name || "User",
      email: userProfile?.email || "",
      image: userProfile?.avatar || userProfile?.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
    };
  });

  // SYNC WITH userProfile PROP OR LOCALSTORAGE EVENT
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setNgoData({
            id: parsedUser.id || parsedUser._id || "",
            name: parsedUser.ngoName || parsedUser.fullName || parsedUser.organizationName || parsedUser.name || "User",
            email: parsedUser.email || "",
            image: parsedUser.image || parsedUser.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
          });
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }

      if (userProfile && Object.keys(userProfile).length > 0) {
        setNgoData({
          id: userProfile.id || userProfile._id || "",
          name: userProfile.ngoName || userProfile.fullName || userProfile.name || "User",
          email: userProfile.email || "",
          image: userProfile.avatar || userProfile.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
        });
      }
    };

    loadUserData();

    window.addEventListener("storage", loadUserData);
    window.addEventListener("ngo_profile_updated", loadUserData);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("ngo_profile_updated", loadUserData);
    };
  }, [userProfile]);

  // FETCH REAL NOTIFICATIONS FROM BACKEND
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const notifs = data.notifications || data.data || (Array.isArray(data) ? data : []);
        setNotifications(Array.isArray(notifs) ? notifs : []);
        const unread = notifs.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // SEARCH API CALL (DEBOUNCED)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ restaurants: [], donations: [] });
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setSearchResults({
            restaurants: data.restaurants || [],
            donations: data.donations || [],
          });
          setShowSearchDropdown(true);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // OUTSIDE CLICK HANDLER
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotification(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SOCKET.IO (REAL-TIME NOTIFICATIONS)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    let user = null;
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      return;
    }

    const userId = user.id || user._id;
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("identify", { role: "ngo", userId: userId });
    });

    const handleNewNotification = (newNotif) => {
      if (newNotif && newNotif._id) {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } else {
        fetchNotifications();
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("donation:priority-new", handleNewNotification);

    return () => {
      socket.off("connect");
      socket.off("notification:new");
      socket.off("donation:priority-new");
      socket.disconnect();
    };
  }, [fetchNotifications]);

  // MARK AS READ
  const handleMarkAsRead = async (notifId) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`http://localhost:5000/api/notifications/${notifId}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // SEARCH RESTAURANT FOLLOW HANDLER
  const handleFollowRestaurantFromSearch = async (restaurant) => {
    const currentUserId = ngoData.id;
    const targetId = restaurant.user || restaurant._id;
    if (!currentUserId || !targetId) return;

    setIsFollowingBusy(true);
    try {
      const response = await fetch("http://localhost:5000/api/partners/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: currentUserId,
          followerRole: "ngo",
          followingId: targetId,
          followingRole: restaurant.role || "donor"
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        window.dispatchEvent(new Event("partner_status_changed"));
        const socket = io(SOCKET_URL);
        socket.emit("follow:new", { followerId: currentUserId, followingId: targetId });
        alert(`Successfully followed ${restaurant.organizationName || restaurant.name}!`);
        setSelectedRestaurant(null);
      } else {
        alert(data.message || "Could not follow this partner.");
      }
    } catch (error) {
      console.error("Follow error:", error);
      alert("Failed to follow partner.");
    } finally {
      setIsFollowingBusy(false);
    }
  };

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return `Good Morning, ${ngoData.name}`;
    if (currentHour < 17) return `Good Afternoon, ${ngoData.name}`;
    return `Good Evening, ${ngoData.name}`;
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/ngo/dashboard": return getGreeting();
      case "/ngo/donation-map": return "Donation Map";
      case "/ngo/active-requests": return "Active Requests";
      case "/ngo/history": return "History & Logs";
      case "/ngo/trust-score": return "Trust Score";
      case "/ngo/feedback": return "Feedback";
      case "/ngo/settings": return "Settings";
      case "/ngo/partners": return "Partners & Connections";
      default: return getGreeting();
    }
  };

  return (
    <header className={`ngo-header ${isDark ? "ngo-header-dark" : "ngo-header-light"}`}>
      <div>
        <h2 className="ngo-header-title">{getPageTitle()}</h2>
        <p className={`ngo-header-subtitle ${isDark ? "ngo-header-subtitle-dark" : "ngo-header-subtitle-light"}`}>
          NGO Portal • FeedLink
        </p>
      </div>

      <div className="ngo-header-right">
        {/* THEME TOGGLE */}
        <button
          type="button"
          onClick={toggleTheme}
          className={`ngo-theme-badge cursor-pointer flex items-center gap-1.5 transition-all duration-200 ${
            isDark ? "ngo-theme-badge-dark hover:bg-slate-700" : "ngo-theme-badge-light hover:bg-gray-100"
          }`}
          title="Toggle Theme"
        >
          {isDark ? (
            <><Moon className="w-3.5 h-3.5 text-yellow-400" /> Dark Mode</>
          ) : (
            <><Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode</>
          )}
        </button>

        {/* SEARCH BAR & DROPDOWN */}
        <div ref={searchRef} className="ngo-search-container relative">
          <Search className="ngo-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
            placeholder="Search Cafe 24, Biryani, NGOs..."
            className={`ngo-search-input ${isDark ? "ngo-search-input-dark" : "ngo-search-input-light"}`}
          />

          {/* SEARCH RESULTS DROPDOWN */}
          {showSearchDropdown && (
            <div className={`absolute top-12 left-0 z-50 w-80 sm:w-96 rounded-2xl border p-3 shadow-2xl ${
              isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
            }`}>
              {isSearching ? (
                <div className="py-6 text-center text-xs text-gray-400">Searching...</div>
              ) : searchResults.restaurants.length === 0 && searchResults.donations.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">No restaurants or donations found.</div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-3">
                  {/* RESTAURANTS SECTION */}
                  {searchResults.restaurants.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-500 mb-1.5 px-2">
                        Restaurants & Cafes
                      </p>
                      {searchResults.restaurants.map((res) => (
                        <div
                          key={res._id}
                          onClick={() => {
                            setSelectedRestaurant(res);
                            setShowSearchDropdown(false);
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                            isDark ? "hover:bg-slate-700/60" : "hover:bg-emerald-50"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                            {res.name ? res.name.charAt(0).toUpperCase() : "R"}
                          </div>
                          <div className="overflow-hidden">
                            <h5 className="font-semibold text-xs truncate">{res.organizationName || res.name}</h5>
                            <p className="text-[10px] text-gray-400 truncate">{res.address || res.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DONATIONS SECTION */}
                  {searchResults.donations.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-amber-500 mb-1.5 px-2">
                        Available Donations
                      </p>
                      {searchResults.donations.map((don) => (
                        <div
                          key={don._id}
                          onClick={() => {
                            setSelectedDonation(don);
                            setShowSearchDropdown(false);
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                            isDark ? "hover:bg-slate-700/60" : "hover:bg-amber-50"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                            🍲
                          </div>
                          <div className="overflow-hidden">
                            <h5 className="font-semibold text-xs truncate">{don.foodName}</h5>
                            <p className="text-[10px] text-gray-400 truncate">
                              By {don.donor?.organizationName || don.donor?.name || "Restaurant"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* NOTIFICATION MODAL */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setShowNotification(!showNotification)}
            className={`ngo-bell-btn relative ${isDark ? "ngo-bell-btn-dark" : "ngo-bell-btn-light"}`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotification && (
            <div className={`absolute right-0 top-12 z-50 w-[420px] rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-slate-700 bg-slate-800 text-white" : "border-gray-200 bg-white text-gray-900"
            }`}>
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">🔔</div>
                  <div>
                    <h4 className="font-bold text-sm">All Notifications</h4>
                    <p className="text-xs text-gray-400">{notifications.length} total • {unreadCount} unread</p>
                  </div>
                </div>
                <button onClick={() => setShowNotification(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                <span>Recent activity</span>
                <span 
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      if (token) {
                        await fetch("http://localhost:5000/api/notifications/read-all", {
                          method: "PATCH",
                          headers: { Authorization: `Bearer ${token}` },
                        });
                      }
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      setUnreadCount(0);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="cursor-pointer font-medium text-emerald-500 hover:underline flex items-center gap-1"
                >
                  ✓ Mark all read
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">No notifications available.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id || Math.random()}
                      onClick={() => handleMarkAsRead(n._id)}
                      className={`cursor-pointer rounded-xl p-3.5 text-xs transition border relative ${
                        !n.read
                          ? isDark ? "bg-slate-700/80 border-emerald-500/40" : "bg-emerald-50/70 border-emerald-200"
                          : isDark ? "bg-slate-900/40 border-slate-700 opacity-80" : "bg-gray-50 border-gray-100 opacity-80"
                      }`}
                    >
                      {!n.read && <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-emerald-500" />}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{n.title || "Notification"}</span>
                        {!n.read && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">UNREAD</span>}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-1.5">{n.message}</p>
                      <span className="text-[10px] text-gray-400 block">🕒 {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 border-t pt-3 flex justify-end">
                <button type="button" onClick={() => setShowNotification(false)} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PROFILE BOX */}
        <div
          onClick={() => setShowProfileModal(!showProfileModal)}
          className={`ngo-profile-box cursor-pointer ${isDark ? "ngo-profile-box-dark" : "ngo-profile-box-light"}`}
        >
          <img src={ngoData.image} alt={ngoData.name} className="ngo-profile-img" />
          <div className="text-left">
            <p className={`ngo-profile-text ${isDark ? "ngo-profile-text-dark" : "ngo-profile-text-light"}`}>
              Welcome, {ngoData.name}!
            </p>
          </div>
        </div>

        {/* NGO PROFILE MODAL */}
        {showProfileModal && (
          <div ref={modalRef} className={`ngo-profile-modal ${isDark ? "ngo-profile-modal-dark" : "ngo-profile-modal-light"}`}>
            <div className="ngo-modal-header">
              <div className="flex items-center gap-3">
                <div className="ngo-modal-avatar">{ngoData.name ? ngoData.name.charAt(0).toUpperCase() : "U"}</div>
                <div>
                  <h3 className="font-bold text-sm">{ngoData.name}</h3>
                  <p className="ngo-modal-tag">Verified Partner NGO • Chattogram</p>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="ngo-modal-close">×</button>
            </div>
            <div className="ngo-modal-desc mt-3">
              <p className={isDark ? "text-slate-300 text-xs" : "text-slate-600 text-xs"}>
                <strong className="text-emerald-500">{ngoData.name}</strong> is dedicated to managing surplus food and serving communities.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SEARCH RESULT DETAILS POPUP MODALS */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border relative ${
            isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
          }`}>
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
                {selectedRestaurant.organizationName ? selectedRestaurant.organizationName.charAt(0).toUpperCase() : "R"}
              </div>
              <div>
                <h3 className="font-bold text-base">{selectedRestaurant.organizationName || selectedRestaurant.name}</h3>
                <p className="text-xs text-emerald-500 font-medium">Verified Partner Restaurant</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{selectedRestaurant.address || "Chattogram, Bangladesh"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{selectedRestaurant.phone || "No phone listed"}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                disabled={isFollowingBusy}
                onClick={() => handleFollowRestaurantFromSearch(selectedRestaurant)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition"
              >
                <UserPlus className="h-4 w-4" /> {isFollowingBusy ? "Following..." : "Follow Restaurant"}
              </button>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl border relative ${
            isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-gray-200 text-gray-900"
          }`}>
            <button
              onClick={() => setSelectedDonation(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-[10px] uppercase">
                Active Surplus Food
              </span>
              <h3 className="font-bold text-lg mt-2">{selectedDonation.foodName}</h3>
              <p className="text-xs text-gray-400">
                Posted by <strong className="text-emerald-500">{selectedDonation.donor?.organizationName || selectedDonation.donor?.name || "Partner Cafe"}</strong>
              </p>
            </div>

            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl border border-gray-100 dark:border-slate-600">
              <p>📍 <strong>Pickup Address:</strong> {selectedDonation.pickupAddress || "Restaurant Location"}</p>
              <p>⏳ <strong>Status:</strong> {selectedDonation.status || "Waiting for Acceptance"}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigate("/ngo/donation-map");
                  setSelectedDonation(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-amber-600 transition"
              >
                <Utensils className="h-4 w-4" /> View on Donation Map
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}