import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Rice Meal",
    value: 45,
  },
  {
    name: "Bakery",
    value: 20,
  },
  {
    name: "Fast Food",
    value: 15,
  },
  {
    name: "Vegetable",
    value: 12,
  },
  {
    name: "Dessert",
    value: 8,
  },
];

const COLORS = [
  "#16a34a",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
];

const FoodTypeChart = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-800">
          Food Type Distribution
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Most donated food categories
        </p>

      </div>

      <div className="h-96">

        <ResponsiveContainer width="100%" height="100%">

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
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default FoodTypeChart;