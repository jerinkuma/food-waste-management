import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import StatCard from "../../components/DonorDashboard/StatCard";
import AlertCard from "../../components/DonorDashboard/AlertCard";
import DonationTracker from "../../components/DonorDashboard/DonationTracker";
import EnvironmentalImpact from "../../components/DonorDashboard/EnvironmentalImpact";
import NGOPerformance from "../../components/DonorDashboard/NGOPerformance";
import TopDonatedCategories from "../../components/DonorDashboard/TopDonatedCategories";

const Dashboard = () => {
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================
  // LOAD DASHBOARD
  // =====================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const userData =
        localStorage.getItem("user");

      const user = userData
        ? JSON.parse(userData)
        : null;

      if (!user?.id) {
        setError(
          "User information not found."
        );

        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/donations/dashboard/${user.id}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load dashboard."
        );
      }

      setDashboard(
        data.dashboard
      );

    } catch (error) {
      console.error(
        "Dashboard error:",
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

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================
  // LOADING
  // =====================================

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

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500">
          No dashboard data available.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {/* ========================= */}
      {/* OVERVIEW CARDS */}
      {/* ========================= */}

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Donations"
          value={dashboard.totalDonations}
          color="bg-green-500"
          change={`+${dashboard.todayDonations} Today`}
        />

        <StatCard
          title="Meals Served"
          value={dashboard.mealsServed.toLocaleString()}
          color="bg-blue-500"
          change={`+${dashboard.activeDonations} Active`}
        />

        <StatCard
          title="Restaurant Rating"
          value="N/A"
          color="bg-yellow-500"
          change="No Reviews Yet"
        />

        <StatCard
          title="Food Waste Diverted"
          value={`${dashboard.foodWasteDiverted.toLocaleString()} KG`}
          color="bg-emerald-500"
          change="Total Food Donated"
        />

      </div>

      {/* ========================= */}
      {/* ALERT + TRACKER */}
      {/* ========================= */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

        <AlertCard
          donation={
            dashboard.freshnessAlert
          }
        />

        <DonationTracker
          donation={
            dashboard.recentDonations?.[0]
          }
        />

      </div>

      {/* ========================= */}
      {/* ENVIRONMENTAL IMPACT */}
      {/* ========================= */}

      <div className="mt-8">

        <EnvironmentalImpact
          carbonPrevented={
            dashboard.carbonPrevented
          }
          foodWasteDiverted={
            dashboard.foodWasteDiverted
          }
          mealsServed={
            dashboard.mealsServed
          }
          treesEquivalent={
            dashboard.treesEquivalent
          }
          waterSaved={
            dashboard.waterSaved
          }
          annualGoal={
            dashboard.annualGoal
          }
        />

      </div>

      {/* ========================= */}
      {/* NGO PERFORMANCE */}
      {/* ========================= */}

      <div className="mt-8">
        <NGOPerformance />
      </div>

      {/* ========================= */}
      {/* CATEGORIES */}
      {/* ========================= */}

      <div className="mt-8">

        <TopDonatedCategories
          categories={
            dashboard.categories
          }
        />

      </div>

    </DashboardLayout>
  );
};

export default Dashboard;