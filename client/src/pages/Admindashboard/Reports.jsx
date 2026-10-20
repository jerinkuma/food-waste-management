
import React, { useCallback, useEffect, useState } from "react";
import { fetchDashboardStats } from "../../services/api";
import "./Reports.css";

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchDashboardStats();
      const data = response?.data || response;

      if (data?.success === false) {
        throw new Error(data.message || "Failed to load reports.");
      }

      setReport(data);
    } catch (err) {
      console.error("Reports loading error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Reports load kora jacche na."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const totalUsers = Number(report?.totalUsers) || 0;
  const totalDonations = Number(report?.totalDonations) || 0;
  const pendingDonations = Number(report?.pendingDonations) || 0;
  const otherDonations = Math.max(
    totalDonations - pendingDonations,
    0
  );

  const availableFood =
    report?.availableFood ?? "0 kg";

  const foodValue =
    typeof availableFood === "number"
      ? `${availableFood} kg`
      : String(availableFood);

  const statusBars = [
    {
      label: "Pending Donations",
      value: pendingDonations,
      className: "pending",
      color: "#e6a23c",
    },
    {
      label: "Other Donations",
      value: otherDonations,
      className: "other",
      color: "#26966b",
    },
  ];

  const recentActivities = Array.isArray(report?.recentActivities)
    ? report.recentActivities
    : [];

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="page reports-page">
      <div className="reports-heading">
        <div>
          <span className="reports-eyebrow">FEEDLINK ADMINISTRATION</span>
          <h1>
            <span className="page-icon">📈</span> Reports & Analytics
          </h1>
          <p className="reports-description">
            Monitor donations, platform users and food distribution.
          </p>
        </div>

        <button
          type="button"
          className="reports-refresh-btn"
          onClick={loadReports}
          disabled={loading}
        >
          <span className={loading ? "refresh-icon spinning" : "refresh-icon"}>
            ↻
          </span>
          {loading ? "Loading..." : "Refresh Reports"}
        </button>
      </div>

      {error && (
        <div className="reports-error" role="alert">
          <span>⚠️</span>
          <div>
            <strong>Unable to load reports</strong>
            <p>{error}</p>
            <button type="button" onClick={loadReports}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {loading && !report ? (
        <div className="reports-loading">
          <span className="reports-spinner" />
          <p>Loading your latest report data...</p>
        </div>
      ) : report ? (
        <>
          

          <div className="reports-content-grid">
            <section className="reports-panel">
              <div className="reports-panel-heading">
                <div>
                  <h2>Donation Overview</h2>
                  <p>Current donation record breakdown</p>
                </div>
                <span className="panel-icon">📊</span>
              </div>

              <div className="donation-overview-total">
                <div>
                  <span>Total records</span>
                  <strong>{totalDonations.toLocaleString()}</strong>
                </div>
                <span className="overview-caption">
                  All-time overview
                </span>
              </div>

              <div className="report-bars">
                {statusBars.map((item) => {
                  const percentage =
                    totalDonations > 0
                      ? Math.min(
                          (item.value / totalDonations) * 100,
                          100
                        )
                      : 0;

                  return (
                    <div className="report-bar-item" key={item.className}>
                      <div className="report-bar-label">
                        <span>
                          <i
                            className={`report-legend-dot ${item.className}`}
                          />
                          {item.label}
                        </span>
                        <strong>
                          {item.value.toLocaleString()}{" "}
                          <small>
                            ({percentage.toFixed(1)}%)
                          </small>
                        </strong>
                      </div>

                      <div
                        className="report-bar-track"
                        role="progressbar"
                        aria-label={item.label}
                        aria-valuenow={Math.round(percentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={`report-bar-fill ${item.className}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="report-chart-note">
                “Other Donations” means records that are not currently
                marked Pending. It does not necessarily mean all have
                been completed.
              </p>
            </section>

            <section className="reports-panel">
              <div className="reports-panel-heading">
                <div>
                  <h2>Report Summary</h2>
                  <p>Key platform indicators</p>
                </div>
                <span className="panel-icon">📋</span>
              </div>

              <div className="summary-list">
                <div className="summary-row">
                  <span className="summary-icon">👥</span>
                  <div>
                    <strong>Registered Users</strong>
                    <p>Users across all roles</p>
                  </div>
                  <b>{totalUsers.toLocaleString()}</b>
                </div>

                <div className="summary-row">
                  <span className="summary-icon">🍱</span>
                  <div>
                    <strong>Total Donations</strong>
                    <p>All recorded donations</p>
                  </div>
                  <b>{totalDonations.toLocaleString()}</b>
                </div>

                <div className="summary-row">
                  <span className="summary-icon">⏳</span>
                  <div>
                    <strong>Pending Donations</strong>
                    <p>Require further processing</p>
                  </div>
                  <b>{pendingDonations.toLocaleString()}</b>
                </div>

                <div className="summary-row">
                  <span className="summary-icon">🌿</span>
                  <div>
                    <strong>Food Distributed</strong>
                    <p>Quantity from completed records</p>
                  </div>
                  <b>{foodValue}</b>
                </div>
              </div>
            </section>
          </div>

          <section className="reports-panel reports-activity-panel">
            <div className="reports-panel-heading">
              <div>
                <h2>Recent Donation Activity</h2>
                <p>Latest donation activity from the database</p>
              </div>
              <span className="panel-icon">🕒</span>
            </div>

            {recentActivities.length > 0 ? (
              <div className="report-activity-list">
                {recentActivities.map((activity, index) => (
                  <div
                    className="report-activity-row"
                    key={activity.id || index}
                  >
                    <span className="activity-dot">🍽️</span>
                    <div className="activity-description">
                      <p>{activity.text || "Donation activity recorded"}</p>
                      <span>
                        {formatDate(activity.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="reports-empty">
                <span>📭</span>
                <strong>No recent activity</strong>
                <p>Recent donation activities will appear here.</p>
              </div>
            )}
          </section>

          <p className="reports-footer-note">
            Report figures are loaded from the FeedLink backend. Monthly
            comparisons and NGO-specific totals are not included until the
            backend provides those metrics.
          </p>
        </>
      ) : (
        !error && (
          <div className="reports-empty">
            <span>📊</span>
            <strong>No report data available</strong>
            <p>Try refreshing the report.</p>
          </div>
        )
      )}
    </div>
  );
};

export default Reports;
