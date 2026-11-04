import React, { useEffect, useState } from "react";
import { fetchDashboardStats } from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetchDashboardStats();
        const data = response?.data || response;

        if (isMounted) {
          setStats(data || {});
          // শুধুমাত্র একদম সাম্প্রতিক ৩-৫টি অ্যাক্টিভিটি ফিল্টার করে নেওয়ার জন্য (.slice ব্যবহার করা হয়েছে)
          const allActivities = data?.recentActivities || [];
          setActivities(allActivities.slice(0, 4));
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not load dashboard data."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatActivityTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "Inter, sans-serif" }}>
        <h2>Loading...</h2>
        <p>Fetching dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", fontFamily: "Inter, sans-serif" }}>
        <h2>📊 Dashboard</h2>
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "20px", borderRadius: "12px", marginTop: "20px", color: "#dc2626" }}>
          <p style={{ margin: 0, fontWeight: "600" }}>{error}</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ marginTop: "16px", padding: "10px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "12px", margin: 0 }}>
          <span style={{ background: "#e2e8f0", padding: "8px", borderRadius: "10px", fontSize: "20px" }}>📊</span> 
          Admin Dashboard
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "6px" }}>Overview of system activities and general statistics.</p>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Users</span>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "12px" }}>
            <strong style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a" }}>{stats?.totalUsers ?? 0}</strong>
            <span style={{ fontSize: "22px" }}>👥</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>Donors and NGOs</span>
        </div>

        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>Donations</span>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "12px" }}>
            <strong style={{ fontSize: "32px", fontWeight: "800", color: "#059669" }}>{stats?.totalDonations ?? 0}</strong>
            <span style={{ fontSize: "22px" }}>🍱</span>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b", marginTop: "8px", fontWeight: "500" }}>{stats?.availableFood ?? "0 kg"} completed food</span>
        </div>

        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#d97706", textTransform: "uppercase", letterSpacing: "0.5px" }}>Pending</span>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "12px" }}>
            <strong style={{ fontSize: "32px", fontWeight: "800", color: "#d97706" }}>{stats?.pendingDonations ?? 0}</strong>
            <span style={{ fontSize: "22px" }}>⏳</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>Pending donations</span>
        </div>

        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>Feedback</span>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "12px" }}>
            <strong style={{ fontSize: "32px", fontWeight: "800", color: "#2563eb" }}>{stats?.feedbackCount ?? 0}</strong>
            <span style={{ fontSize: "22px" }}>💬</span>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>Total feedback entries</span>
        </div>

      </div>

      {/* Recent Activity Section (Only Recent Items Shown) */}
      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📌</span> Recent Activity
          </h3>
          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>Showing only the latest activities. Complete records are stored in the Donations section.</p>
        </div>

        {activities.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "30px 0", margin: 0 }}>No recent activity found.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {activities.map((activity, index) => (
              <div 
                key={activity.id || index} 
                style={{ 
                  background: "#f8fafc", 
                  borderRadius: "12px", 
                  padding: "16px", 
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ fontSize: "18px", background: "#d1fae5", padding: "8px", borderRadius: "8px" }}>📦</span>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0" }}>Latest Update</h4>
                    <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: "1.4" }}>{activity.text}</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px dashed #cbd5e1" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Time: {formatActivityTime(activity.time || activity.createdAt)}</span>
                  <span style={{ fontSize: "11px", color: "#065f46", background: "#d1fae5", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>Active</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default Dashboard;