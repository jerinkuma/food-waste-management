
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const STATUS_CONFIG = [
  { name: "Completed", key: "completed", color: "#10B981" },
  { name: "Accepted", key: "accepted", color: "#6366F1" },
  {
    name: "Out for Delivery",
    key: "outForDelivery",
    color: "#0EA5E9",
  },
  { name: "Pending", key: "pending", color: "#F59E0B" },
  { name: "Rejected", key: "rejected", color: "#EF4444" },
];

const getDonationStatus = (donation) => {
  const pipeline = String(donation?.pipelineStatus || "")
    .trim()
    .toLowerCase();

  const legacy = String(donation?.status || "")
    .trim()
    .toLowerCase();

  if (pipeline) {
    if (pipeline === "completed") return "completed";
    if (pipeline === "accepted") return "accepted";
    if (pipeline === "out for delivery") return "outForDelivery";
    if (pipeline === "pending") return "pending";
    if (pipeline === "rejected") return "rejected";
  }

  if (legacy === "food picked up" || legacy === "completed") {
    return "completed";
  }

  if (
    legacy === "ngo accepted" ||
    legacy === "ngo requested" ||
    legacy === "accepted"
  ) {
    return "accepted";
  }

  if (legacy === "out for delivery") {
    return "outForDelivery";
  }

  if (
    legacy === "waiting for ngo acceptance" ||
    legacy === "pending"
  ) {
    return "pending";
  }

  if (legacy === "rejected") {
    return "rejected";
  }

  return "pending";
};

const StatusChart = ({ donations = [], loading }) => {
  const statusCounts = {
    completed: 0,
    accepted: 0,
    outForDelivery: 0,
    pending: 0,
    rejected: 0,
  };

  donations.forEach((donation) => {
    const status = getDonationStatus(donation);
    statusCounts[status] += 1;
  });

  const data = STATUS_CONFIG.map((status) => ({
    name: status.name,
    value: statusCounts[status.key],
    color: status.color,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload;

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-600 dark:bg-slate-900">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {item.name}
        </p>

        <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
          {item.value} donations
        </p>
      </div>
    );
  };

  return (
    <div className="status-chart-card flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5 print:!border-slate-200 print:!bg-white print:p-3 print:shadow-none">

      {/* HEADER */}

      <div className="mb-3 shrink-0 print:mb-2">
        <h3 className="text-base font-bold text-slate-1000 dark:text-slate-100 sm:text-lg print:text-sm">
          Donation Status
        </h3>

        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 print:mt-0 print:text-[9px]">
          Distribution of your donation statuses
        </p>
      </div>

      {/* LOADING */}

      {loading ? (
        <div className="flex min-h-[230px] flex-1 items-center justify-center print:min-h-0 print:h-[145px]">
          <div className="h-28 w-28 animate-pulse rounded-full border-[18px] border-slate-100 dark:border-slate-700" />
        </div>
      ) : total === 0 ? (
        /* EMPTY STATE */

        <div className="flex min-h-[230px] flex-1 flex-col items-center justify-center text-center print:min-h-0 print:h-[145px]">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No donation data available
          </p>
        </div>
      ) : (
        /* CHART AND STATUS BREAKDOWN */

        <div className="grid flex-1 grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-2 print:!grid-cols-[150px_minmax(0,1fr)] print:!gap-2">

          {/* DONUT CHART */}

          <div className="relative mx-auto h-[210px] w-full max-w-[240px] min-w-0 sm:h-[220px] print:!h-[140px] print:!max-w-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="78%"
                  paddingAngle={3}
                  stroke="none"
                  animationDuration={900}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* CENTER TOTAL */}

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-1000 dark:text-slate-100 print:text-lg">
                {total}
              </span>

              <span className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 print:text-[8px]">
                Total
              </span>
            </div>
          </div>

          {/* STATUS BREAKDOWN */}

          <div className="grid w-full min-w-0 grid-cols-2 content-center gap-x-4 gap-y-3 sm:grid-cols-1 sm:gap-y-3 print:!grid-cols-1 print:!gap-y-1">
            {data.map((item) => {
              const percentage = total
                ? ((item.value / total) * 100).toFixed(1)
                : "0.0";

              return (
                <div key={item.name} className="flex min-w-0 items-start gap-2">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full print:h-2 print:w-2"
                    style={{ backgroundColor: item.color }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400 print:text-[9px]">
                        {item.name}
                      </p>

                      <p className="shrink-0 text-sm font-bold text-slate-800 dark:text-slate-100 print:text-[9px]">
                        {item.value}
                      </p>
                    </div>

                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 print:mt-0.5 print:h-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: item.color,
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
