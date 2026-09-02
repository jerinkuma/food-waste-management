import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import HistoryStats from "../../components/DonorDashboard/DonationHistory/HistoryStats";
import SearchFilter from "../../components/DonorDashboard/DonationHistory/SearchFilter";
import DonationTable from "../../components/DonorDashboard/DonationHistory/DonationTable";

const DonationHistory = () => {
  return (
    <DashboardLayout>
      
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

    </DashboardLayout>
  );
};

export default DonationHistory;