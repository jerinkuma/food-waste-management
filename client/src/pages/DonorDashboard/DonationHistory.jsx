
import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import HistoryStats from "../../components/DonorDashboard/DonationHistory/HistoryStats";
import SearchFilter from "../../components/DonorDashboard/DonationHistory/SearchFilter";
import DonationTable from "../../components/DonorDashboard/DonationHistory/DonationTable";


const DonationHistory = () => {

  const [donations, setDonations] = useState([]);

  const [filteredDonations, setFilteredDonations] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  // Load donor donations
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


        setDonations(data.donations);

      } catch (error) {

        console.error(
          "Donation history error:",
          error
        );

      } finally {

        setLoading(false);

      }
    };


    loadDonations();

  }, []);


  // Search + Status Filter
  useEffect(() => {

    let result = [...donations];


    // Search by food name
    if (search.trim()) {

      result = result.filter((donation) =>
        donation.foodName
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );

    }


    // Status filter
    if (statusFilter !== "All") {

      result = result.filter((donation) => {

        if (
          statusFilter === "Pending"
        ) {
          return (
            donation.status ===
            "Waiting for NGO Acceptance"
          );
        }


        if (
          statusFilter === "Accepted"
        ) {
          return (
            donation.status ===
            "NGO Accepted"
          );
        }


        if (
          statusFilter === "Picked Up"
        ) {
          return (
            donation.status ===
            "Food Picked Up"
          );
        }


        return (
          donation.status ===
          statusFilter
        );

      });

    }


    setFilteredDonations(result);

  }, [
    donations,
    search,
    statusFilter,
  ]);


  return (
    <DashboardLayout>

      {/* Statistics */}
      <HistoryStats
        donations={donations}
      />


      {/* Search + Filter */}
      <div className="mt-8">

        <SearchFilter
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

      </div>


      {/* Donation Table */}
      <div className="mt-8">

        <DonationTable
          donations={filteredDonations}
          loading={loading}
        />

      </div>

    </DashboardLayout>
  );
};


export default DonationHistory;

