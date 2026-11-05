import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";

const COLORS = ["#047857", "#1d4ed8", "#b45309", "#b91c1c", "#6d28d9", "#0e7490"];

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState("All");
  const [timeRange, setTimeRange] = useState("Monthly");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/reports/advanced-analytics`, {
        params: {
          year: selectedYear,
          timeRange: timeRange,
          searchRestaurant: searchQuery,
        },
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setReportData(response.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
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
    const printContent = document.getElementById("printable-analytics-section").innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); 
  };

  return (
    <div style={{ padding: "32px", backgroundColor: "#0f172a", minHeight: "100vh", fontFamily: "Inter, sans-serif", color: "#f8fafc", boxSizing: "border-box" }}>
      
      {/* Header & Controls Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
            Food Waste Reduction & Impact Research Metrics
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>
            Evaluative performance report based on verified organizational collection logs.
          </p>
        </div>

        {/* Dynamic Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                background: "#1e293b",
                color: "#f8fafc",
                fontSize: "12px",
                width: "190px",
                outline: "none"
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "12px" }}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", fontSize: "12px", outline: "none", cursor: "pointer" }}
          >
            <option value="Daily">Daily View</option>
            <option value="Monthly">Monthly View</option>
            <option value="Yearly">Yearly View</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#1e293b", color: "#f8fafc", fontSize: "12px", outline: "none", cursor: "pointer" }}
          >
            <option value="All">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          <button onClick={handleExportPDF} style={{ padding: "8px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div id="printable-analytics-section" style={{ backgroundColor: "#0f172a" }}>
        
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Total Food Saved</span>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#10b981", marginTop: "8px" }}>
              {reportData?.totalFoodSavedKg ?? 0} Kg
            </div>
            <span style={{ fontSize: "10px", color: "#64748b", marginTop: "2px", display: "block" }}>Verified completed pickups</span>
          </div>

          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" }}>Completed Transactions</span>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#3b82f6", marginTop: "8px" }}>
              {reportData?.totalDonationsCount ?? 0}
            </div>
            <span style={{ fontSize: "10px", color: "#64748b", marginTop: "2px", display: "block" }}>Matching dashboard logs</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "20px" }}>
          
          {/* 1. Partner Restaurant Impact Analysis (Food Saved in Kg Only) */}
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", gridColumn: "1 / -1" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", marginBottom: "16px" }}>
              Partner Restaurant Impact Analysis: Food Saved (Kg)
            </h3>
            <div style={{ width: "100%", height: 300 }}>
              {(!reportData?.restaurantImpactData || reportData.restaurantImpactData.length === 0) ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>
                  No impact records matching "{searchQuery}"
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={reportData.restaurantImpactData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", border: "1px solid #334155", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                    <Bar dataKey="SavedKg" name="Food Saved (Kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 2. Received Food Items Breakdown */}
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", marginBottom: "16px" }}>
              Received Food Items Breakdown
            </h3>
            <div style={{ width: "100%", height: 260 }}>
              {(!reportData?.foodCategories || reportData.foodCategories.length === 0) ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>
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
                      outerRadius={80}
                      label={{ fontSize: 10, fill: "#f8fafc" }}
                    >
                      {reportData.foodCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", border: "1px solid #334155", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* 3. Timeline Trend */}
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", marginBottom: "16px" }}>
              Food Waste Prevention Trend ({timeRange})
            </h3>
            <div style={{ width: "100%", height: 260 }}>
              {(!reportData?.timelineTrend || reportData.timelineTrend.length === 0) ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>
                  No timeline records for this selection.
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={reportData.timelineTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="period" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", border: "1px solid #334155", fontSize: "11px" }} />
                    <Bar dataKey="savedKg" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Reports;