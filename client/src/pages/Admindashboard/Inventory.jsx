
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchInventory } from "../../services/api";
import "./Inventory.css";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchInventory();
      const data = response?.data || response;

      if (data?.success === false) {
        throw new Error(data.message || "Failed to load inventory.");
      }

      const records = Array.isArray(data)
        ? data
        : data?.donations || data?.items || [];

      setItems(
        records.map((item) => ({
          ...item,
          id: item._id || item.id,
          name: item.foodName || item.name || "Unnamed food",
          quantity: Number(item.quantity ?? item.qty) || 0,
          donorName:
            item.donor?.name ||
            item.donorName ||
            "Unknown donor",
          status:
            item.pipelineStatus ||
            item.status ||
            "Pending",
          expiry:
            item.bestBefore ||
            item.bestBeforeDate ||
            item.expiryDate ||
            item.expiry ||
            null,
          category:
            item.foodType ||
            item.category ||
            item.foodCategory ||
            "Not specified",
        }))
      );
    } catch (err) {
      console.error("Inventory loading error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load food inventory."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch = [
        item.name,
        item.donorName,
        item.category,
        item.status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const pendingCount = items.filter(
    (item) => item.status.toLowerCase() === "pending"
  ).length;

  const completedCount = items.filter((item) =>
    ["completed", "delivered"].includes(item.status.toLowerCase())
  ).length;

  const formatDate = (value) => {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = (value) => {
    if (!value) return false;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    return date < today;
  };

  const statusClass = (status) =>
    String(status || "Pending")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="page inventory-page">
      <div className="inventory-heading">
        <div>
          <span className="inventory-eyebrow">
            FEEDLINK ADMINISTRATION
          </span>
          <h1>
            <span className="page-icon">🍛</span>
            Food Inventory
          </h1>
          <p className="inventory-description">
            Monitor donated food, quantities, expiry dates and donation status.
          </p>
        </div>

        <button
          type="button"
          className="inventory-refresh-btn"
          onClick={loadInventory}
          disabled={loading}
        >
          <span className={loading ? "inventory-spinning" : ""}>↻</span>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="inventory-error" role="alert">
          <div>
            <strong>Could not load inventory</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={loadInventory}>
            Try again
          </button>
        </div>
      )}

      

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <div>
            <h2>Food Donation Records</h2>
            <p>
              {filteredItems.length} of {items.length} records
            </p>
          </div>
        </div>

        <div className="inventory-toolbar">
          <div className="inventory-search">
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search food, donor or category..."
              aria-label="Search inventory"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by donation status"
            className="inventory-status-filter"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {loading && items.length === 0 ? (
          <div className="inventory-state">
            <span className="inventory-loader" />
            <p>Loading food inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="inventory-state">
            <span>📦</span>
            <strong>
              {items.length === 0
                ? "No donation records found"
                : "No matching records"}
            </strong>
            <p>
              {items.length === 0
                ? "Donation records will appear here when available."
                : "Try another search term or status filter."}
            </p>
            {(search || statusFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Donor</th>
                  <th>Best Before</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>
                      <div className="inventory-food-cell">
                        <span className="inventory-food-icon">🍲</span>
                        <strong>{item.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="inventory-category">
                        {item.category}
                      </span>
                    </td>

                    <td className="inventory-quantity">
                      {item.quantity.toLocaleString()} kg
                    </td>

                    <td>{item.donorName}</td>

                    <td>
                      {item.expiry ? (
                        <span
                          className={
                            isExpired(item.expiry)
                              ? "inventory-expiry expired"
                              : "inventory-expiry"
                          }
                        >
                          {formatDate(item.expiry)}
                          {isExpired(item.expiry) && (
                            <small>Expired</small>
                          )}
                        </span>
                      ) : (
                        <span className="inventory-muted">
                          Not provided
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`inventory-badge ${statusClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="inventory-panel-footer">
          <span>Data source: FeedLink donation records</span>
          <span>{filteredItems.length} records displayed</span>
        </div>
      </section>
    </div>
  );
};

export default Inventory;
