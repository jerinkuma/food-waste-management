import React, { useEffect, useMemo, useState } from "react";
import { FileDown, Search, X } from "lucide-react";
import { getCurrentUser } from "../../../services/auth";
import { fetchNgoDonations } from "../../../services/api";
import "./DonationHistoryLogs.css";

export default function DonationHistoryLogs() {
  const user = getCurrentUser();

  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

        const result = await fetchNgoDonations(user.id);

        const donations = Array.isArray(result?.donations)
          ? result.donations
          : Array.isArray(result)
          ? result
          : [
              ...(result?.archived || []),
              ...(result?.active || []),
            ];

        if (!cancelled) {
          setLogsData(donations);
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

  // স্ট্যাটাস বের করার লজিক
  const getStatusText = (log) => {
    if (log.deliveryMan || log.deliveryManId || log.delivery) {
      if (
        String(log.status || log.pipelineStatus).toLowerCase() === "completed" ||
        String(log.status || log.pipelineStatus).toLowerCase() === "delivered"
      ) {
        return "Completed";
      }
      return "Delivery Man Assigned";
    }

    const currentStatus = log.pipelineStatus || log.status;
    if (currentStatus) return currentStatus;

    if (log.ngoRequest || log.ngoId) {
      return "NGO Requested";
    }

    return "Pending";
  };

  // রেস্টুরেন্ট / ডোনারের নাম বের করার নিরাপদ লজিক
  const getRestaurantName = (log) => {
    if (log.donorName) return log.donorName;
    if (typeof log.donor === "object" && log.donor !== null) {
      return log.donor.name || log.donor.restaurantName || log.donor.organizationName || "Restaurant Partner";
    }
    if (typeof log.donor === "string" && log.donor.trim() !== "") {
      return log.donor;
    }
    return "Restaurant Partner";
  };

  // ইনস্ট্যান্ট সার্চ লজিক (ফুড এবং রেস্টুরেন্ট উভয় নাম সহ)
  const filteredLogs = useMemo(() => {
    if (!logsData || logsData.length === 0) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return logsData;

    return logsData.filter((log) => {
      const foodName = String(log.foodName || log.foodCategory || log.foodType || "").toLowerCase();
      const restaurantName = String(getRestaurantName(log)).toLowerCase();
      const statusText = String(getStatusText(log)).toLowerCase();
      const quantity = String(log.quantity || "").toLowerCase();
      const donationId = String(log.donationId || log._id || "").toLowerCase();

      return (
        foodName.includes(term) ||
        restaurantName.includes(term) ||
        statusText.includes(term) ||
        quantity.includes(term) ||
        donationId.includes(term)
      );
    });
  }, [logsData, searchTerm]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadgeStyle = (statusText) => {
    const st = String(statusText || "").toLowerCase();
    if (st.includes("completed") || st.includes("delivered")) {
      return "bg-slate-100 text-slate-700 border border-slate-200";
    }
    if (st.includes("delivery") || st.includes("assigned")) {
      return "bg-blue-50 text-blue-700 border border-blue-100";
    }
    if (st.includes("requested")) {
      return "bg-amber-50 text-amber-700 border border-amber-100";
    }
    return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  };

  // পিডিএফ রিপোর্ট জেনারেট এবং প্রিন্ট করার ফাংশন
  const exportReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups for this website to export PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NGO Donation Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            h2 { text-align: center; margin-bottom: 20px; color: #065f46; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <h2>FeedLink - NGO Donation History Report</h2>
          <table>
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Food</th>
                <th>Restaurant</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLogs
                .map((log) => {
                  const dId = log.donationId || log._id || "N/A";
                  const foodTitle = log.foodName || log.foodCategory || "N/A";
                  const restaurantName = getRestaurantName(log);
                  const qty = log.quantity ? `${log.quantity} KG` : "N/A";
                  const dateFormatted = formatDate(log.pickupDate || log.createdAt);
                  const statusText = getStatusText(log);

                  return `
                    <tr>
                      <td>${dId}</td>
                      <td>${foodTitle}</td>
                      <td>${restaurantName}</td>
                      <td>${qty}</td>
                      <td>${dateFormatted}</td>
                      <td>${statusText}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()} | FeedLink Platform</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
          />
          <input
            type="text"
            placeholder="Search food, ID, restaurant or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={exportReport}
          disabled={filteredLogs.length === 0}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
        >
          <FileDown size={16} />
          EXPORT PDF REPORT
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading donation history...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-xs text-white cursor-pointer"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-400">
                  <th className="py-4 px-6 font-medium">Donation ID</th>
                  <th className="py-4 px-6 font-medium">Food</th>
                  <th className="py-4 px-6 font-medium">Restaurant</th>
                  <th className="py-4 px-6 font-medium">Quantity</th>
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log) => {
                  const dId = log.donationId || log._id || "N/A";
                  const foodTitle = log.foodName || log.foodCategory || "N/A";
                  const foodSub = log.foodType || log.foodCategory || "";
                  const restaurantName = getRestaurantName(log);
                  const qty = log.quantity ? `${log.quantity} KG` : "N/A";
                  const dateFormatted = formatDate(
                    log.pickupDate || log.createdAt
                  );
                  const statusText = getStatusText(log);

                  return (
                    <tr
                      key={log._id || log.donationId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Donation ID Column */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {dId}
                      </td>

                      {/* Food Column */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">
                          {foodTitle}
                        </div>
                        {foodSub && foodSub !== foodTitle && (
                          <div className="text-xs text-slate-400">
                            {foodSub}
                          </div>
                        )}
                      </td>

                      {/* Restaurant Column */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-700">
                          {restaurantName}
                        </div>
                      </td>

                      {/* Quantity Column */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {qty}
                      </td>

                      {/* Date Column */}
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {dateFormatted}
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeStyle(
                            statusText
                          )}`}
                        >
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filteredLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-slate-400 text-sm"
                    >
                      No donation history found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}