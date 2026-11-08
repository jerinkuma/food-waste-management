
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Utensils,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  X,
  CalendarDays,
  UserRound,
  MapPin,
  Package,
  ClipboardList,
  History,
  Building2,
} from "lucide-react";

import { fetchDonations } from "../../services/api";
import "./Donations.css";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDonation, setSelectedDonation] = useState(null);

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

        if (isMounted) setDonations(list);
      } catch (err) {
        console.error("Failed to load donations:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Donation information load করা যায়নি।"
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

  // Close modal with Escape key
  useEffect(() => {
    if (!selectedDonation) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedDonation(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedDonation]);

  // Food name
  const getFoodName = (donation) =>
    donation?.foodName || donation?.food || "N/A";

  // Quantity
  const getQuantity = (donation) => {
    const quantity = donation?.quantity ?? donation?.qty;

    return quantity !== undefined && quantity !== null
      ? `${quantity} kg`
      : "N/A";
  };

  // Donor name
  const getDonorName = (donation) => {
    const donor = donation?.donor;

    if (donor && typeof donor === "object") {
      return donor.name || donor.email || "N/A";
    }

    return donation?.donorName || "N/A";
  };

  // Donation status
  const getStatus = (donation) =>
    donation?.pipelineStatus || donation?.status || "Pending";

  // NGO name - handles populated object and ID/string
  // =====================================
  // NGO INFORMATION HELPERS
  // =====================================

  const getNgoDetails = (ngo) => {
    if (!ngo || typeof ngo !== "object") return "";

    return (
      ngo.user?.name ||
      ngo.user?.email ||
      ""
    );
  };

  const getSelectedNgo = (donation) => {
    const selected = donation?.selectedNgo;

    if (selected && typeof selected === "object") {
      return selected;
    }

    const legacy = donation?.ngoRequest?.requestedBy;

    if (legacy && typeof legacy === "object") {
      return legacy;
    }

    const requests = Array.isArray(donation?.ngoRequests)
      ? donation.ngoRequests
      : [];

    const acceptedRequest = requests.find(
      (request) => request.status === "Accepted"
    );

    const populatedRequest =
      acceptedRequest?.requestedBy &&
        typeof acceptedRequest.requestedBy === "object"
        ? acceptedRequest.requestedBy
        : requests.find(
          (request) =>
            request.requestedBy &&
            typeof request.requestedBy === "object"
        )?.requestedBy;

    return populatedRequest || selected || legacy || null;
  };

  const getSelectedNgoRequest = (donation) => {
    const requests = Array.isArray(donation?.ngoRequests)
      ? donation.ngoRequests
      : [];

    const selectedNgo = getSelectedNgo(donation);

    if (!selectedNgo) {
      return (
        requests.find(
          (request) => request.status === "Accepted"
        ) ||
        requests[0] ||
        null
      );
    }

    const selectedNgoId =
      typeof selectedNgo === "object"
        ? selectedNgo._id
        : selectedNgo;

    return (
      requests.find((request) => {
        const requestedNgo = request.requestedBy;

        const requestedNgoId =
          typeof requestedNgo === "object"
            ? requestedNgo?._id
            : requestedNgo;

        return (
          String(requestedNgoId) === String(selectedNgoId)
        );
      }) || null
    );
  };

  const getNgoName = (donation) => {
    return getNgoDetails(getSelectedNgo(donation));
  };

  // Badge style
  const getBadgeStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value.includes("completed") ||
      value.includes("delivered")
    ) {
      return "completed";
    }

    if (value.includes("pending")) return "pending";

    if (
      value.includes("accepted") ||
      value.includes("assigned") ||
      value.includes("requested")
    ) {
      return "accepted";
    }

    if (value.includes("rejected")) return "rejected";

    return "default";
  };

  // Date formatting
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

  // Date and time formatting
  const formatDateTime = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status changed by
  const getChangedBy = (person) => {
    if (!person) return "";

    if (typeof person === "object") {
      return person.name || person.email || "";
    }

    return "";
  };

  // Summary counts
  const completedCount = donations.filter((donation) => {
    const status = getStatus(donation).toLowerCase();

    return (
      status === "completed" ||
      status === "delivered"
    );
  }).length;

  const pendingCount = donations.filter((donation) => {
    const status = getStatus(donation).toLowerCase();

    return (
      status === "pending" ||
      status === "accepted" ||
      status === "waiting for ngo acceptance" ||
      status === "ngo requested"
    );
  }).length;

  const rejectedCount = donations.filter(
    (donation) =>
      getStatus(donation).toLowerCase() === "rejected"
  ).length;

  // =====================================
  // SEARCH FILTER
  // =====================================

  const filteredDonations = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return donations;

    return donations.filter((donation) => {
      const ngoName = getNgoName(donation);
      const donorName = getDonorName(donation);

      const searchFields = [
        getFoodName(donation),
        donorName,
        donation?.donor?.email,
        ngoName,
        getStatus(donation),
        donation?.donationId,
        donation?.requestId,
        donation?.quantity,
        donation?.foodCategory,
        donation?.condition,
        donation?.pickupAddress,
        donation?.contactNumber,
        donation?.pickupTime,
        donation?.status,
        donation?.pipelineStatus,
        donation?.createdAt
          ? formatDate(donation.createdAt)
          : "",
        donation?.pickupDate
          ? formatDate(donation.pickupDate)
          : "",
      ];

      return searchFields.some((field) =>
        String(field ?? "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [donations, search]);

  // Reusable detail item
  const renderDetail = (label, value) => (
    <div className="detail-info-item">
      <span>{label}</span>
      <strong>{value || "N/A"}</strong>
    </div>
  );

  // Donation details modal
  const renderDonationModal = () => {
    if (!selectedDonation) return null;

    const donation = selectedDonation;
    const status = getStatus(donation);

    const selectedNgo = getSelectedNgo(donation);
    const ngoName = getNgoDetails(selectedNgo);
    const ngoRequest = getSelectedNgoRequest(donation);

    const statusHistory = Array.isArray(donation.statusHistory)
      ? [...donation.statusHistory].sort(
        (a, b) =>
          new Date(a.changedAt || 0) -
          new Date(b.changedAt || 0)
      )
      : [];

    return (
      <div
        className="donation-modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setSelectedDonation(null);
          }
        }}
      >
        <div
          className="donation-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-modal-title"
        >
          {/* Modal Header */}
          <div className="donation-modal-header">
            <div className="modal-heading-content">
              <div className="modal-heading-icon">
                <ClipboardList size={23} />
              </div>

              <div>
                <span className="modal-eyebrow">
                  DONATION RECORD
                </span>

                <h2 id="donation-modal-title">
                  Donation Details
                </h2>

                <p>
                  {donation.donationId || donation._id}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedDonation(null)}
              aria-label="Close details"
            >
              <X size={21} />
            </button>
          </div>

          <div className="donation-modal-body">
            {/* 1. Donation Information */}
            <section className="modal-section">
              <div className="modal-section-title">
                <Package size={19} />
                <h3>Donation Information</h3>
              </div>

              <div className="modal-status-banner">
                <div>
                  <span>Current Status</span>
                  <strong>{status}</strong>
                </div>

                <span
                  className={`donation-badge ${getBadgeStyle(status)}`}
                >
                  {status}
                </span>
              </div>

              <div className="modal-detail-grid">
                {renderDetail(
                  "Food Name",
                  getFoodName(donation)
                )}

                {renderDetail(
                  "Quantity",
                  getQuantity(donation)
                )}

                {renderDetail(
                  "Food Category",
                  donation.foodCategory
                )}

                {renderDetail(
                  "Food Condition",
                  donation.condition
                )}

                {renderDetail(
                  "Cooking Time",
                  donation.cookingTime
                )}

                {renderDetail(
                  "Best Before",
                  formatDateTime(donation.bestBefore)
                )}

                {renderDetail(
                  "Donation Date",
                  formatDateTime(donation.createdAt)
                )}
              </div>
            </section>

            {/* 2. Donor Information */}
            <section className="modal-section">
              <div className="modal-section-title">
                <UserRound size={19} />
                <h3>Donor Information</h3>
              </div>

              <div className="modal-detail-grid">
                {renderDetail(
                  "Donor Name",
                  getDonorName(donation)
                )}

                {renderDetail(
                  "Donor Email",
                  donation.donor?.email
                )}
              </div>
            </section>

            {/* 3. NGO Information */}
            <section className="modal-section">
              <div className="modal-section-title">
                <Building2 size={19} />
                <h3>NGO Information</h3>
              </div>

              <div className="modal-detail-grid">
                {renderDetail("NGO Name", ngoName || "Not Assigned")}

                {renderDetail("Request Status", ngoRequest?.status)}

                {renderDetail(
                  "Request Date",
                  formatDate(ngoRequest?.requestedAt)
                )}

                {renderDetail(
                  "Response Date",
                  formatDate(ngoRequest?.respondedAt)
                )}
              </div>
            </section>

            {/* 4. Pickup Information */}
            <section className="modal-section">
              <div className="modal-section-title">
                <MapPin size={19} />
                <h3>Pickup Information</h3>
              </div>

              <div className="modal-detail-grid">
                {renderDetail(
                  "Pickup Address",
                  donation.pickupAddress
                )}

                {renderDetail(
                  "Pickup Date",
                  formatDate(donation.pickupDate)
                )}

                {renderDetail(
                  "Pickup Time",
                  donation.pickupTime
                )}

                {renderDetail(
                  "Contact Number",
                  donation.contactNumber
                )}
              </div>
            </section>

            {/* 5. Donation Timeline */}
            <section className="modal-section">
              <div className="modal-section-title">
                <History size={19} />
                <h3>Donation Timeline</h3>

                <span className="history-count">
                  {statusHistory.length}
                </span>
              </div>

              {statusHistory.length > 0 ? (
                <div className="status-timeline">
                  {statusHistory.map((history, index) => (
                    <div
                      className="timeline-item"
                      key={history._id || index}
                    >
                      <div className="timeline-marker">
                        <span />
                      </div>

                      <div className="timeline-content">
                        <div className="timeline-top">
                          <strong>
                            {history.status || "Status Updated"}
                          </strong>

                          <span>
                            {formatDateTime(history.changedAt)}
                          </span>
                        </div>

                        {history.note && (
                          <p>{history.note}</p>
                        )}

                        {getChangedBy(history.changedBy) && (
                          <small>
                            Changed by:{" "}
                            {getChangedBy(history.changedBy)}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="history-empty">
                  No donation timeline available.
                </div>
              )}
            </section>
          </div>

          {/* Modal Footer */}
          <div className="donation-modal-footer">
            <span>
              <CalendarDays size={15} />
              Created: {formatDateTime(donation.createdAt)}
            </span>

            <button
              type="button"
              onClick={() => setSelectedDonation(null)}
              className="modal-done-btn"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="donations-page">
      {/* Header + Search */}
      <div className="donations-header">
        <div className="donations-heading">
          <div className="donations-heading-icon">
            <Utensils size={25} />
          </div>

          <div>
            <span className="donations-eyebrow">
              ADMINISTRATION / RECORDS
            </span>

            <h1>Donation Management</h1>

            <p>
              Monitor and manage all food donation activities.
            </p>
          </div>
        </div>
        <div className="donations-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by food, donor, NGO, status, ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="donation-summary">
        <div className="summary-card summary-total">
          <div className="summary-card-top">
            <div className="summary-icon">
              <Utensils size={22} />
            </div>
            <span className="summary-mini-label">
              ALL RECORDS
            </span>
          </div>

          <div className="summary-card-bottom">
            <div>
              <span className="summary-label">
                Total Donations
              </span>
              <strong>
                {loading ? "..." : donations.length}
              </strong>
              <small>All donation records</small>
            </div>
            <div className="summary-decoration">01</div>
          </div>
        </div>

        <div className="summary-card summary-completed">
          <div className="summary-card-top">
            <div className="summary-icon">
              <CheckCircle2 size={22} />
            </div>
            <span className="summary-mini-label">
              SUCCESSFUL
            </span>
          </div>

          <div className="summary-card-bottom">
            <div>
              <span className="summary-label">Completed</span>
              <strong>
                {loading ? "..." : completedCount}
              </strong>
              <small>Successfully completed</small>
            </div>
            <div className="summary-decoration">02</div>
          </div>
        </div>

        <div className="summary-card summary-pending">
          <div className="summary-card-top">
            <div className="summary-icon">
              <Clock3 size={22} />
            </div>
            <span className="summary-mini-label">
              IN PROGRESS
            </span>
          </div>

          <div className="summary-card-bottom">
            <div>
              <span className="summary-label">Pending</span>
              <strong>
                {loading ? "..." : pendingCount}
              </strong>
              <small>Pending and accepted</small>
            </div>
            <div className="summary-decoration">03</div>
          </div>
        </div>

        <div className="summary-card summary-rejected">
          <div className="summary-card-top">
            <div className="summary-icon">
              <XCircle size={22} />
            </div>
            <span className="summary-mini-label">
              DECLINED
            </span>
          </div>

          <div className="summary-card-bottom">
            <div>
              <span className="summary-label">Rejected</span>
              <strong>
                {loading ? "..." : rejectedCount}
              </strong>
              <small>Rejected donations</small>
            </div>
            <div className="summary-decoration">04</div>
          </div>
        </div>
      </div>

      {/* Donation Content */}
      <div className="donations-content-header">
        <div>
          <h2>All Donations</h2>
          <p>
            Explore donation records and their current status.
          </p>
        </div>

        {!loading && !error && (
          <div className="donations-total-pill">
            <span />
            {filteredDonations.length} Records
          </div>
        )}
      </div>

      {loading ? (
        <div className="donation-message donation-loading">
          <div className="donation-loader" />
          <strong>Loading donations...</strong>
          <span>Fetching records from database</span>
        </div>
      ) : error ? (
        <div className="donation-error">
          <XCircle size={34} />
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

          <div className="donation-grid">
            {filteredDonations.length > 0 ? (
              filteredDonations.map((donation, index) => {
                const status = getStatus(donation);
                const ngoName = getNgoName(donation);

                return (
                  <div
                    className="donation-card"
                    key={donation._id || donation.id || index}
                  >
                    <div>
                      <div className="donation-card-header">
                        <div>
                          <span className="donation-item-number">
                            ITEM #{index + 1}
                          </span>

                          <h3>{getFoodName(donation)}</h3>
                        </div>

                        <span
                          className={`donation-badge ${getBadgeStyle(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="donation-card-details">
                        <div>
                          <span>Quantity:</span>
                          <strong>{getQuantity(donation)}</strong>
                        </div>

                        <div>
                          <span>Donor / Restaurant:</span>
                          <strong>{getDonorName(donation)}</strong>
                        </div>

                        <div>
                          <span>Date:</span>
                          <strong>
                            {formatDate(
                              donation.createdAt || donation.date
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="donation-card-footer">
                      <span>Assigned NGO:</span>

                      <strong
                        className={
                          ngoName
                            ? "ngo-assigned"
                            : "ngo-not-assigned"
                        }
                      >
                        {ngoName || "Not Assigned"}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="view-details-btn"
                      onClick={() => setSelectedDonation(donation)}
                    >
                      <Eye size={17} />
                      View Details
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="donation-empty">
                <div className="empty-icon">
                  <Package size={30} />
                </div>

                <h3>
                  {search.trim()
                    ? "No matching donations"
                    : "No donations found"}
                </h3>

                <p>
                  {search.trim()
                    ? "Try searching with another keyword."
                    : "Donation records will appear here when available."}
                </p>

                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {renderDonationModal()}
    </div>
  );
};

export default Donations;
