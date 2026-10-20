import React, { useState, useEffect } from "react";
import { fetchUsers } from "../../services/api";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDonors = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchUsers();

        if (isMounted) {
          // API response object অথবা সরাসরি array—দুই ক্ষেত্রেই support করবে
          const donorList = Array.isArray(data)
            ? data
            : data?.users || [];

          setUsers(donorList);
        }
      } catch (err) {
        console.error("Failed to load donors:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Donor information load করা যায়নি। Backend/API check করো।"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDonors();

    return () => {
      isMounted = false;
    };
  }, []);


  const filtered = users.filter((user) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    const searchableFields = [
      user.name,
      user.email,
      user.phone,
      user.location,
      user.tradeLicense,
      user.status,
    ];

    return searchableFields.some((field) =>
      String(field ?? "").toLowerCase().includes(searchText)
    );
  });


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
    <div className="page">
      <h1>
        <span className="page-icon">👥</span> Donor Management
      </h1>

      <div className="user-toolbar">

        <input
          type="text"
          placeholder="Search by name, email, phone, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

      </div>

      <div className="table-wrap">
        {loading ? (
          <p className="donor-message">Loading donor information...</p>
        ) : error ? (
          <div className="donor-error">
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
            <p className="donor-count">
              Total Donors: <strong>{users.length}</strong>
              {search.trim() && (
                <span> · Matching: {filtered.length}</span>
              )}
            </p>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donor Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Trade License</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((user, index) => (
                    <tr key={user.id || user._id || user.email}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{user.name || "N/A"}</strong>
                      </td>
                      <td>{user.email || "N/A"}</td>
                      <td>{user.phone || "Not provided"}</td>
                      <td>{user.location || "Not provided"}</td>
                      <td>{user.tradeLicense || "Not provided"}</td>
                      <td>
                        <span
                          className={`badge ${String(
                            user.status || "Active"
                          ).toLowerCase()}`}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="donor-empty">
                      {search.trim()
                        ? "No donors match your search."
                        : "No donor information found in the database."}
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

export default Users;