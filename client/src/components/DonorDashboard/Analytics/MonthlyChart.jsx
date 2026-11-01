import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

const MonthlyChart = ({
  donations = [],
  loading,
  selectedYear = new Date().getFullYear(),
}) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyData = months.map((month, index) => {
    const count = donations.filter((donation) => {
      if (!donation.createdAt) return false;
      const date = new Date(donation.createdAt);

      return (
        !isNaN(date.getTime()) &&
        date.getFullYear() === selectedYear &&
        date.getMonth() === index
      );
    }).length;

    return { month, donations: count };
  });

  const yearlyTotal = monthlyData.reduce(
    (sum, item) => sum + item.donations,
    0
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-600 dark:bg-slate-900">
        <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {payload[0].value}
          <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            donations
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="monthly-chart-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-6 print:!border-slate-200 print:!bg-white print:p-3 print:shadow-none">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3 print:mb-2 print:gap-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 print:hidden">
              <TrendingUp size={19} className="text-emerald-600 dark:text-emerald-400" />
            </div>

            <h3 className="text-base font-bold text-slate-1000 dark:text-slate-100 sm:text-lg print:text-sm">
              Monthly Donations
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 print:mt-0 print:text-[9px]">
            Donation activity throughout {selectedYear}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700/60 print:px-2 print:py-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-300 print:text-[8px]">
            Yearly Total
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-800 dark:text-slate-100 print:text-sm">
            {loading ? "—" : yearlyTotal}
          </p>
        </div>
      </div>

      <div className="h-[280px] w-full sm:h-[310px] print:!h-[145px]">
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
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              barCategoryGap="32%"
            >
              <CartesianGrid
                vertical={false}
                stroke="#64748B"
                strokeOpacity={0.3}
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                dy={5}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 9 }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "#10B981",
                  fillOpacity: 0.10,
                }}
              />

              <Bar
                dataKey="donations"
                fill="#10B981"
                radius={[5, 5, 0, 0]}
                maxBarSize={25}
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && yearlyTotal === 0 && (
        <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500 print:text-[9px]">
          No donations recorded for {selectedYear}.
        </p>
      )}
    </div>
  );
};

export default MonthlyChart;