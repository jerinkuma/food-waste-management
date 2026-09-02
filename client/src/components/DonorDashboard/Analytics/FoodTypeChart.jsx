import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#16a34a",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

const FoodTypeChart = ({
  donations = [],
  loading,
}) => {
  const foodTypeCounts = {};

  donations.forEach((donation) => {
    const type =
      donation.foodType?.trim() ||
      "Other";

    foodTypeCounts[type] =
      (foodTypeCounts[type] || 0) + 1;
  });

  const data = Object.entries(
    foodTypeCounts
  ).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Food Type Distribution
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Most donated food types
        </p>
      </div>

      <div className="h-96">

        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            No donation data available.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index % COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  );
};

export default FoodTypeChart;