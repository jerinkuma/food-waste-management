import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  PackageCheck,
  Building2,
  CalendarDays,
  FileDown,
  RefreshCw,
  Search,
  X
} from "lucide-react";

import { API_URL } from "../../../config";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6"
];

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState("All");
  const [timeRange, setTimeRange] = useState("Monthly");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/reports/advanced-analytics`,
        {
          params: {
            year: selectedYear,
            timeRange: timeRange,
            searchRestaurant: searchQuery,
          },
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      setReportData(response.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAnalytics();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedYear, timeRange, searchQuery]);

  const handleExportPDF = () => {
    const printableSection = document.getElementById(
      "printable-analytics-section"
    );

    if (!printableSection) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to export the report.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FeedLink - NGO Food Waste & Impact Analytics Report</title>
          <style>
            body {
              margin: 0;
              padding: 32px;
              background: #0f172a;
              color: #f8fafc;
              font-family: 'Inter', Arial, sans-serif;
            }
            * { box-sizing: border-box; }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${printableSection.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="p-6 md:p-8 w-full min-h-screen text-slate-100">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Analytics & Research
          </h1>
         
        </div>

        {/* Dynamic Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition w-44 md:w-52"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="Daily">Daily View</option>
            <option value="Monthly">Monthly View</option>
            <option value="Yearly">Yearly View</option>
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="All">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Printable Area Wrapper */}
      <div id="printable-analytics-section" className="space-y-6">
        {/* Loading / Error States */}
        {loading && (
          <div className="flex h-[40vh] items-center justify-center text-slate-400 font-medium text-sm gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            Loading analytics metrics...
          </div>
        )}

        {!loading && !reportData && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-8 rounded-2xl text-center">
            <p className="text-rose-300 text-sm font-medium mb-3">Unable to retrieve analytics data from the server.</p>
            <button
              onClick={fetchAnalytics}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        )}

        {!loading && reportData && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Total Food Saved
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                  {reportData?.totalFoodSavedKg ?? 0} <span className="text-lg font-bold text-slate-300">Kg</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  Verified completed pickups 
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-4 right-4 w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Completed Transactions
                </span>
                <div className="text-3xl font-extrabold text-blue-400 mt-2">
                  {reportData?.totalDonationsCount ?? 0}
                </div>
              
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Partner Restaurant Impact Analysis (Full Width on Large Screens) */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    Restaurant Impact Analysis: Food Saved (Kg)
                  </h3>
                </div>

                <div className="w-full h-80">
                  {!reportData?.restaurantImpactData ||
                  reportData.restaurantImpactData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                      No impact records matching "{searchQuery}"
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={reportData.restaurantImpactData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#1e293b"
                        />
                        <XAxis
                          dataKey="name"
                          fontSize={11}
                          stroke="#64748b"
                          tickLine={false}
                        />
                        <YAxis
                          fontSize={11}
                          stroke="#64748b"
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#090d16",
                            borderRadius: "12px",
                            border: "1px solid #1e293b",
                            fontSize: "12px",
                            color: "#f8fafc",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            paddingTop: "12px"
                          }}
                        />
                        <Bar
                          dataKey="SavedKg"
                          name="Food Saved (Kg)"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* 2. Received Food Items Breakdown */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">
                    Received Food Items 
                  </h3>
                </div>

                <div className="w-full h-72">
                  {!reportData?.foodCategories ||
                  reportData.foodCategories.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                      No food item data available.
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={reportData.foodCategories}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={{ fontSize: 11, fill: "#cbd5e1" }}
                        >
                          {reportData.foodCategories.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#090d16",
                            borderRadius: "12px",
                            border: "1px solid #1e293b",
                            fontSize: "12px",
                            color: "#f8fafc",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            paddingTop: "10px"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* 3. Timeline Trend */}
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">
                    Food Waste Prevention ({timeRange})
                  </h3>
                </div>

                <div className="w-full h-72">
                  {!reportData?.timelineTrend ||
                  reportData.timelineTrend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                      No timeline records for this selection.
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      <BarChart data={reportData.timelineTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#1e293b"
                        />
                        <XAxis
                          dataKey="period"
                          fontSize={11}
                          stroke="#64748b"
                          tickLine={false}
                        />
                        <YAxis
                          fontSize={11}
                          stroke="#64748b"
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#090d16",
                            borderRadius: "12px",
                            border: "1px solid #1e293b",
                            fontSize: "12px",
                            color: "#f8fafc",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                          }}
                        />
                        <Bar
                          dataKey="savedKg"
                          name="Saved (Kg)"
                          fill="#8b5cf6"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}