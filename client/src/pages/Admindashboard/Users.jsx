import React, { useEffect, useState, useMemo } from "react";
import { fetchUsers, updateUserStatus } from "../../services/api"; // 👉 সঠিক ফাংশনটি এখানে ইমপোর্ট করা হলো
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError(err.response?.data?.message || "Users information load করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ইউজার স্ট্যাটাস পরিবর্তন (Active / Blocked) করার ফাংশন
  const handleStatusChange = async (userId, newStatus) => {
    try {
      // ব্যাকএন্ডে API কল করে ডাটাবেজে পার্মানেন্টলি সেভ করা
      await updateUserStatus(userId, newStatus);

      // ফ্রন্টএন্ডের স্টেট ইনস্ট্যান্ট আপডেট করা
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
      alert("Failed to update status on server.");
    }
  };

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
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
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

  return (
    <div className="page">
      <h1>
        <span className="page-icon">👥</span> User Management (Donors)
      </h1>

      <div className="user-summary">
        <div className="user-summary-card">
          <span>Total Donors</span>
          <strong>{loading ? "..." : users.length}</strong>
          <small>Donors registered in the database</small>
        </div>
      </div>

      <div className="user-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search donor name, email, phone, location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-wrap">
        {loading ? (
          <p className="user-message">Loading users from database...</p>
        ) : error ? (
          <div className="user-error">
            <p>{error}</p>
            <button type="button" onClick={loadUsers}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <p className="user-results">
              Showing <strong>{filteredUsers.length}</strong> of{" "}
              <strong>{users.length}</strong> Donors
            </p>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const targetId = user.id || user._id;
                    const currentStatus = user.status || (user.isBlocked ? "Blocked" : "Active");
                    const isBlocked = currentStatus.toLowerCase() === "blocked";

                    return (
                      <tr key={targetId || user.email || index}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{user.name || "N/A"}</strong>
                        </td>
                        <td>{user.email || "N/A"}</td>
                        <td>
                          <span className="badge role">{user.role || "donor"}</span>
                        </td>
                        <td>{user.phone || "Not provided"}</td>
                        <td>{user.location || "Not provided"}</td>
                        <td>
                          <span className={`badge ${currentStatus.toLowerCase()}`}>
                            {currentStatus}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(targetId, "Active")}
                              style={{
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: !isBlocked ? "#059669" : "#e2e8f0",
                                color: !isBlocked ? "#ffffff" : "#64748b",
                              }}
                            >
                              Active
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(targetId, "Blocked")}
                              style={{
                                padding: "4px 10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: isBlocked ? "#dc2626" : "#e2e8f0",
                                color: isBlocked ? "#ffffff" : "#64748b",
                              }}
                            >
                              Block
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="user-empty">
                      {search.trim()
                        ? "No users match your search."
                        : "No users found in the database."}
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