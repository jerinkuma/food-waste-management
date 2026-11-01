import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
];

const FoodTypeChart = ({ donations = [], loading }) => {
  const foodTypeCounts = {};

  donations.forEach((donation) => {
    const type = donation.foodType?.trim() || "Other";
    foodTypeCounts[type] = (foodTypeCounts[type] || 0) + 1;
  });

  const data = Object.entries(foodTypeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

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
    <div className="food-chart-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6 print:!border-slate-200 print:!bg-white print:p-3 print:shadow-none">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 print:mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-1000 dark:text-slate-100 sm:text-lg print:text-sm">
            Food Type Distribution
          </h3>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 print:mt-0 print:text-[9px]">
            Explore which food categories you donate most
          </p>
        </div>

        {!loading && data.length > 0 && (
          <div className="rounded-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10 print:px-2 print:py-1">
            <p className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 print:text-[8px]">
              Food Categories
            </p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 print:text-sm">
              {data.length}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-[300px] items-center justify-center print:h-[145px]">
          <div className="h-32 w-32 animate-pulse rounded-full border-[18px] border-slate-100 dark:border-slate-700" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center print:h-[145px]">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No food category data
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 print:!grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] print:!gap-3">
          <div className="relative mx-auto h-[280px] w-full max-w-[340px] print:!h-[150px] print:!max-w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={3}
                  stroke="none"
                  animationDuration={900}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 print:text-lg">
                {total}
              </span>
              <span className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500 print:text-[8px]">
                Total Donations
              </span>
            </div>
          </div>

          <div className="space-y-4 print:!space-y-1">
            <div className="print:hidden">
              <h4 className="text-sm font-bold text-slate-1000 dark:text-slate-200">
                Category Breakdown
              </h4>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Donation count by food type
              </p>
            </div>

            <div className="max-h-[250px] space-y-4 overflow-y-auto pr-2 print:!max-h-none print:!space-y-1 print:!overflow-visible print:!pr-0">
              {data.map((item, index) => {
                const percentage = total
                  ? ((item.value / total) * 100).toFixed(1)
                  : "0.0";

                const color = COLORS[index % COLORS.length];

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex items-center justify-between gap-3 print:!mb-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full print:h-2 print:w-2"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate text-sm font-medium text-slate-600 dark:text-slate-300 print:text-[9px]">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 print:text-[9px]">
                          {item.value}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 print:text-[8px]">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 print:h-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodTypeChart;