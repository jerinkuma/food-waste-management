import {
  ClipboardList,
  PackageCheck,
  CheckCircle2,
  Clock3,
  Target,
  Award,
} from "lucide-react";

const AnalyticsCards = ({ donations = [], loading }) => {
  const total = donations.length;

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

  const completionRate = total
    ? Math.min((completed / total) * 100, 100).toFixed(1)
    : "0.0";

  const foodCounts = {};

  donations.forEach((d) => {
    const type =
      typeof d.foodType === "string" && d.foodType.trim()
        ? d.foodType.trim()
        : "Other";

    foodCounts[type] = (foodCounts[type] || 0) + 1;
  });

  const topFood = Object.entries(foodCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const cards = [
    {
      title: "Total Donations",
      value: total,
      description: "All donations created",
      icon: ClipboardList,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Completed",
      value: completed,
      description: "Successfully completed",
      icon: PackageCheck,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Accepted",
      value: accepted,
      description: "Accepted by NGOs",
      icon: CheckCircle2,
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Pending",
      value: pending,
      description: "Awaiting NGO response",
      icon: Clock3,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="analytics-summary space-y-4 print:!space-y-2">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:!grid-cols-4 print:!gap-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-500/40 sm:p-6 print:!rounded-lg print:!border-slate-200 print:!bg-white print:!p-2 print:!shadow-none"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 print:text-[9px]">
                    {card.title}
                  </p>

                  {loading ? (
                    <div className="mt-2 h-7 w-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700 print:hidden" />
                  ) : (
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 print:!mt-1 print:!text-xl">
                      {card.value.toLocaleString()}
                    </h3>
                  )}
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg} transition-transform duration-300 group-hover:scale-105 print:!h-7 print:!w-7 print:!rounded-md`}
                >
                  <Icon
                    size={22}
                    className={`${card.iconColor} print:!h-4 print:!w-4`}
                  />
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700 print:!mt-2 print:!pt-1">
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 print:text-[8px]">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:!grid-cols-2 print:!gap-2">
        {/* Completion Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6 print:!rounded-lg print:!border-slate-200 print:!bg-white print:!p-2 print:!shadow-none">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3 print:!gap-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 print:!h-7 print:!w-7">
                <Target
                  size={21}
                  className="text-emerald-600 dark:text-emerald-400 print:!h-4 print:!w-4"
                />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-1000 dark:text-slate-100 print:text-[10px]">
                  Completion Rate
                </h3>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 print:text-[8px]">
                  Completed donations percentage
                </p>
              </div>
            </div>

            <span className="shrink-0 text-2xl font-bold text-emerald-600 dark:text-emerald-400 print:text-base">
              {loading ? "—" : `${completionRate}%`}
            </span>
          </div>

          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 print:!mt-2 print:!h-1.5">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{
                width: loading ? "0%" : `${completionRate}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400 dark:text-slate-500 print:!mt-1 print:text-[8px]">
            <span>
              {loading ? "Loading..." : `${completed} completed`}
            </span>
            <span>
              {loading ? "—" : `${total} total donations`}
            </span>
          </div>
        </div>

        {/* Top Donated Food */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6 print:!rounded-lg print:!border-slate-200 print:!bg-white print:!p-2 print:!shadow-none">
          <div className="flex items-center gap-3 print:!gap-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 print:!h-7 print:!w-7">
              <Award
                size={21}
                className="text-amber-600 dark:text-amber-400 print:!h-4 print:!w-4"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-1000 dark:text-slate-100 print:text-[10px]">
                Top Donated Food
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 print:text-[8px]">
                Your most frequently donated category
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 h-8 w-36 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700 print:hidden" />
          ) : topFood ? (
            <div className="mt-4 flex items-end justify-between gap-3 print:!mt-2">
              <h3 className="truncate text-2xl font-bold text-slate-1000 dark:text-slate-100 print:text-base">
                {topFood[0]}
              </h3>

              <span className="shrink-0 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 print:!px-2 print:!py-1 print:text-[8px]">
                {topFood[1]} donations
              </span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 print:!mt-2 print:text-[9px]">
              No food category data available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCards;