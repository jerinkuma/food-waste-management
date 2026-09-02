import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import AnalyticsCards from "../../components/DonorDashboard/Analytics/AnalyticsCards";
import MonthlyChart from "../../components/DonorDashboard/Analytics/MonthlyChart";
import StatusChart from "../../components/DonorDashboard/Analytics/StatusChart";
import FoodTypeChart from "../../components/DonorDashboard/Analytics/FoodTypeChart";

const Analytics = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDonations = async () => {
      try {
        const user = JSON.parse(
          localStorage.getItem("user")
        );

        if (!user?.id) {
          console.error("User not found.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/donations/donor/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load donations."
          );
        }

        setDonations(data.donations || []);
      } catch (error) {
        console.error(
          "Analytics error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* Analytics Cards */}
        <AnalyticsCards
          donations={donations}
          loading={loading}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <MonthlyChart
            donations={donations}
            loading={loading}
          />

          <StatusChart
            donations={donations}
            loading={loading}
          />

        </div>

        {/* Food Type Chart */}
        <FoodTypeChart
          donations={donations}
          loading={loading}
        />

      </div>
    </DashboardLayout>
  );
};

export default Analytics;