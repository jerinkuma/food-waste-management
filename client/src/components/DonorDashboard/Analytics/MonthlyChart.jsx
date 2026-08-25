import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", donations: 8 },
  { month: "Feb", donations: 12 },
  { month: "Mar", donations: 10 },
  { month: "Apr", donations: 15 },
  { month: "May", donations: 18 },
  { month: "Jun", donations: 13 },
];

const MonthlyChart = () => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-800">
          Monthly Donations
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Number of donations made each month
        </p>

      </div>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="donations"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default MonthlyChart;