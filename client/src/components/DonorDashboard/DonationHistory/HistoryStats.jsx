import {
  ClipboardList,
  CheckCircle,
  Clock3,
  XCircle,
} from "lucide-react";

const HistoryStats = ({ donations = [] }) => {
  const total = donations.length;

  const accepted = donations.filter(
    (donation) => donation.status === "NGO Accepted"
  ).length;

  const pending = donations.filter(
    (donation) =>
      donation.status === "Waiting for NGO Acceptance"
  ).length;

  const rejected = donations.filter(
    (donation) => donation.status === "Rejected"
  ).length;

  const stats = [
    {
      title: "Total Donations",
      value: total,
      icon: ClipboardList,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Accepted",
      value: accepted,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-gray-600 sm:text-sm">
                  {item.title}
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-700 sm:mt-2 sm:text-3xl">
                  {item.value}
                </h2>
              </div>

              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.color} sm:h-8 sm:w-8`}
              >
                <Icon
                  size={10}
                  className="sm:h-5 sm:w-5"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryStats;