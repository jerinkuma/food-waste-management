
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, FileDown, FileText, Package } from "lucide-react";
import "./DonationHistoryLogs.css";

export default function DonationHistoryLogs() {
  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Fetch donation logs from the backend
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          "http://localhost:5000/api/donation-logs/all"
        );

        if (res.data?.success) {
          setLogsData(Array.isArray(res.data.data) ? res.data.data : []);
        } else {
          setLogsData([]);
          setError("Could not load donation history.");
        }
      } catch (err) {
        console.error("Database fetch failed:", err);
        setError("Unable to load donation records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter donation logs by ID, donor, or food name
  const filteredLogs = logsData.filter((log) => {
    const search = searchTerm.trim().toLowerCase();
    const donationId = String(log.donationId || log._id || "").toLowerCase();
    const donorName = String(
      log.donorId?.name || log.donor || ""
    ).toLowerCase();
    const foodName = String(
      log.foodType || log.food || log.foodName || ""
    ).toLowerCase();

    return (
      donationId.includes(search) ||
      donorName.includes(search) ||
      foodName.includes(search)
    );
  });

  const displayedLogs = showAllLogs
    ? filteredLogs
    : filteredLogs.slice(0, 4);

  // Format dates safely
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Export the currently filtered records as CSV
  const exportReport = () => {
    if (filteredLogs.length === 0) {
      window.alert("There are no donation records to export.");
      return;
    }

    const headers = [
      "Donation ID",
      "Food",
      "Restaurant / Donor",
      "Quantity",
      "Estimated Meals",
      "Date",
      "Status",
    ];

    const rows = filteredLogs.map((log) => [
      log.donationId || log._id || "",
      log.foodType || log.food || log.foodName || "",
      log.restaurantId?.name ||
        log.restaurant?.name ||
        log.donorId?.name ||
        log.donor ||
        "N/A",
      log.quantity ?? log.qty ?? "",
      log.estimatedMeals ?? log.meals ?? "",
      formatDate(log.createdAt || log.date),
      log.status || "Delivered",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "donation-history-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "Delivered").toLowerCase();

    if (
      normalizedStatus.includes("deliver") ||
      normalizedStatus.includes("complete") ||
      normalizedStatus.includes("received")
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      normalizedStatus.includes("pending") ||
      normalizedStatus.includes("progress")
    ) {
      return "bg-amber-50 text-amber-700";
    }

    if (
      normalizedStatus.includes("cancel") ||
      normalizedStatus.includes("reject")
    ) {
      return "bg-rose-50 text-rose-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const getRestaurantName = (log) =>
    log.restaurantId?.name ||
    log.restaurant?.name ||
    log.donorId?.name ||
    log.donor ||
    "N/A";

  const getFoodName = (log) =>
    log.foodType || log.food || log.foodName || "N/A";

  const getQuantity = (log) => {
    const quantity = log.quantity ?? log.qty;

    if (quantity === undefined || quantity === null || quantity === "") {
      return "N/A";
    }

    return `${quantity}${typeof quantity === "number" ? " kg" : ""}`;
  };

  const getEstimatedMeals = (log) => {
    if (log.estimatedMeals !== undefined && log.estimatedMeals !== null) {
      return log.estimatedMeals;
    }

    if (log.meals !== undefined && log.meals !== null) {
      return log.meals;
    }

    const quantity = Number(log.quantity ?? log.qty);

    return Number.isFinite(quantity) && quantity > 0
      ? Math.floor(quantity / 0.25)
      : "N/A";
  };

  return (
    <div className="dhl-container min-h-screen">
      {/* Header */}
      <div className="dhl-header">
        <div>
          <div className="dhl-title-group">
            <Package size={22} className="text-emerald-600" />
            <h2 className="dhl-title">
              HISTORY &amp; LOGS: Completed Donations
            </h2>
          </div>

          <p className="dhl-subtitle">
            NGO donation history, records and proof receipts
          </p>
        </div>

        <button
          type="button"
          className="dhl-export-btn"
          onClick={exportReport}
        >
          <FileDown size={17} />
          <span>EXPORT REPORT</span>
        </button>
      </div>

      {/* Search */}
      <div className="dhl-filters-panel">
        <div className="w-full">
          <label
            htmlFor="donation-history-search"
            className="dhl-filter-label"
          >
            Search Donation ID, Donor or Food
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="donation-history-search"
              type="search"
              placeholder="Search donation records..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setShowAllLogs(false);
              }}
              className="dhl-filter-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Donation history */}
      <div className="dhl-main-grid">
        <div className="dhl-table-col">
          <div className="dhl-table-header">
            <div>
              <h3 className="dhl-table-title">
                DONATION HISTORY LOGS
              </h3>

              <p className="text-[11px] text-slate-400">
                Live MongoDB Database Logs
              </p>
            </div>

            <span className="dhl-records-badge">
              {filteredLogs.length} Records Found
            </span>
          </div>

          <div className="dhl-table-wrapper overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading donation records...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-600">
                {error}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No donation records found.
              </div>
            ) : (
              <table className="dhl-custom-table w-full">
                <thead>
                  <tr>
                    <th className="p-3">Donation ID</th>
                    <th className="p-3">Food</th>
                    <th className="p-3">Restaurant / Donor</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Estimated Meals</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayedLogs.map((log) => (
                    <tr
                      key={log._id || log.id || log.donationId}
                      className="hover:bg-slate-50"
                    >
                      <td className="p-3 font-bold text-slate-900">
                        {log.donationId ||
                          (log._id ? log._id.slice(-6) : log.id) ||
                          "N/A"}
                      </td>

                      <td className="p-3 text-slate-700">
                        {getFoodName(log)}
                      </td>

                      <td className="p-3 text-slate-700">
                        {getRestaurantName(log)}
                      </td>

                      <td className="p-3 font-semibold text-slate-800">
                        {getQuantity(log)}
                      </td>

                      <td className="p-3 text-slate-700">
                        {getEstimatedMeals(log)}
                      </td>

                      <td className="p-3 text-slate-500">
                        {formatDate(log.createdAt || log.date)}
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold ${getStatusClass(
                            log.status
                          )}`}
                        >
                          {log.status || "Delivered"}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(log)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <FileText size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredLogs.length > 4 && !loading && !error && (
            <button
              type="button"
              onClick={() => setShowAllLogs((previous) => !previous)}
              className="dhl-see-more-btn"
            >
              {showAllLogs
                ? "SHOW LESS"
                : `SEE MORE LOGS (${filteredLogs.length - 4} MORE)`}
            </button>
          )}
        </div>
      </div>

      {/* Receipt modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donation-receipt-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3
                  id="donation-receipt-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Donation Receipt
                </h3>
                <p className="text-sm text-slate-500">
                  Donation record details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">Donation ID</span>
                <span className="break-all text-right font-semibold text-slate-800">
                  {selectedReceipt.donationId ||
                    selectedReceipt._id ||
                    selectedReceipt.id ||
                    "N/A"}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">Food</span>
                <span className="text-right font-semibold text-slate-800">
                  {getFoodName(selectedReceipt)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">Restaurant / Donor</span>
                <span className="text-right font-semibold text-slate-800">
                  {getRestaurantName(selectedReceipt)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">Quantity</span>
                <span className="text-right font-semibold text-slate-800">
                  {getQuantity(selectedReceipt)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">Estimated Meals</span>
                <span className="text-right font-semibold text-slate-800">
                  {getEstimatedMeals(selectedReceipt)}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b pb-2">
                <span className="text-slate-500">Date</span>
                <span className="text-right font-semibold text-slate-800">
                  {formatDate(
                    selectedReceipt.createdAt || selectedReceipt.date
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="text-right font-semibold text-slate-800">
                  {selectedReceipt.status || "Delivered"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
