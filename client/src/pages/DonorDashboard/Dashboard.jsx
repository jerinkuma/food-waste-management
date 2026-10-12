import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";
import StatCard from "../../components/DonorDashboard/StatCard";
import DonationTracker from "../../components/DonorDashboard/DonationTracker";
import EnvironmentalImpact from "../../components/DonorDashboard/EnvironmentalImpact";
import NGOPerformance from "../../components/DonorDashboard/NGOPerformance";
import TopDonatedCategories from "../../components/DonorDashboard/TopDonatedCategories";

const SOCKET_URL = "http://localhost:5000";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // REAL-TIME FRESHNESS NOTIFICATION
  // ==========================================

  const [freshnessNotification, setFreshnessNotification] =
    useState(null);

  const socketRef = useRef(null);

  // Prevent the same notification from repeatedly
  // replacing the current notification.
  const lastNotificationRef = useRef("");

  // ==========================================
  // LOAD DONOR DASHBOARD
  // ==========================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const userData = localStorage.getItem("user");

      console.log("USER FROM LOCAL STORAGE:", userData);

      const user = userData ? JSON.parse(userData) : null;

      console.log("PARSED USER:", user);

      if (!user?.id) {
        setError("User information not found.");
        setLoading(false);
        return;
      }

      const apiUrl = `http://localhost:5000/api/donations/dashboard/${user.id}`;

      console.log("DASHBOARD API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },

        // Prevent browser from showing an old cached response
        cache: "no-store",
      });

      console.log("DASHBOARD RESPONSE STATUS:", response.status);

      const data = await response.json();

      console.log("DONOR DASHBOARD API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load dashboard."
        );
      }

      // ==========================================
      // NEW BACKEND RESPONSE
      // ==========================================

      if (data?.dashboard) {
        console.log(
          "DASHBOARD DATA FOUND:",
          data.dashboard
        );

        setDashboard(data.dashboard);

        return;
      }

      // ==========================================
      // OLD BACKEND RESPONSE SUPPORT
      // ==========================================

      if (data?.stats) {
        console.log(
          "OLD STATS DATA FOUND:",
          data.stats
        );

        const stats = data.stats;

        const fallbackDashboard = {
          totalDonations: stats.total || 0,

          todayDonations: 0,

          mealsServed: 0,

          foodWasteDiverted: 0,

          activeDonations:
            (stats.pending || 0) +
            (stats.accepted || 0) +
            (stats.outForDelivery || 0),

          pendingDonations:
            stats.pending || 0,

          acceptedDonations:
            stats.accepted || 0,

          outForDelivery:
            stats.outForDelivery || 0,

          completedDonations:
            stats.completed || 0,

          rejectedDonations:
            stats.rejected || 0,

          carbonPrevented: 0,

          treesEquivalent: 0,

          waterSaved: 0,

          annualGoal: 0,

          recentDonations: [],

          pickupDonations: [],

          ngoPartners: [],

          categories: [],

          stats,
        };

        console.log(
          "CREATED FALLBACK DASHBOARD:",
          fallbackDashboard
        );

        setDashboard(fallbackDashboard);

        return;
      }

      // ==========================================
      // NO DASHBOARD DATA
      // ==========================================

      console.log(
        "NO DASHBOARD OR STATS FOUND IN API RESPONSE."
      );

      setDashboard(null);
    } catch (error) {
      console.error(
        "DONOR DASHBOARD ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ON PAGE OPEN
  // ==========================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================
  // SOCKET.IO - REAL-TIME FRESHNESS ALERT
  // ==========================================

  useEffect(() => {
    const userData =
      localStorage.getItem("user");

    if (!userData) {
      return;
    }

    let user = null;

    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error(
        "Error parsing user data for socket:",
        error
      );

      return;
    }

    if (!user?.id) {
      console.error(
        "User ID not found. Socket connection skipped."
      );

      return;
    }

    console.log(
      "Connecting donor socket..."
    );

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // ==========================================
    // SOCKET CONNECTED
    // ==========================================

    socket.on("connect", () => {
      console.log(
        "DONOR SOCKET CONNECTED:",
        socket.id
      );

      /*
       * IMPORTANT:
       * The exact room-join event must match
       * server/utils/socket.js.
       */

      socket.emit("identify", {
        role: "donor",
        userId: user.id,
      });

      console.log(
        "DONOR JOIN REQUEST SENT:",
        user.id
      );
    });

    // ==========================================
    // FRESHNESS ALERT RECEIVED
    // ==========================================

    socket.on(
      "donation:freshness-alert",
      (notification) => {
        console.log(
          "FRESHNESS ALERT RECEIVED:",
          notification
        );

        if (!notification) {
          return;
        }

        /*
         * Create a unique key so the same alert
         * does not constantly replace itself.
         */

        const notificationKey = [
          notification.donationId ||
            notification.customDonationId ||
            "",

          notification.urgency || "",

          notification.remainingMinutes || "",
        ].join("-");

        if (
          lastNotificationRef.current ===
          notificationKey
        ) {
          return;
        }

        lastNotificationRef.current =
          notificationKey;

        setFreshnessNotification(
          notification
        );
      }
    );

    // ==========================================
    // SOCKET ERROR
    // ==========================================

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "DONOR SOCKET CONNECTION ERROR:",
          error
        );
      }
    );

    // ==========================================
    // CLEANUP
    // ==========================================

    return () => {
      console.log(
        "Disconnecting donor socket..."
      );

      socket.off(
        "donation:freshness-alert"
      );

      socket.off("connect");

      socket.off("connect_error");

      socket.disconnect();

      socketRef.current = null;
    };
  }, []);

  // ==========================================
  // DEBUG STATE
  // ==========================================

  console.log(
    "CURRENT DASHBOARD STATE:",
    dashboard
  );

  console.log(
    "CURRENT LOADING STATE:",
    loading
  );

  console.log(
    "CURRENT ERROR STATE:",
    error
  );

  console.log(
    "CURRENT FRESHNESS NOTIFICATION:",
    freshnessNotification
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // NO DATA
  // ==========================================

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          No dashboard data available.
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <DashboardLayout>

      {/* ========================================
          REAL-TIME FRESHNESS NOTIFICATION
      ========================================= */}

      {freshnessNotification && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* ALERT INFORMATION */}

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl">
                🔴
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="font-semibold text-red-800">
                    {freshnessNotification.title ||
                      "Food Expiry Reminder"}
                  </h3>

                </div>

                <p className="mt-1 text-sm text-red-700">
                  {freshnessNotification.message ||
                    "One of your donated foods is approaching its expiry time."}
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {freshnessNotification.foodName ||
                    "Food Donation"}

                  {" • "}

                  {freshnessNotification.quantity ||
                    0}{" "}
                  KG
                </p>

                {freshnessNotification.remainingMinutes !==
                  undefined && (
                  <p className="mt-1 text-xs font-medium text-red-700">
                    {freshnessNotification.remainingMinutes <=
                    0
                      ? "Expired"
                      : `Time remaining: ${Math.floor(
                          freshnessNotification.remainingMinutes /
                            60
                        )}h ${
                          freshnessNotification.remainingMinutes %
                          60
                        }m`}
                  </p>
                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex shrink-0 gap-2">

              <button
                type="button"
                onClick={() => {
                  const donationId =
                    freshnessNotification.donationId;

                  if (!donationId) {
                    return;
                  }

                  window.location.href =
                    `/restaurant/add-donation?redonate=${donationId}`;
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Re-donate Food
              </button>

              <button
                type="button"
                onClick={() => {
                  setFreshnessNotification(null);
                }}
                className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Dismiss
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================
          TOP 4 STAT CARDS
      ========================================= */}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL DONATIONS */}

        <StatCard
          title="Total Donations"
          value={
            dashboard.totalDonations || 0
          }
          color="bg-green-500"
          change={`+${dashboard.todayDonations || 0} Today`}
        />

        {/* MEALS SERVED */}

        <StatCard
          title="Meals Served"
          value={Number(
            dashboard.mealsServed || 0
          ).toLocaleString()}
          color="bg-blue-500"
          change={`+${dashboard.activeDonations || 0} Active`}
        />

        {/* RESTAURANT RATING */}

        <StatCard
          title="Restaurant Rating"
          value="N/A"
          color="bg-yellow-500"
          change="No Reviews Yet"
        />

        {/* FOOD WASTE DIVERTED */}

        <StatCard
          title="Food Waste Diverted"
          value={`${Number(
            dashboard.foodWasteDiverted || 0
          ).toLocaleString()} KG`}
          color="bg-emerald-500"
          change="Total Food Donated"
        />

      </div>

      {/* ========================================
          DONATION TRACKER
      ========================================= */}

      <div className="mt-6">

        <DonationTracker
          donations={
            dashboard?.pickupDonations || []
          }
        />

      </div>

      {/* ========================================
          ENVIRONMENTAL IMPACT
      ========================================= */}

      <div className="mt-8">

        <EnvironmentalImpact
          carbonPrevented={
            dashboard.carbonPrevented ?? 0
          }

          foodWasteDiverted={
            dashboard.foodWasteDiverted ?? 0
          }

          mealsServed={
            dashboard.mealsServed ?? 0
          }

          treesEquivalent={
            dashboard.treesEquivalent ?? 0
          }

          waterSaved={
            dashboard.waterSaved ?? 0
          }

          /*
           * Backend now returns annualGoal
           * as percentage progress (0-100).
           */
          annualGoal={
            dashboard.annualGoal ?? 0
          }
        />

      </div>

      {/* ========================================
          NGO PERFORMANCE
      ========================================= */}

      <div className="mt-8">

        <NGOPerformance
          ngoPartners={
            dashboard.ngoPartners || []
          }
        />

      </div>

      {/* ========================================
          TOP DONATED CATEGORIES
      ========================================= */}

      <div className="mt-8">

        <TopDonatedCategories
          categories={
            dashboard.categories || []
          }
        />

      </div>

    </DashboardLayout>
  );
};

export default Dashboard;