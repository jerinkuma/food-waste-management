
import React, { useEffect, useState } from "react";
import {
  Users,
  Utensils,
  Clock3,
  MessageSquare,
  Activity,
  TrendingUp,
  RefreshCw,
  CalendarDays,
  Package,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";

import { fetchDashboardStats } from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchDashboardStats();
      const data = response?.data || response;

      setStats(data || {});

      const allActivities = Array.isArray(data?.recentActivities)
        ? data.recentActivities
        : [];

      setActivities(allActivities.slice(0, 4));
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const formatActivityTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      subtitle: "Registered donors and NGOs",
      icon: Users,
      className: "users-stat",
      number: "01",
    },
    {
      title: "Total Donations",
      value: stats?.totalDonations ?? 0,
      subtitle: `${stats?.availableFood ?? "0 kg"} completed food`,
      icon: Utensils,
      className: "donations-stat",
      number: "02",
    },
    {
      title: "Pending Donations",
      value: stats?.pendingDonations ?? 0,
      subtitle: "Donations awaiting action",
      icon: Clock3,
      className: "pending-stat",
      number: "03",
    },
    {
      title: "Feedback",
      value: stats?.feedbackCount ?? 0,
      subtitle: "Total feedback entries",
      icon: MessageSquare,
      className: "feedback-stat",
      number: "04",
    },
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-state">
          <div className="dashboard-spinner" />
          <h3>Loading Dashboard</h3>
          <p>Fetching your latest statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-error">
          <div className="dashboard-error-icon">
            <Activity size={28} />
          </div>

          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>

          <button type="button" onClick={loadDashboardStats}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <span className="welcome-label">
            PLATFORM OVERVIEW
          </span>

          <h2>Welcome to FeedLink Administration</h2>

          <p>
            Keep track of food donations, users, and community engagement
            from one place.
          </p>
        </div>

        <div className="welcome-decoration">
          <div className="welcome-decoration-circle">
            <Utensils size={42} />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="dashboard-section-heading">
        <div>
          <span className="section-eyebrow">AT A GLANCE</span>
          <h2>Platform Statistics</h2>
          <p>Here's what's happening across your platform.</p>
        </div>

        <div className="live-indicator">
          <span />
          Live Overview
        </div>
      </div>

      <div className="dashboard-stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className={`dashboard-stat-card ${card.className}`}
              key={card.title}
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Icon size={22} />
                </div>

                <span className="stat-card-number">
                  {card.number}
                </span>
              </div>

              <div className="stat-card-info">
                <span className="stat-card-title">
                  {card.title}
                </span>

                <strong className="stat-card-value">
                  {card.value}
                </strong>

                <span className="stat-card-subtitle">
                  {card.subtitle}
                </span>
              </div>

              <div className="stat-card-decoration">
                <ArrowUpRight size={21} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <section className="dashboard-activity-section">
        <div className="activity-section-header">
          <div className="activity-heading">
            <div className="activity-heading-icon">
              <Activity size={21} />
            </div>

            <div>
              <span className="section-eyebrow">
                LATEST UPDATES
              </span>

              <h2>Recent Activity</h2>

              <p>
                Stay updated with the latest platform activities.
              </p>
            </div>
          </div>

          <div className="activity-count">
            <span>{activities.length}</span>
            Recent Records
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">
              <Package size={28} />
            </div>

            <h3>No Recent Activity</h3>

            <p>
              New donation and platform updates will appear here.
            </p>
          </div>
        ) : (
          <div className="activity-grid">
            {activities.map((activity, index) => (
              <div
                className="activity-card"
                key={activity.id || activity._id || index}
              >
                <div className="activity-card-top">
                  <div className="activity-card-icon">
                    <Package size={20} />
                  </div>

                  <span className="activity-number">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="activity-card-content">
                  <span className="activity-card-label">
                    PLATFORM UPDATE
                  </span>

                  <h3>Latest Update</h3>

                  <p>
                    {activity.text || "A new activity was recorded."}
                  </p>
                </div>

                <div className="activity-card-footer">
                  <span className="activity-time">
                    <CalendarDays size={14} />
                    {formatActivityTime(
                      activity.time || activity.createdAt
                    ) || "Time unavailable"}
                  </span>

                  <span className="activity-status">
                    <span />
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="activity-footer-note">
          <TrendingUp size={16} />
          <span>
            Showing the 4 latest activities. Visit Donations to explore
            complete donation records.
          </span>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
