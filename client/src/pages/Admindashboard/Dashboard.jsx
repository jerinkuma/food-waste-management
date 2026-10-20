
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

        const data = await fetchDashboardStats();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load dashboard."
          );
        }

        if (isMounted) {
          setStats(data);
          setActivities(data.recentActivities || []);
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

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="page">
        <h1>
          <span className="page-icon">📊</span> Dashboard
        </h1>
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>
          <span className="page-icon">📊</span> Dashboard
        </h1>

        <p role="alert" className="dashboard-error">
          {error}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>
        <span className="page-icon">📊</span> Dashboard
      </h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Users</div>
          <div className="value">{stats?.totalUsers ?? 0}</div>
          <div className="sub">Donors and NGOs</div>
        </div>

        <div className="stat-card">
          <div className="label">Donations</div>
          <div className="value">
            {stats?.totalDonations ?? 0}
          </div>
          <div className="sub">
            {stats?.availableFood ?? "0 kg"} completed food
          </div>
        </div>

        <div className="stat-card">
          <div className="label">Pending</div>
          <div className="value">
            {stats?.pendingDonations ?? 0}
          </div>
          <div className="sub">Pending donations</div>
        </div>

        <div className="stat-card">
          <div className="label">Feedback</div>
          <div className="value">
            {stats?.feedbackCount ?? 0}
          </div>
          <div className="sub">Total feedback entries</div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>

        {activities.length === 0 ? (
          <p>No recent donation activity found.</p>
        ) : (
          <ul>
            {activities.map((activity) => (
              <li key={activity.id}>
                <span>{activity.text}</span>
                <small>
                  {formatActivityTime(activity.time)}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
