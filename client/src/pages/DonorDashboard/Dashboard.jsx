import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";
import StatCard from "../../components/DonorDashboard/StatCard";
import DonationTracker from "../../components/DonorDashboard/DonationTracker";
import EnvironmentalImpact from "../../components/DonorDashboard/EnvironmentalImpact";
import NGOPerformance from "../../components/DonorDashboard/NGOPerformance";
import TopDonatedCategories from "../../components/DonorDashboard/TopDonatedCategories";

import { getCurrentUser } from "../../services/auth";
import { getSocket } from "../../services/socket";
import { fetchDonorDashboard } from "../../services/api";

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

  const loadDashboard = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError("");

      const user = getCurrentUser();
      const donorId = user?.id || user?._id;

      if (!donorId) {
        setError("User information not found. Please log in again.");
        setDashboard(null);
        return;
      }

      const response = await fetchDonorDashboard(donorId);
      const data = response?.dashboard || response;

      if (
        data &&
        (
          Object.prototype.hasOwnProperty.call(data, "totalDonations") ||
          Object.prototype.hasOwnProperty.call(data, "pickupDonations") ||
          Object.prototype.hasOwnProperty.call(data, "foodWasteDiverted")
        )
      ) {
        setDashboard(data);
        return;
      }

      if (data?.stats) {
        const stats = data.stats;
        setDashboard({
          totalDonations: stats.total || 0,
          todayDonations: 0,
          mealsServed: 0,
          foodWasteDiverted: 0,
          activeDonations:
            (stats.pending || 0) +
            (stats.accepted || 0) +
            (stats.outForDelivery || 0),
          pendingDonations: stats.pending || 0,
          acceptedDonations: stats.accepted || 0,
          outForDelivery: stats.outForDelivery || 0,
          completedDonations: stats.completed || 0,
          rejectedDonations: stats.rejected || 0,
          carbonPrevented: 0,
          treesEquivalent: 0,
          waterFootprintLitres: 0,
          waterFootprintCoverageKg: 0,
          waterUnclassifiedKg: 0,
          annualGoal: 0,
          recentDonations: [],
          pickupDonations: [],
          ngoPartners: [],
          categories: [],
          stats,
        });
        return;
      }

      setDashboard(null);
    } catch (err) {
      console.error("Donor dashboard error:", err);
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Failed to load dashboard."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Initial load and shared real-time socket updates.
  useEffect(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id && !user?._id) return;

    const socket = getSocket();
    socketRef.current = socket;

    const refreshDashboard = () => loadDashboard(false);

    const handleFreshnessAlert = (notification) => {
      if (!notification) return;

      const notificationKey = [
        notification.donationId || notification.customDonationId || "",
        notification.urgency || "",
        notification.remainingMinutes || "",
      ].join("-");

      if (lastNotificationRef.current === notificationKey) return;

      lastNotificationRef.current = notificationKey;
      setFreshnessNotification(notification);
    };

    socket.on("donation:new", refreshDashboard);
    socket.on("donation:updated", refreshDashboard);
    socket.on("donation:distribution-proof", refreshDashboard);
    socket.on("donation:freshness-alert", handleFreshnessAlert);

    return () => {
      socket.off("donation:new", refreshDashboard);
      socket.off("donation:updated", refreshDashboard);
      socket.off("donation:distribution-proof", refreshDashboard);
      socket.off("donation:freshness-alert", handleFreshnessAlert);
      socketRef.current = null;
      // Do not disconnect here: the socket is shared by the whole app.
    };
  }, [loadDashboard]);

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
                        )}h ${freshnessNotification.remainingMinutes %
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

        {/* ACTIVE DONATIONS */}

        <StatCard
          title="Active Donations"
          value={Number(
            dashboard.activeDonations || 0
          ).toLocaleString()}
          color="bg-blue-500"
          change="Currently Active"
        />
        {/* RESTAURANT RATING */}

        <StatCard
          title="Restaurant Rating"
          value={`${Number(dashboard.ratingAverage || 0).toFixed(1)} / 5`}
          color="bg-yellow-500"
          change={
            dashboard.ratingCount > 0
              ? `${dashboard.ratingCount} NGO Rating${dashboard.ratingCount === 1 ? "" : "s"}`
              : "No Ratings Yet"
          }
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
          donations={dashboard?.pickupDonations || []}
          onRefresh={loadDashboard}
        />

      </div>

      {/* ========================================
          ENVIRONMENTAL IMPACT
      ========================================= */}

      <div className="mt-8">

        <EnvironmentalImpact
          carbonPrevented={dashboard.carbonPrevented ?? 0}
          foodWasteDiverted={dashboard.foodWasteDiverted ?? 0}
          treesEquivalent={dashboard.treesEquivalent ?? 0}
          waterFootprintLitres={dashboard.waterFootprintLitres ?? 0}
          waterFootprintCoverageKg={
            dashboard.waterFootprintCoverageKg ?? 0
          }
          waterUnclassifiedKg={
            dashboard.waterUnclassifiedKg ?? 0
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
          categories={dashboard.categories || []}
        />

      </div>

    </DashboardLayout>
  );
};

export default Dashboard;