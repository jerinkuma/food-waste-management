
import React, { useEffect, useState, useMemo } from "react";
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  ShieldCheck,
  ShieldBan,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  UserRound,
} from "lucide-react";

import { fetchUsers, updateUserStatus } from "../../services/api";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchUsers();

      const list = Array.isArray(response)
        ? response
        : response?.users || [];

      setUsers(list);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.message ||
        "Users information could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Update donor status
  const handleStatusChange = async (userId, newStatus) => {
    if (!userId || updatingId) return;

    try {
      setUpdatingId(userId);

      await updateUserStatus(userId, newStatus);

      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          const id = user.id || user._id;

          if (id === userId) {
            return {
              ...user,
              status: newStatus,
              isBlocked: newStatus === "Blocked",
            };
          }

          return user;
        })
      );

      alert(`User status successfully changed to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);

      alert(
        err.response?.data?.message ||
        "Failed to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Search filtering
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.phone,
        user.role,
        user.status,
        user.location,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [users, search]);

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

  const blockedUsers = users.filter(
    (user) =>
      (user.status || (user.isBlocked ? "Blocked" : "Active"))
        .toLowerCase() === "blocked"
  ).length;

  const activeUsers = users.length - blockedUsers;

  return (
    <div className="users-page">

      {/* Page Header */}
      <div className="users-page-header">
        <div className="users-heading">
          <div className="users-heading-icon">
            <UsersIcon size={25} />
          </div>

          <div>
            <span className="users-eyebrow">
              ADMINISTRATION / USERS
            </span>

            <h1>User Management</h1>

            <p>
              Manage registered donors and monitor their account status.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="users-refresh-btn"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "refresh-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="users-stats-grid">

        <div className="users-stat-card total-users-card">
          <div className="users-stat-top">
            <div className="users-stat-icon">
              <UsersIcon size={23} />
            </div>
            <span className="users-stat-label">TOTAL DONORS</span>
          </div>

          <strong>
            {loading ? "..." : users.length}
          </strong>

          <p>Donors registered on FeedLink</p>
        </div>

        <div className="users-stat-card active-users-card">
          <div className="users-stat-top">
            <div className="users-stat-icon">
              <ShieldCheck size={23} />
            </div>
            <span className="users-stat-label">ACTIVE ACCOUNTS</span>
          </div>

          <strong>
            {loading ? "..." : activeUsers}
          </strong>

          <p>Currently active donor accounts</p>
        </div>

        <div className="users-stat-card blocked-users-card">
          <div className="users-stat-top">
            <div className="users-stat-icon">
              <ShieldBan size={23} />
            </div>
            <span className="users-stat-label">BLOCKED ACCOUNTS</span>
          </div>

          <strong>
            {loading ? "..." : blockedUsers}
          </strong>

          <p>Donor accounts currently blocked</p>
        </div>

      </div>

      {/* Users Table Section */}
      <div className="users-content-card">

        <div className="users-content-header">
          <div>
            <h2>Registered Donors</h2>
            <p>
              View, search and manage donor information.
            </p>
          </div>

          <span className="users-total-label">
            {loading ? "Loading..." : `${filteredUsers.length} Records`}
          </span>
        </div>

        {/* Search */}
        <div className="users-toolbar">
          <div className="users-search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search by name, email, phone, location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                className="users-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="users-table-wrapper">

          {loading ? (
            <div className="users-state">
              <RefreshCw size={28} className="refresh-spinning" />
              <h3>Loading Donors</h3>
              <p>Fetching donor information...</p>
            </div>
          ) : error ? (
            <div className="users-state users-error-state">
              <ShieldBan size={32} />
              <h3>Unable to Load Users</h3>
              <p>{error}</p>

              <button
                type="button"
                onClick={loadUsers}
                className="users-retry-btn"
              >
                Try Again
              </button>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>DONOR INFORMATION</th>
                  <th>ROLE</th>
                  <th>CONTACT</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>JOINED DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const targetId = user.id || user._id;

                    const currentStatus =
                      user.status ||
                      (user.isBlocked ? "Blocked" : "Active");

                    const isBlocked =
                      currentStatus.toLowerCase() === "blocked";

                    const isUpdating = updatingId === targetId;

                    return (
                      <tr key={targetId || user.email || index}>
                        <td className="users-index">
                          {String(index + 1).padStart(2, "0")}
                        </td>

                        <td>
                          <div className="donor-info">
                            <div className="donor-avatar">
                              <UserRound size={20} />
                            </div>

                            <div className="donor-details">
                              <strong>
                                {user.name || "N/A"}
                              </strong>

                              <span>
                                <Mail size={12} />
                                {user.email || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="users-role-badge">
                            {user.role || "donor"}
                          </span>
                        </td>

                        <td>
                          <div className="users-contact">
                            <Phone size={14} />
                            <span>
                              {user.phone || "Not provided"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="users-contact">
                            <MapPin size={14} />
                            <span>
                              {user.location || "Not provided"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`users-status-badge ${
                              isBlocked ? "status-blocked" : "status-active"
                            }`}
                          >
                            <span className="status-dot" />
                            {currentStatus}
                          </span>
                        </td>

                        <td>
                          <div className="users-date">
                            <CalendarDays size={14} />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>

                        <td>
                          <div className="users-action-group">
                            <button
                              type="button"
                              className={`users-action-btn ${
                                !isBlocked ? "action-active-selected" : ""
                              }`}
                              onClick={() =>
                                handleStatusChange(targetId, "Active")
                              }
                              disabled={isUpdating || !isBlocked}
                            >
                              {isUpdating ? "Saving..." : "Active"}
                            </button>

                            <button
                              type="button"
                              className={`users-action-btn ${
                                isBlocked ? "action-blocked-selected" : ""
                              }`}
                              onClick={() =>
                                handleStatusChange(targetId, "Blocked")
                              }
                              disabled={isUpdating || isBlocked}
                            >
                              {isUpdating ? "Saving..." : "Block"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="users-empty">
                      <div>
                        <UsersIcon size={32} />
                        <strong>
                          {search.trim()
                            ? "No matching donors found"
                            : "No donors available"}
                        </strong>
                        <span>
                          {search.trim()
                            ? "Try searching with a different keyword."
                            : "Registered donors will appear here."}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </div>

        {!loading && !error && (
          <div className="users-table-footer">
            <span>
              Showing <strong>{filteredUsers.length}</strong> of{" "}
              <strong>{users.length}</strong> donors
            </span>

            <span className="users-footer-status">
              <span />
              FeedLink User Database
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Users;
