
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAdvancedReports,
} from "../../services/api";
import "./Reports.css";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const number = (value) => Number(value || 0).toLocaleString("en-US");

const kg = (value) => `${Number(value || 0).toLocaleString("en-US", {
  maximumFractionDigits: 2,
})} kg`;

const currencySafePercent = (value, total) =>
  total > 0 ? Math.min((value / total) * 100, 100) : 0;

const Reports = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchAdvancedReports(
        year,
        month || null
      );

      if (!data?.success) {
        throw new Error(data?.message || "Reports could not be loaded.");
      }

      setReport(data);
    } catch (err) {
      console.error("Advanced reports error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const overall = report?.overall || {};
  const donor = report?.donor || {};
  const ngo = report?.ngo || {};

  const monthly = report?.monthlyTrend || [];
  const yearly = report?.yearlyTrend || [];
  const statuses = report?.statusBreakdown || [];

  const selectedPeriod = month
    ? `${MONTHS[Number(month) - 1]} ${year}`
    : `Full year ${year}`;

  const maxMonthly = Math.max(
    1,
    ...monthly.map((item) => Number(item.quantity) || 0)
  );

  const maxYearly = Math.max(
    1,
    ...yearly.map((item) => Number(item.quantity) || 0)
  );

  const totalStatus = statuses.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  const exportCSV = () => {
    if (!report) return;

    const rows = [
      ["FeedLink Advanced Reports"],
      ["Period", selectedPeriod],
      [],
      ["Platform Metric", "Value"],
      ["Total Users", overall.totalUsers],
      ["Total Donors", overall.totalDonors],
      ["Total NGOs", overall.totalNgos],
      ["Total Donations", overall.totalDonations],
      ["Food Donated (kg)", overall.totalFoodDonated],
      ["Food Received (kg)", overall.totalFoodReceived],
      ["Food Distributed (kg)", overall.totalFoodDistributed],
      [],
      ["Monthly Trend"],
      ["Month", "Donations", "Quantity (kg)", "Completed"],
      ...monthly.map((item) => [
        item.label,
        item.donations,
        item.quantity,
        item.completed,
      ]),
      [],
      ["Yearly Trend"],
      ["Year", "Donations", "Quantity (kg)", "Completed"],
      ...yearly.map((item) => [
        item.year,
        item.donations,
        item.quantity,
        item.completed,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => {
          const value = String(cell ?? "");
          return `"${value.replace(/"/g, '""')}"`;
        }).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `feedlink-reports-${year}${month ? `-${month}` : ""}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const maxDonor = Math.max(
    1,
    ...(donor.topPerformers || []).map((item) => item.quantity || 0)
  );

  const maxNgo = Math.max(
    1,
    ...(ngo.topPerformers || []).map((item) => item.completedQuantity || 0)
  );

  return (
    <div className="page reports-page">
      <div className="reports-hero">
        <div>
          

          <h1>Analytics</h1>

          <p>
            Monitor food donations, donor contributions and NGO
            distribution performance.
          </p>
        </div>

        <div className="reports-actions">
          

          <button
            type="button"
            className="report-refresh-btn"
            onClick={loadReports}
            disabled={loading}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <section className="report-filter-panel">
        <div>
          <span className="filter-caption">REPORT PERIOD</span>
          <h3>{selectedPeriod}</h3>
          <p>All figures are calculated from database records.</p>
        </div>

        <div className="report-filter-controls">
          <label>
            <span>Year</span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {Array.from({ length: 7 }, (_, index) => currentYear - 5 + index)
                .reverse()
                .map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
            </select>
          </label>

          <label>
            <span>Month</span>
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            >
              <option value="">All months</option>
              {MONTHS.map((item, index) => (
                <option key={item} value={index + 1}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error && (
        <div className="reports-error">
          <strong>Unable to load analytics</strong>
          <p>{error}</p>
          <button onClick={loadReports}>Try again</button>
        </div>
      )}

      {loading && !report ? (
        <div className="reports-loading">
          <span className="reports-spinner" />
          <p>Loading live analytics...</p>
        </div>
      ) : report ? (
        <>
          <div className="report-section-heading">
            <div>
              <span>PLATFORM OVERVIEW</span>
              <h2>Performance at a glance</h2>
            </div>
            <small>{selectedPeriod}</small>
          </div>

          <div className="report-kpi-grid">
            <KpiCard
              icon="👥"
              label="Total Users"
              value={number(overall.totalUsers)}
              note={`${number(overall.totalDonors)} Donors • ${number(overall.totalNgos)} NGOs`}
              color="green"
            />

            <KpiCard
              icon="🍱"
              label="Total Donations"
              value={number(overall.totalDonations)}
              note="Donation records in selected period"
              color="blue"
            />

            <KpiCard
              icon="🌿"
              label="Food Donated"
              value={kg(overall.totalFoodDonated)}
              note="Donor contribution"
              color="orange"
            />

            <KpiCard
              icon="🚚"
              label="Food Distributed"
              value={kg(overall.totalFoodDistributed)}
              note={`${number(overall.completedDonations)} completed records`}
              color="purple"
            />
          </div>

          <div className="report-section-heading">
            <div>
              <span>ORGANIZATION PERFORMANCE</span>
              <h2>Donor & NGO analytics</h2>
            </div>
          </div>

          <div className="report-role-grid">
            <section className="report-panel role-panel donor-panel">
              <div className="role-panel-heading">
                <div className="role-icon">🍽️</div>
                <div>
                  <span>DONOR PERFORMANCE</span>
                  <h3>Donor Analytics</h3>
                </div>
              </div>

              <div className="role-metrics">
                <Metric label="Registered Donors" value={number(donor.registered)} />
                <Metric label="Donations Created" value={number(donor.donations)} />
                <Metric label="Food Donated" value={kg(donor.quantity)} />
                <Metric label="Completed Donations" value={number(donor.completed)} />
              </div>

              <div className="performer-heading">
                <strong>Top Donors</strong>
                <span>By food contribution</span>
              </div>

              <PerformerList
                items={donor.topPerformers || []}
                valueKey="quantity"
                maxValue={maxDonor}
                empty="No donor contributions in this period."
              />
            </section>

            <section className="report-panel role-panel ngo-panel">
              <div className="role-panel-heading">
                <div className="role-icon">🏢</div>
                <div>
                  <span>NGO PERFORMANCE</span>
                  <h3>NGO Analytics</h3>
                </div>
              </div>

              <div className="role-metrics">
                <Metric label="Registered NGOs" value={number(ngo.registered)} />
                <Metric label="Received Donations" value={number(ngo.donations)} />
                <Metric label="Food Received" value={kg(ngo.quantity)} />
                <Metric label="Food Distributed" value={kg(ngo.completedQuantity)} />
              </div>

              <div className="performer-heading">
                <strong>Top NGOs</strong>
                <span>By completed food distribution</span>
              </div>

              <PerformerList
                items={ngo.topPerformers || []}
                valueKey="completedQuantity"
                maxValue={maxNgo}
                empty="No NGO distribution in this period."
              />
            </section>
          </div>

          <div className="report-section-heading">
            <div>
              <span>DONATION TRENDS</span>
              <h2>Monthly & yearly performance</h2>
            </div>
          </div>

          <section className="report-panel chart-panel">
            <div className="chart-heading">
              <div>
                <h3>Monthly food donation trend</h3>
                <p>Food quantity recorded in each month of {year}</p>
              </div>
              <span className="chart-unit">KG</span>
            </div>

            <div className="monthly-chart">
              {monthly.map((item) => {
                const height = currencySafePercent(item.quantity, maxMonthly);

                return (
                  <div className="monthly-chart-column" key={item.month}>
                    <div className="monthly-chart-value">
                      {item.quantity > 0 ? number(item.quantity) : ""}
                    </div>

                    <div className="monthly-chart-track">
                      <div
                        className={`monthly-chart-bar ${
                          Number(month) === item.month ? "selected" : ""
                        }`}
                        style={{ height: `${Math.max(height, item.quantity ? 3 : 0)}%` }}
                        title={`${item.label}: ${kg(item.quantity)}`}
                      />
                    </div>

                    <span>{item.label}</span>
                    <small>{number(item.donations)} donations</small>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="report-panel chart-panel yearly-panel">
            <div className="chart-heading">
              <div>
                <h3>Yearly growth overview</h3>
                <p>Five-year comparison of food donation quantities</p>
              </div>
              <span className="chart-unit">KG</span>
            </div>

            <div className="yearly-chart">
              {yearly.map((item) => {
                const height = currencySafePercent(item.quantity, maxYearly);

                return (
                  <div className="yearly-chart-column" key={item.year}>
                    <strong>{number(item.quantity)}</strong>
                    <div className="yearly-chart-track">
                      <div
                        className="yearly-chart-bar"
                        style={{ height: `${Math.max(height, item.quantity ? 3 : 0)}%` }}
                      />
                    </div>
                    <span>{item.year}</span>
                    <small>{number(item.donations)} donations</small>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="report-bottom-grid">
            <section className="report-panel">
              <div className="chart-heading">
                <div>
                  <h3>Donation status breakdown</h3>
                  <p>Distribution of donation pipeline statuses</p>
                </div>
              </div>

              <div className="status-total">
                <strong>{number(totalStatus)}</strong>
                <span>Total records</span>
              </div>

              <div className="status-list">
                {statuses.map((item) => {
                  const percent = currencySafePercent(item.count, totalStatus);

                  return (
                    <div className="status-item" key={item.status}>
                      <div>
                        <span>{item.status}</span>
                        <strong>{number(item.count)} ({percent.toFixed(1)}%)</strong>
                      </div>
                      <div className="status-track">
                        <div
                          className={`status-fill status-${item.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="report-panel comparison-panel">
              <div className="chart-heading">
                <div>
                  <h3>Donor vs NGO comparison</h3>
                  <p>Food contribution and distribution</p>
                </div>
              </div>

              <ComparisonRow
                label="Donor contribution"
                value={overall.totalFoodDonated}
                max={Math.max(1, overall.totalFoodDonated, overall.totalFoodReceived)}
                color="donor"
              />

              <ComparisonRow
                label="NGO received food"
                value={overall.totalFoodReceived}
                max={Math.max(1, overall.totalFoodDonated, overall.totalFoodReceived)}
                color="ngo"
              />

              <ComparisonRow
                label="NGO distributed food"
                value={overall.totalFoodDistributed}
                max={Math.max(1, overall.totalFoodDonated, overall.totalFoodReceived)}
                color="distributed"
              />

              <div className="comparison-note">
                Donor contribution is based on created donations. NGO
                distribution is based on completed donations assigned to an NGO.
              </div>
            </section>
          </div>

          <div className="reports-footer">
            <span>FEEDLINK ANALYTICS</span>
            <span>Report period: {selectedPeriod}</span>
          </div>
        </>
      ) : null}
    </div>
  );
};

const KpiCard = ({ icon, label, value, note, color }) => (
  <div className={`report-kpi-card kpi-${color}`}>
    <div className="kpi-top">
      <span className="kpi-icon">{icon}</span>
      <span className="kpi-dot" />
    </div>
    <span className="kpi-label">{label}</span>
    <strong>{value}</strong>
    <small>{note}</small>
  </div>
);

const Metric = ({ label, value }) => (
  <div className="role-metric">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const PerformerList = ({ items, valueKey, maxValue, empty }) => {
  if (!items.length) {
    return <div className="performer-empty">{empty}</div>;
  }

  return (
    <div className="performer-list">
      {items.map((item, index) => (
        <div className="performer-item" key={item.id}>
          <div className="performer-rank">{index + 1}</div>

          <div className="performer-info">
            <strong>{item.name}</strong>
            <div className="performer-track">
              <div
                style={{
                  width: `${currencySafePercent(item[valueKey], maxValue)}%`,
                }}
              />
            </div>
          </div>

          <b>{kg(item[valueKey])}</b>
        </div>
      ))}
    </div>
  );
};

const ComparisonRow = ({ label, value, max, color }) => (
  <div className="comparison-row">
    <div>
      <span>{label}</span>
      <strong>{kg(value)}</strong>
    </div>
    <div className="comparison-track">
      <div
        className={`comparison-fill ${color}`}
        style={{ width: `${currencySafePercent(value, max)}%` }}
      />
    </div>
  </div>
);

export default Reports;
