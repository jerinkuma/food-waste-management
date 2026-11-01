import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#10B981",
  "#6366F1",
  "#F59E0B",
  "#EF4444",
];

const StatusChart = ({ donations = [], loading }) => {
  const completed = donations.filter(
    (d) =>
      d.status === "Food Picked Up" ||
      d.pipelineStatus === "Completed"
  ).length;

  const accepted = donations.filter(
    (d) =>
      d.status === "NGO Accepted" ||
      d.status === "NGO Requested" ||
      d.pipelineStatus === "Accepted"
  ).length;

  const pending = donations.filter(
    (d) =>
      d.status === "Waiting for NGO Acceptance" &&
      d.pipelineStatus !== "Accepted"
  ).length;

  const rejected = donations.filter(
    (d) =>
      d.status === "Rejected" ||
      d.pipelineStatus === "Rejected"
  ).length;

  const data = [
    { name: "Completed", value: completed },
    { name: "Accepted", value: accepted },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-600 dark:bg-slate-900">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {payload[0].name}
        </p>
        <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
          {payload[0].value} donations
        </p>
      </div>
    );
  };

  return (
    <div className="status-chart-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6 print:!border-slate-200 print:!bg-white print:p-3 print:shadow-none">
      <div className="mb-6 print:mb-2">
        <h3 className="text-base font-bold text-slate-1000 dark:text-slate-100 sm:text-lg print:text-sm">
          Donation Status
        </h3>
        <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 print:mt-0 print:text-[9px]">
          Distribution of your donation statuses
        </p>
      </div>

      {loading ? (
        <div className="flex h-[280px] items-center justify-center print:h-[145px]">
          <div className="h-32 w-32 animate-pulse rounded-full border-[18px] border-slate-100 dark:border-slate-700" />
        </div>
      ) : donations.length === 0 ? (
        <div className="flex h-[280px] flex-col items-center justify-center text-center print:h-[145px]">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No donation data available
          </p>
        </div>
      ) : (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 sm:flex-row sm:gap-2 print:!min-h-0 print:!flex-row print:!gap-2">
          <div className="relative h-[240px] w-full max-w-[270px] shrink-0 print:!h-[140px] print:!max-w-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={3}
                  stroke="none"
                  animationDuration={900}
                >
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-1000 dark:text-slate-100 print:text-lg">
                {total}
              </span>
              <span className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 print:text-[8px]">
                Total
              </span>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-1 sm:gap-y-4 print:!grid-cols-1 print:!gap-y-1">
            {data.map((item, index) => {
              const percentage = total
                ? ((item.value / total) * 100).toFixed(1)
                : "0.0";

              return (
                <div key={item.name} className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full print:h-2 print:w-2"
                    style={{ backgroundColor: COLORS[index] }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 print:text-[9px]">
                        {item.name}
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 print:text-[9px]">
                        {item.value}
                      </p>
                    </div>

                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 print:mt-0.5 print:h-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index],
                        }}
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 print:hidden">
                      {percentage}% of total
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusChart;