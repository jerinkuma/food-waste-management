
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Package,
  Weight,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec",
];

const METRICS = [
  {
    key: "donations",
    label: "Donations",
    unit: "donations",
    icon: Package,
    color: "#10B981",
  },
  {
    key: "quantity",
    label: "Food Quantity",
    unit: "KG",
    icon: Weight,
    color: "#6366F1",
  },
  {
    key: "completed",
    label: "Completed",
    unit: "donations",
    icon: CheckCircle2,
    color: "#F59E0B",
  },
];

// 2026 DEMO DATA
const DEMO_MONTHLY_DATA = [
  { month: "Jan", donations: 8, quantity: 45, completed: 6 },
  { month: "Feb", donations: 12, quantity: 68, completed: 9 },
  { month: "Mar", donations: 10, quantity: 54, completed: 8 },
  { month: "Apr", donations: 15, quantity: 82, completed: 12 },
  { month: "May", donations: 18, quantity: 95, completed: 15 },
  { month: "Jun", donations: 14, quantity: 76, completed: 11 },
  { month: "Jul", donations: 20, quantity: 110, completed: 17 },
  { month: "Aug", donations: 17, quantity: 92, completed: 14 },
  { month: "Sep", donations: 23, quantity: 128, completed: 20 },
];

// 2025 DEMO DATA
const DEMO_2025_MONTHLY_DATA = [
  { month: "Jan", donations: 6, quantity: 32, completed: 5 },
  { month: "Feb", donations: 9, quantity: 48, completed: 7 },
  { month: "Mar", donations: 11, quantity: 59, completed: 9 },
  { month: "Apr", donations: 13, quantity: 71, completed: 10 },
  { month: "May", donations: 16, quantity: 86, completed: 13 },
  { month: "Jun", donations: 12, quantity: 64, completed: 10 },
  { month: "Jul", donations: 15, quantity: 80, completed: 12 },
  { month: "Aug", donations: 19, quantity: 101, completed: 16 },
  { month: "Sep", donations: 21, quantity: 115, completed: 18 },
  { month: "Oct", donations: 18, quantity: 96, completed: 15 },
  { month: "Nov", donations: 22, quantity: 120, completed: 19 },
  { month: "Dec", donations: 25, quantity: 140, completed: 22 },
];

// HELPERS
const isCompleted = (donation) => {
  const pipeline = String(donation?.pipelineStatus || "")
    .trim()
    .toLowerCase();

  const legacy = String(donation?.status || "")
    .trim()
    .toLowerCase();

  if (pipeline) {
    return pipeline === "completed";
  }

  return (
    legacy === "completed" ||
    legacy === "food picked up"
  );
};

const getDonationStats = (items) => ({
  donations: items.length,

  quantity: items.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.quantity) || 0),
    0
  ),

  completed: items.filter(isCompleted).length,
});

const MonthlyChart = ({
  donations = [],
  loading,
  selectedYear = new Date().getFullYear(),
}) => {
  const [selectedMetric, setSelectedMetric] =
    useState("donations");

  const [showComparison, setShowComparison] =
    useState(true);

  const previousYear = selectedYear - 1;

  // MONTHLY DATA GENERATION
  const monthlyData = useMemo(() => {
    const actualDonations = Array.isArray(donations)
      ? donations
      : [];

    const actualYearData = MONTHS.map((month, index) => {
      const items = actualDonations.filter((donation) => {
        if (!donation?.createdAt) return false;

        const date = new Date(donation.createdAt);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === selectedYear &&
          date.getMonth() === index
        );
      });

      return {
        month,
        ...getDonationStats(items),
      };
    });

    const previousYearData = MONTHS.map((month, index) => {
      const items = actualDonations.filter((donation) => {
        if (!donation?.createdAt) return false;

        const date = new Date(donation.createdAt);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === previousYear &&
          date.getMonth() === index
        );
      });

      return {
        month,
        ...getDonationStats(items),
      };
    });

    return actualYearData.map((actual, index) => {
      const currentDemo =
        selectedYear === 2025
          ? DEMO_2025_MONTHLY_DATA[index]
          : DEMO_MONTHLY_DATA[index];

      const previousDemo = DEMO_2025_MONTHLY_DATA[index];

      const useCurrentDemo =
        selectedYear === 2025 &&
        actual.donations === 0;

      const use2026Demo =
        selectedYear === 2026 &&
        index < 9 &&
        actual.donations === 0;

      const previousActual = previousYearData[index];

      const usePreviousDemo =
        selectedYear === 2026 &&
        previousActual.donations === 0;

      const current =
        useCurrentDemo || use2026Demo
          ? currentDemo
          : actual;

      const previous = usePreviousDemo
        ? previousDemo
        : previousActual;

      return {
        month: actual.month,

        currentDonations: current.donations,
        currentQuantity: Number(current.quantity.toFixed(2)),
        currentCompleted: current.completed,

        previousDonations: previous.donations,
        previousQuantity: Number(previous.quantity.toFixed(2)),
        previousCompleted: previous.completed,

        isDemo: useCurrentDemo || use2026Demo,
        previousIsDemo: usePreviousDemo,
      };
    });
  }, [donations, selectedYear, previousYear]);

  // ACTUAL YEARLY TOTALS
  const yearlyStats = useMemo(() => {
    const actualDonations = Array.isArray(donations)
      ? donations
      : [];

    const currentYearDonations = actualDonations.filter(
      (donation) => {
        const date = new Date(donation?.createdAt);

        return (
          donation?.createdAt &&
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === selectedYear
        );
      }
    );

    const previousYearDonations = actualDonations.filter(
      (donation) => {
        const date = new Date(donation?.createdAt);

        return (
          donation?.createdAt &&
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === previousYear
        );
      }
    );

    return {
      current: getDonationStats(currentYearDonations),
      previous: getDonationStats(previousYearDonations),
    };
  }, [donations, selectedYear, previousYear]);

  const activeMetric = METRICS.find(
    (metric) => metric.key === selectedMetric
  );

  const currentKey = `current${
    selectedMetric.charAt(0).toUpperCase() +
    selectedMetric.slice(1)
  }`;

  const previousKey = `previous${
    selectedMetric.charAt(0).toUpperCase() +
    selectedMetric.slice(1)
  }`;

  const currentTotal = yearlyStats.current[selectedMetric];
  const previousTotal = yearlyStats.previous[selectedMetric];

  const demoMonthCount = monthlyData.filter(
    (item) => item.isDemo || item.previousIsDemo
  ).length;

  // CUSTOM TOOLTIP
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const monthData = payload[0]?.payload;

    return (
      <div className="min-w-[210px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-600 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            {label}
          </p>

          {(monthData?.isDemo || monthData?.previousIsDemo) && (
            <span className="rounded-md bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              DEMO DATA
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {selectedYear}
              {monthData?.isDemo && (
                <span className="text-[9px] font-bold text-amber-600">
                  DEMO
                </span>
              )}
            </span>

            <strong className="text-sm text-slate-800 dark:text-white">
              {Number(
                monthData?.[currentKey] || 0
              ).toLocaleString()}{" "}
              {activeMetric.unit}
            </strong>
          </div>

          {showComparison && (
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                {previousYear}
                {monthData?.previousIsDemo && (
                  <span className="text-[9px] font-bold text-amber-600">
                    DEMO
                  </span>
                )}
              </span>

              <strong className="text-sm text-slate-700 dark:text-slate-200">
                {Number(
                  monthData?.[previousKey] || 0
                ).toLocaleString()}{" "}
                {activeMetric.unit}
              </strong>
            </div>
          )}

          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-700">
            {selectedYear} donations: {monthData.currentDonations}
            <br />
            {selectedYear} quantity: {monthData.currentQuantity} KG
            <br />
            {selectedYear} completed: {monthData.currentCompleted}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="monthly-chart-card rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5 print:!border-slate-200 print:!bg-white print:p-3 print:shadow-none">

      {/* HEADER */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 print:mb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 print:hidden">
              <TrendingUp
                size={17}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <h3 className="text-base font-bold text-slate-1000 dark:text-slate-100 sm:text-lg print:text-sm">
              Monthly Donation Analytics
            </h3>
          </div>

          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            Monthly performance and yearly comparison
          </p>
        </div>

        <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-500/10 print:px-2 print:py-1">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {selectedYear} Actual Total
          </p>

          <p className="mt-0.5 text-base font-bold text-slate-800 dark:text-white">
            {loading
              ? "—"
              : `${Number(currentTotal.toFixed(2)).toLocaleString()} ${activeMetric.unit}`}
          </p>
        </div>
      </div>

      {/* METRIC SELECTOR */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex flex-wrap gap-2">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            const active = selectedMetric === metric.key;

            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => setSelectedMetric(metric.key)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
              >
                <Icon size={13} />
                {metric.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowComparison((prev) => !prev)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
            showComparison
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {showComparison ? "Hide" : "Show"} Year Comparison
        </button>
      </div>

      {/* COMPACT YEAR COMPARISON SUMMARY */}
      {!loading && (
        <div className="mb-3 grid grid-cols-2 gap-2 print:mb-2">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <p className="text-[10px] font-medium leading-tight text-slate-500 dark:text-slate-400">
              {selectedYear} Actual Database Records
            </p>

            <p className="mt-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {Number(currentTotal.toFixed(2)).toLocaleString()}
              <span className="ml-1 text-[10px] font-medium">
                {activeMetric.unit}
              </span>
            </p>
          </div>

          <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 px-2.5 py-2 dark:border-indigo-500/20 dark:bg-indigo-500/5">
            <p className="text-[10px] font-medium leading-tight text-slate-500 dark:text-slate-400">
              {previousYear} Actual Database Records
            </p>

            <p className="mt-0.5 text-lg font-bold text-indigo-700 dark:text-indigo-400">
              {Number(previousTotal.toFixed(2)).toLocaleString()}
              <span className="ml-1 text-[10px] font-medium">
                {activeMetric.unit}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* DEMO DATA NOTICE */}
      {!loading && demoMonthCount > 0 && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/5 print:hidden">
          <FlaskConical
            size={14}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <p className="text-[10px] leading-relaxed text-amber-800 dark:text-amber-300">
            Some months contain illustrative demo values where
            actual donation records are unavailable. Demo values
            are not stored in the database.
          </p>
        </div>
      )}

      {/* MONTHLY GRAPH */}
      <div className="h-[250px] w-full sm:h-[280px] print:!h-[145px]">
        {loading ? (
          <div className="flex h-full items-end justify-around gap-3 pb-8">
            {[35, 65, 45, 80, 55, 70, 40, 90, 60, 75, 45, 65].map(
              (height, index) => (
                <div
                  key={index}
                  style={{ height: `${height}%` }}
                  className="w-full animate-pulse rounded-t-lg bg-slate-100 dark:bg-slate-700"
                />
              )
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              barCategoryGap="22%"
              barGap={4}
            >
              <CartesianGrid
                vertical={false}
                stroke="#64748B"
                strokeOpacity={0.2}
                strokeDasharray="4 5"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                dy={8}
              />

              <YAxis
                allowDecimals={selectedMetric === "quantity"}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                width={42}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "#10B981",
                  fillOpacity: 0.07,
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "11px",
                  paddingBottom: "10px",
                }}
              />

              <Bar
                dataKey={currentKey}
                name={String(selectedYear)}
                fill={activeMetric.color}
                radius={[5, 5, 0, 0]}
                maxBarSize={showComparison ? 18 : 30}
                animationDuration={900}
              />

              {showComparison && (
                <Bar
                  dataKey={previousKey}
                  name={String(previousYear)}
                  fill="#818CF8"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={18}
                  animationDuration={1100}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && currentTotal === 0 && previousTotal === 0 && (
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
          No donation records found for {selectedYear} or {previousYear}.
        </p>
      )}

      <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
        * Demo values are illustrative and are not actual historical
        donation records. Actual values are calculated from database
        donation creation dates.
      </p>
    </div>
  );
};

export default MonthlyChart;
