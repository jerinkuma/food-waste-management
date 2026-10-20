
import React, { useEffect, useMemo, useState } from "react";
import { fetchOrphanages } from "../../services/api";
import "./Orphanages.css";

const Orphanages = () => {
  const [ngos, setNgos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadNgos = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchOrphanages();
        const list = Array.isArray(response)
          ? response
          : response?.ngos || [];

        if (isMounted) setNgos(list);
      } catch (err) {
        console.error("Failed to load NGOs:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "NGO information load করা যায়নি।"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNgos();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNgos = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ngos;

    return ngos.filter((ngo) =>
      [
        ngo.name,
        ngo.email,
        ngo.phone,
        ngo.location,
        ngo.address,
        ngo.organizationId,
        ngo.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
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
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
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
                </tr>
              </thead>

              <tbody>
                {filteredNgos.length > 0 ? (
                  filteredNgos.map((ngo, index) => (
                    <tr key={ngo.id || ngo._id || ngo.email || index}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{ngo.name || "N/A"}</strong>
                      </td>
                      <td>{ngo.email || "N/A"}</td>
                      <td>{ngo.phone || "Not provided"}</td>
                      <td>
                        {ngo.address || ngo.location || "Not provided"}
                      </td>
                      <td>{ngo.organizationId || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${String(
                            ngo.status || "Active"
                          ).toLowerCase()}`}
                        >
                          {ngo.status || "Active"}
                        </span>
                      </td>
                      <td>{formatDate(ngo.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="ngo-empty">
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
