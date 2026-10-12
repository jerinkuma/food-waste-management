
import React, { useEffect, useMemo, useState } from "react";
import { FileDown, Search, Eye } from "lucide-react";
import { getCurrentUser } from "../../../services/auth";
import { fetchNgoDonations } from "../../../services/api";
import "./DonationHistoryLogs.css";

export default function DonationHistoryLogs() {
  const user = getCurrentUser();

  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      if (!user?.id) {
        setError("NGO user information was not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Fetch this NGO's donations from the existing donation API.
        const result = await fetchNgoDonations(user.id);

        // The API returns donations, active and archived.
        // Keep completed donations for the History & Logs page.
        const donations = Array.isArray(result?.donations)
          ? result.donations
          : [
              ...(result?.archived || []),
              ...(result?.active || []),
            ];

        const completed = donations.filter(
          (donation) =>
            String(
              donation.pipelineStatus || donation.status || ""
            ).toLowerCase() === "completed"
        );

        if (!cancelled) {
          setLogsData(completed);
        }
      } catch (err) {
        console.error("Failed to load donation history:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Could not load donation history. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return logsData;

    return logsData.filter((log) => {
      const donorName =
        typeof log.donor === "object"
          ? log.donor?.name || ""
          : log.donor || "";

      const donationId = log.donationId || log._id || "";
      const foodName = log.foodName || log.foodType || log.food || "";

      return (
        String(donationId).toLowerCase().includes(term) ||
        String(donorName).toLowerCase().includes(term) ||
        String(foodName).toLowerCase().includes(term)
      );
    });
  }, [logsData, searchTerm]);

  const displayedLogs = showAllLogs
    ? filteredLogs
    : filteredLogs.slice(0, 4);

  const exportReport = () => {
    const rows = [
      ["Donation ID", "Date", "Donor", "Food", "Quantity", "Status"],
      ...filteredLogs.map((log) => [
        log.donationId || log._id || "",
        log.createdAt
          ? new Date(log.createdAt).toLocaleDateString()
          : "",
        typeof log.donor === "object"
          ? log.donor?.name || ""
          : log.donor || "",
        log.foodName || log.foodType || log.food || "",
        log.quantity ?? log.quantityKg ?? log.qty ?? "",
        log.pipelineStatus || log.status || "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "feedlink-donation-history.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="dhl-container">
      <div className="dhl-header">
        <div>
          <div className="dhl-title-group">
            <span className="text-xl">📦</span>
            <h2 className="dhl-title">
              HISTORY & LOGS: Completed Donations
            </h2>
          </div>
          <p className="dhl-subtitle">
            Completed donations and their audit records
          </p>
        </div>

        <button
          className="dhl-export-btn"
          onClick={exportReport}
          disabled={filteredLogs.length === 0}
        >
          <FileDown size={16} />
          EXPORT REPORT
        </button>
      </div>

      <div className="dhl-filters-panel">
        <div>
          <label className="dhl-filter-label">
            Search ID / Donor / Food
          </label>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="dhl-filter-input pl-9"
            />
          </div>
        </div>
      </div>

      <div className="dhl-main-grid">
        <div className="dhl-table-col">
          <div className="dhl-table-header">
            <div>
              <h3 className="dhl-table-title">
                DONATION HISTORY LOGS
              </h3>
              <p className="text-[11px] text-slate-400">
                Records from the NGO donation database
              </p>
            </div>

            <span className="dhl-records-badge">
              {filteredLogs.length} Records Found
            </span>
          </div>

          <div className="dhl-table-wrapper">
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading donation history...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">
                <p>{error}</p>
                <button
                  className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-white"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : (
              <table className="dhl-custom-table">
                <thead>
                  <tr>
                    <th className="p-3">Donation ID</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Donor</th>
                    <th className="p-3">Food Type</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayedLogs.map((log) => {
                    const donorName =
                      typeof log.donor === "object"
                        ? log.donor?.name || "N/A"
                        : log.donor || "N/A";

                    return (
                      <tr
                        key={log._id || log.donationId}
                        className="hover:bg-slate-50"
                      >
                        <td className="p-3 font-bold text-slate-900">
                          {log.donationId ||
                            log._id?.slice(-6) ||
                            "N/A"}
                        </td>

                        <td className="p-3 text-slate-500">
                          {log.createdAt
                            ? new Date(
                                log.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="p-3 font-semibold text-slate-800">
                          {donorName}
                        </td>

                        <td className="p-3 text-slate-700">
                          {log.foodName ||
                            log.foodType ||
                            log.food ||
                            "N/A"}
                        </td>

                        <td className="p-3 font-semibold text-slate-900">
                          {log.quantity ??
                            log.quantityKg ??
                            log.qty ??
                            "N/A"}
                          {log.quantity != null ||
                          log.quantityKg != null
                            ? " kg"
                            : ""}
                        </td>

                        <td className="p-3">
                          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                            ✓ {log.pipelineStatus || log.status}
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedReceipt(log)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                          >
                            <Eye size={13} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && filteredLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-slate-500"
                      >
                        {searchTerm
                          ? "No records match your search."
                          : "No completed donations found for this NGO."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {filteredLogs.length > 4 && (
            <button
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

      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-800">
                Donation Receipt
              </h3>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <strong>Donation ID:</strong>{" "}
                {selectedReceipt.donationId ||
                  selectedReceipt._id ||
                  "N/A"}
              </p>
              <p>
                <strong>Donor:</strong>{" "}
                {typeof selectedReceipt.donor === "object"
                  ? selectedReceipt.donor?.name || "N/A"
                  : selectedReceipt.donor || "N/A"}
              </p>
              <p>
                <strong>Food:</strong>{" "}
                {selectedReceipt.foodName ||
                  selectedReceipt.foodType ||
                  selectedReceipt.food ||
                  "N/A"}
              </p>
              <p>
                <strong>Quantity:</strong>{" "}
                {selectedReceipt.quantity ??
                  selectedReceipt.quantityKg ??
                  selectedReceipt.qty ??
                  "N/A"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedReceipt.pipelineStatus ||
                  selectedReceipt.status ||
                  "N/A"}
              </p>
              <p>
                <strong>Completed/Created:</strong>{" "}
                {selectedReceipt.updatedAt || selectedReceipt.createdAt
                  ? new Date(
                      selectedReceipt.updatedAt ||
                        selectedReceipt.createdAt
                    ).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}