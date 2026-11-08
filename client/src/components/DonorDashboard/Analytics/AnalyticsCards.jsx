import {
  ClipboardList,
  PackageCheck,
  CheckCircle2,
  Clock3,
  Target,
  Award,
  Weight,
  XCircle,
} from "lucide-react";

// =========================================
// NORMALIZE DONATION STATUS
// =========================================

const getDonationStatus = (donation) => {
  const pipeline = String(donation?.pipelineStatus || "")
    .trim()
    .toLowerCase();

  const legacy = String(donation?.status || "")
    .trim()
    .toLowerCase();

  // Prefer pipelineStatus when available.
  if (pipeline) {
    if (pipeline === "completed") return "completed";
    if (pipeline === "accepted") return "accepted";
    if (pipeline === "out for delivery") return "outForDelivery";
    if (pipeline === "pending") return "pending";
    if (pipeline === "rejected") return "rejected";
  }

  // Fallback to legacy status.
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

const AnalyticsCards = ({ donations = [], loading }) => {
  const total = donations.length;

  const totalQuantity = donations.reduce(
    (sum, donation) =>
      sum + Math.max(0, Number(donation.quantity) || 0),
    0
  );

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

  const completed = statusCounts.completed;
  const accepted = statusCounts.accepted;
  const pending = statusCounts.pending;
  const rejected = statusCounts.rejected;

  const completionRate = total
    ? ((completed / total) * 100).toFixed(1)
    : "0.0";

  // =========================================
  // TOP DONATED FOOD TYPE
  // =========================================

  const foodCounts = {};

  donations.forEach((donation) => {
    const type =
      typeof donation.foodType === "string" &&
      donation.foodType.trim()
        ? donation.foodType.trim()
        : "Other";

    const normalizedType = type.toLowerCase();

    if (!foodCounts[normalizedType]) {
      foodCounts[normalizedType] = {
        name: type,
        count: 0,
      };
    }

    foodCounts[normalizedType].count += 1;
  });

  const topFood = Object.values(foodCounts).sort(
    (a, b) => b.count - a.count
  )[0];

  const cards = [
    {
      title: "Total Donations",
      value: total.toLocaleString(),
      description: "All donations in selected date range",
      icon: ClipboardList,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Food Quantity",
      value: `${totalQuantity.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })} KG`,
      description: "Total donated food quantity",
      icon: Weight,
      iconBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Completed",
      value: completed.toLocaleString(),
      description: "Successfully completed donations",
      icon: PackageCheck,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Accepted",
      value: accepted.toLocaleString(),
      description: "Accepted by NGOs",
      icon: CheckCircle2,
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Pending",
      value: pending.toLocaleString(),
      description: "Awaiting NGO response",
      icon: Clock3,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Rejected",
      value: rejected.toLocaleString(),
      description: "Rejected donations",
      icon: XCircle,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="analytics-summary space-y-4 print:!space-y-2">

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 print:!grid-cols-3 print:!gap-2">
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
                    <div className="mt-2 h-7 w-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700 print:hidden" />
                  ) : (
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 print:!mt-1 print:!text-xl">
                      {card.value}
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

      {/* PERFORMANCE INSIGHTS */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:!grid-cols-2 print:!gap-2">

        {/* COMPLETION RATE */}

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

        {/* TOP DONATED FOOD */}

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
                Your most frequently donated food type
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 h-8 w-36 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700 print:hidden" />
          ) : topFood ? (
            <div className="mt-4 flex items-end justify-between gap-3 print:!mt-2">
              <h3 className="truncate text-2xl font-bold text-slate-1000 dark:text-slate-100 print:text-base">
                {topFood.name}
              </h3>

              <span className="shrink-0 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 print:!px-2 print:!py-1 print:text-[8px]">
                {topFood.count} donations
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