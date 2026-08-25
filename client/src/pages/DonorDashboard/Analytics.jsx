import Sidebar from "../../components/DonorDashboard/Sidebar";
import Topbar from "../../components/DonorDashboard/Topbar";

import AnalyticsCards from "../../components/DonorDashboard/Analytics/AnalyticsCards";
import MonthlyChart from "../../components/DonorDashboard/Analytics/MonthlyChart";
import StatusChart from "../../components/DonorDashboard/Analytics/StatusChart";
import FoodTypeChart from "../../components/DonorDashboard/Analytics/FoodTypeChart";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      <div className="ml-72">

        <Topbar />

        <main className="space-y-8 p-8">

          <AnalyticsCards />

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">

            <MonthlyChart />

            <StatusChart />

          </div>

          <FoodTypeChart />

        </main>

      </div>

    </div>
  );
};

export default Analytics;