import {
  ClipboardList,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";

const HistoryStats = () => {
  const stats = [
    {
      title: "Total Donations",
      value: 25,
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Completed",
      value: 18,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Pending",
      value: 5,
      icon: Clock3,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Cancelled",
      value: 2,
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {item.value}
                </h2>

              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${item.color}`}
              >
                <Icon size={28} />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryStats;