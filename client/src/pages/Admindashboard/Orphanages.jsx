import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  ShieldBan,
  RefreshCw,
  Search,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Hash,
  AlertCircle,
} from "lucide-react";

import { fetchOrphanages, updateUserStatus } from "../../services/api";
import "./Orphanages.css";

const Orphanages = () => {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Load NGO list
  const loadNgos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchOrphanages();

      const list = Array.isArray(response)
        ? response
        : response?.ngos || [];

      const initializedNgos = list.map((ngo) => ({
        ...ngo,
        status: ngo.isBlocked
          ? "Blocked"
          : ngo.status || "Active",
      }));

      setNgos(initializedNgos);
    } catch (err) {
      console.error("Failed to load NGOs:", err);
      setError(
        err.response?.data?.message ||
          "NGO information load করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNgos();
  }, []);

  // NGO status update
  const handleNgoStatusChange = async (ngoUserId, newStatus) => {
    if (!ngoUserId || updatingId) return;

    try {
      setUpdatingId(ngoUserId);

      await updateUserStatus(ngoUserId, newStatus);

      setNgos((prevNgos) =>
        prevNgos.map((ngo) => {
          const id = ngo.userId || ngo.id || ngo._id;

          if (String(id) === String(ngoUserId)) {
            return {
              ...ngo,
              status: newStatus,
              isBlocked: newStatus === "Blocked",
            };
          }

          return ngo;
        })
      );

      alert(`NGO status successfully changed to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update NGO status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update NGO status on server."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Search filtering
  const filteredNgos = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ngos;

    return ngos.filter((ngo) =>
      [
        ngo.name,
        ngo.email,
        ngo.phone,
        ngo.address,
        ngo.location,
        ngo.organizationId,
        ngo.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [ngos, search]);

  // Summary counts
  const totalNgos = ngos.length;

  const activeNgos = ngos.filter(
    (ngo) => (ngo.status || "Active").toLowerCase() === "active"
  ).length;

  const blockedNgos = ngos.filter(
    (ngo) => (ngo.status || "").toLowerCase() === "blocked"
  ).length;

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="orphanages-page">
      {/* Page Header */}
      <div className="orphanages-header">
        <div className="orphanages-heading">
          <div className="orphanages-heading-icon">
            <Building2 size={25} />
          </div>

          <div>
            <p className="orphanages-eyebrow">
              ADMINISTRATION / ORGANIZATIONS
            </p>

            <h1>NGO Management</h1>

            <p className="orphanages-subtitle">
              Manage registered NGOs and control their account status.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="orphanages-refresh-btn"
          onClick={loadNgos}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "orphanages-spinning" : ""}
          />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="orphanages-stats">
        <div className="orphanages-stat-card">
          <div className="orphanages-stat-top">
            <div className="orphanages-stat-icon total">
              <Building2 size={21} />
            </div>
            <span className="orphanages-stat-label">Total NGOs</span>
          </div>

          <strong>
            {loading ? "..." : totalNgos}
          </strong>

          <small>NGOs registered in the database</small>
        </div>

        <div className="orphanages-stat-card">
          <div className="orphanages-stat-top">
            <div className="orphanages-stat-icon active">
              <ShieldCheck size={21} />
            </div>
            <span className="orphanages-stat-label">Active NGOs</span>
          </div>

          <strong>
            {loading ? "..." : activeNgos}
          </strong>

          <small>Currently active organizations</small>
        </div>

        <div className="orphanages-stat-card">
          <div className="orphanages-stat-top">
            <div className="orphanages-stat-icon blocked">
              <ShieldBan size={21} />
            </div>
            <span className="orphanages-stat-label">Blocked NGOs</span>
          </div>

          <strong>
            {loading ? "..." : blockedNgos}
          </strong>

          <small>Organizations with blocked accounts</small>
        </div>
      </div>

      {/* NGO Table Section */}
      <div className="orphanages-content">
        <div className="orphanages-toolbar">
          <div>
            <h2>Registered Organizations</h2>
            <p>View and manage all registered NGO accounts.</p>
          </div>

          <div className="orphanages-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search NGO, email, phone..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                className="orphanages-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="orphanages-state">
            <RefreshCw size={27} className="orphanages-spinning" />
            <p>Loading NGOs from database...</p>
          </div>
        ) : error ? (
          <div className="orphanages-state error">
            <AlertCircle size={30} />
            <h3>Unable to load NGOs</h3>
            <p>{error}</p>

            <button
              type="button"
              onClick={loadNgos}
              className="orphanages-retry-btn"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="orphanages-table-info">
              <span>
                Showing <strong>{filteredNgos.length}</strong> of{" "}
                <strong>{totalNgos}</strong> NGOs
              </span>
            </div>

            <div className="orphanages-table-wrap">
              <table className="orphanages-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>NGO INFORMATION</th>
                    <th>CONTACT</th>
                    <th>ADDRESS</th>
                    <th>ORGANIZATION ID</th>
                    <th>STATUS</th>
                    <th>JOINED DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredNgos.length > 0 ? (
                    filteredNgos.map((ngo, index) => {
                      const targetId =
                        ngo.userId || ngo.id || ngo._id;

                      const currentStatus =
                        ngo.status || "Active";

                      const isBlocked =
                        currentStatus.toLowerCase() === "blocked";

                      const isUpdating =
                        String(updatingId) === String(targetId);

                      return (
                        <tr key={targetId || ngo.email || index}>
                          <td className="orphanages-index">
                            {index + 1}
                          </td>

                          <td>
                            <div className="orphanages-ngo-info">
                              <div className="orphanages-avatar">
                                <Building2 size={20} />
                              </div>

                              <div className="orphanages-ngo-details">
                                <strong>{ngo.name || "N/A"}</strong>
                                <span>
                                  <Mail size={13} />
                                  {ngo.email || "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="orphanages-contact">
                              <Phone size={14} />
                              {ngo.phone || "Not provided"}
                            </div>
                          </td>

                          <td>
                            <div className="orphanages-address">
                              <MapPin size={14} />
                              <span>
                                {ngo.address ||
                                  ngo.location ||
                                  "Not provided"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="orphanages-org-id">
                              <Hash size={14} />
                              {ngo.organizationId || "N/A"}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`orphanages-status ${
                                isBlocked ? "blocked" : "active"
                              }`}
                            >
                              <span className="orphanages-status-dot" />
                              {currentStatus}
                            </span>
                          </td>

                          <td>
                            <div className="orphanages-date">
                              <CalendarDays size={14} />
                              {formatDate(ngo.createdAt)}
                            </div>
                          </td>

                          <td>
                            <div className="orphanages-actions">
                              <button
                                type="button"
                                className={`orphanages-action-btn activate ${
                                  !isBlocked ? "selected" : ""
                                }`}
                                onClick={() =>
                                  handleNgoStatusChange(
                                    targetId,
                                    "Active"
                                  )
                                }
                                disabled={
                                  !isBlocked || isUpdating || updatingId !== null
                                }
                              >
                                Active
                              </button>

                              <button
                                type="button"
                                className={`orphanages-action-btn block ${
                                  isBlocked ? "selected" : ""
                                }`}
                                onClick={() =>
                                  handleNgoStatusChange(
                                    targetId,
                                    "Blocked"
                                  )
                                }
                                disabled={
                                  isBlocked || isUpdating || updatingId !== null
                                }
                              >
                                {isUpdating ? "Updating..." : "Block"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="orphanages-empty">
                          <Users size={34} />
                          <h3>No NGOs found</h3>
                          <p>
                            {search.trim()
                              ? "No NGOs match your search. Try another keyword."
                              : "No NGOs found in the database."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orphanages;