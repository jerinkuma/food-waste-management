
import React, { useEffect, useMemo, useState } from "react";
import { fetchDonations } from "../../services/api";
import "./Donations.css";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDonations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchDonations();
        const list = Array.isArray(response)
          ? response
          : response?.donations || [];

        if (isMounted) {
          setDonations(list);
        }
      } catch (err) {
        console.error("Failed to load donations:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Donation information load করা যায়নি।"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDonations();

    return () => {
      isMounted = false;
    };
  }, []);

  const getFoodName = (donation) =>
    donation.foodName || donation.food || "N/A";

  const getQuantity = (donation) => {
    const quantity = donation.quantity ?? donation.qty;
    return quantity !== undefined && quantity !== null
      ? `${quantity} kg`
      : "N/A";
  };

  const getDonorName = (donation) => {
    if (typeof donation.donor === "object" && donation.donor !== null) {
      return donation.donor.name || donation.donor.email || "N/A";
    }

    return donation.donorName || donation.donor || "N/A";
  };

  const getStatus = (donation) =>
    donation.pipelineStatus || donation.status || "Pending";

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredDonations = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return donations;

    return donations.filter((donation) => {
      const fields = [
        getFoodName(donation),
        getDonorName(donation),
        getStatus(donation),
        donation.quantity,
        donation.createdAt,
        donation._id,
      ];

      return fields.some((field) =>
        String(field ?? "").toLowerCase().includes(searchText)
      );
    });
  }, [donations, search]);

  const pendingCount = donations.filter(
    (donation) => getStatus(donation).toLowerCase() === "pending"
  ).length;

  return (
    <div className="page">
      <h1>
        <span className="page-icon">🍱</span> Donation Management
      </h1>

      <div className="donation-summary">
        <div className="donation-summary-card">
          <span className="donation-summary-label">Total Donations</span>
          <strong>{loading ? "..." : donations.length}</strong>
          <span className="donation-summary-note">
            All donations in database
          </span>
        </div>

        <div className="donation-summary-card">
          <span className="donation-summary-label">Pending Donations</span>
          <strong>{loading ? "..." : pendingCount}</strong>
          <span className="donation-summary-note">
            Waiting for processing
          </span>
        </div>
      </div>

      <div className="donation-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search food, donor, status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-wrap">
        {loading ? (
          <p className="donation-message">
            Loading donations from database...
          </p>
        ) : error ? (
          <div className="donation-error">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <p className="donation-results">
              Showing <strong>{filteredDonations.length}</strong> of{" "}
              <strong>{donations.length}</strong> donations
            </p>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Food</th>
                  <th>Quantity</th>
                  <th>Donor</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation, index) => {
                    const status = getStatus(donation);

                    return (
                      <tr key={donation._id || donation.id || index}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{getFoodName(donation)}</strong>
                        </td>
                        <td>{getQuantity(donation)}</td>
                        <td>{getDonorName(donation)}</td>
                        <td>{formatDate(donation.createdAt || donation.date)}</td>
                        <td>
                          <span
                            className={`badge ${String(status)
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="donation-empty">
                      {search.trim()
                        ? "No donations match your search."
                        : "No donations found in the database."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Donations;
