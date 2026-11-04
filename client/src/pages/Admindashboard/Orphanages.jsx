import React, { useEffect, useState, useMemo } from "react";
import { fetchOrphanages, updateUserStatus } from "../../services/api"; // 👉 updateUserStatus এখানে ইমপোর্ট করা হলো
import "./Orphanages.css";

const Orphanages = () => {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        status: ngo.isBlocked ? "Blocked" : (ngo.status || "Active"),
      }));

      setNgos(initializedNgos);
    } catch (err) {
      console.error("Failed to load NGOs:", err);
      setError(err.response?.data?.message || "NGO information load করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNgos();
  }, []);

  // এনজিও স্ট্যাটাস পরিবর্তন (Active / Blocked) করার ফাংশন
  const handleNgoStatusChange = async (ngoUserId, newStatus) => {
    try {
      // 👉 ব্যাকএন্ডে ইউজার আইডি দিয়ে স্ট্যাটাস আপডেট করা
      await updateUserStatus(ngoUserId, newStatus);

      // ফ্রন্টএন্ড স্টেট ইনস্ট্যান্ট আপডেট করা
      setNgos((prevNgos) =>
        prevNgos.map((ngo) => {
          const id = ngo.userId || ngo.id || ngo._id;
          if (id === ngoUserId) {
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
      alert("Failed to update NGO status on server.");
    }
  };

  const filteredNgos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ngos;

    return ngos.filter((ngo) =>
      [
        ngo.name,
        ngo.email,
        ngo.phone,
        ngo.address,
        ngo.organizationId,
        ngo.status,
      ].some((value) => String(value ?? "").toLowerCase().includes(query))
    );
  }, [ngos, search]);

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
        <span className="page-icon">🏢</span> NGO Management
      </h1>

      <div className="ngo-summary">
        <div className="ngo-summary-card">
          <span>Total NGOs</span>
          <strong>{loading ? "..." : ngos.length}</strong>
          <small>NGOs registered in the database</small>
        </div>
      </div>

      <div className="ngo-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search NGO, email, phone, address..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-wrap">
        {loading ? (
          <p className="ngo-message">Loading NGOs from database...</p>
        ) : error ? (
          <div className="ngo-error">
            <p>{error}</p>
            <button type="button" onClick={loadNgos}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            <p className="ngo-results">
              Showing <strong>{filteredNgos.length}</strong> of{" "}
              <strong>{ngos.length}</strong> NGOs
            </p>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>NGO Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Organization ID</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredNgos.length > 0 ? (
                  filteredNgos.map((ngo, index) => {
                    const targetId = ngo.userId || ngo.id || ngo._id;
                    const currentStatus = ngo.status || "Active";
                    const isBlocked = currentStatus.toLowerCase() === "blocked";

                    return (
                      <tr key={targetId || ngo.email || index}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{ngo.name || "N/A"}</strong>
                        </td>
                        <td>{ngo.email || "N/A"}</td>
                        <td>{ngo.phone || "Not provided"}</td>
                        <td>{ngo.address || ngo.location || "Not provided"}</td>
                        <td>{ngo.organizationId || "N/A"}</td>
                        <td>
                          <span className={`badge ${currentStatus.toLowerCase()}`}>
                            {currentStatus}
                          </span>
                        </td>
                        <td>{formatDate(ngo.createdAt)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleNgoStatusChange(targetId, "Active")}
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
                              onClick={() => handleNgoStatusChange(targetId, "Blocked")}
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
                    <td colSpan="9" className="ngo-empty">
                      {search.trim()
                        ? "No NGOs match your search."
                        : "No NGOs found in the database."}
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

export default Orphanages;