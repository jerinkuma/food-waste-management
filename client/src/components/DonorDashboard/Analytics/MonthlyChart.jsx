import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const MonthlyChart = ({
  donations = [],
  loading,
}) => {
  const currentYear =
    new Date().getFullYear();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = months.map(
    (month, index) => {
      const count = donations.filter(
        (donation) => {
          if (!donation.createdAt) {
            return false;
          }

          const date = new Date(
            donation.createdAt
          );

          return (
            date.getFullYear() ===
              currentYear &&
            date.getMonth() === index
          );
        }
      ).length;

      return {
        month,
        donations: count,
      };
    }
  );

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

        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={monthlyData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="donations"
                fill="#16a34a"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  );
};

export default MonthlyChart;