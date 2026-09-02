import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#facc15",
  "#ef4444",
];

const StatusChart = ({
  donations = [],
  loading,
}) => {
  const accepted = donations.filter(
    (donation) =>
      donation.status === "NGO Accepted"
  ).length;

  const pending = donations.filter(
    (donation) =>
      donation.status ===
      "Waiting for NGO Acceptance"
  ).length;

  const rejected = donations.filter(
    (donation) =>
      donation.status === "Rejected"
  ).length;

  const data = [
    {
      name: "Accepted",
      value: accepted,
    },
    {
      name: "Pending",
      value: pending,
    },
    {
      name: "Rejected",
      value: rejected,
    },
  ];

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

        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            Loading chart...
          </div>
        ) : donations.length === 0 ? (
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
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
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

              <Legend
                verticalAlign="bottom"
              />

            </PieChart>
          </ResponsiveContainer>
        )}

      </div>
    </div>
  );
};

export default StatusChart;