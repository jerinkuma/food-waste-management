import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import AnalyticsCards from "../../components/DonorDashboard/Analytics/AnalyticsCards";
import MonthlyChart from "../../components/DonorDashboard/Analytics/MonthlyChart";
import StatusChart from "../../components/DonorDashboard/Analytics/StatusChart";
import FoodTypeChart from "../../components/DonorDashboard/Analytics/FoodTypeChart";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* Analytics Cards */}
        <AnalyticsCards />

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <MonthlyChart />
          <StatusChart />
        </div>

        {/* Food Type Chart */}
        <FoodTypeChart />

      </div>
    </DashboardLayout>
  );
};

export default Analytics;