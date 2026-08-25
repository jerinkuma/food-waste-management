import Sidebar from "../../components/DonorDashboard/Sidebar";
import Topbar from "../../components/DonorDashboard/Topbar";
import StatCard from "../../components/DonorDashboard/StatCard";
import AlertCard from "../../components/DonorDashboard/AlertCard";
import DonationTracker from "../../components/DonorDashboard/DonationTracker";
import EnvironmentalImpact from "../../components/DonorDashboard/EnvironmentalImpact";
import NGOPerformance from "../../components/DonorDashboard/NGOPerformance";
import TopDonatedCategories from "../../components/DonorDashboard/TopDonatedCategories";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <div className="flex-1 ml-72">

        <Topbar />

        <div className="p-8">

          {/* Overview Cards */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Total Donations"
              value="156"
              color="bg-green-500"
              change="+8 Today"
            />

            <StatCard
              title="Meals Served"
              value="3,240"
              color="bg-blue-500"
              change="+125 Meals"
            />

            <StatCard
              title="Restaurant Rating"
              value="4.9 ★"
              color="bg-yellow-500"
              change="186 NGO Reviews"
            />

            <StatCard
              title="Carbon Prevented"
              value="2.3 Tons"
              color="bg-emerald-500"
              change="+18% This Month"
            />

          </div>

          {/* Alert + Tracker */}

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

            <AlertCard />

            <DonationTracker />

          </div>

          {/* Environmental */}

          <div className="mt-8">

            <EnvironmentalImpact />

          </div>

          {/* NGO Performance */}

          <div className="mt-8">

            <NGOPerformance />

          </div>

          {/* Food Categories */}

          <div className="mt-8">

            <TopDonatedCategories />

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;