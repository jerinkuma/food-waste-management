import Sidebar from "../../components/DonorDashboard/Sidebar";
import Topbar from "../../components/DonorDashboard/Topbar";

import HistoryStats from "../../components/DonorDashboard/DonationHistory/HistoryStats";
import SearchFilter from "../../components/DonorDashboard/DonationHistory/SearchFilter";
import DonationTable from "../../components/DonorDashboard/DonationHistory/DonationTable";

const DonationHistory = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-72 flex-1">

        {/* Topbar */}
        <Topbar />

        <main className="p-8">

          {/* Page Heading */}
          <div className="mb-8">

          </div>

          {/* Statistics */}
          <HistoryStats />

          {/* Search + Filter */}
          <div className="mt-8">
            <SearchFilter />
          </div>

          {/* Donation Table */}
          <div className="mt-8">
            <DonationTable />
          </div>

        </main>

      </div>

    </div>
  );
};

export default DonationHistory;