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
    name: "Completed",
    value: 18,
  },
  {
    name: "Pending",
    value: 5,
  },
  {
    name: "Accepted",
    value: 4,
  },
  {
    name: "Picked Up",
    value: 3,
  },
  {
    name: "Cancelled",
    value: 2,
  },
];

const COLORS = [
  "#22c55e",
  "#facc15",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
];

const StatusChart = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-800">
          Donation Status
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current donation status distribution
        </p>

      </div>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
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

            <Legend verticalAlign="bottom" />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default StatusChart;