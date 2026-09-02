import {
  ClipboardList,
  UtensilsCrossed,
  CheckCircle,
  Clock3,
} from "lucide-react";

const AnalyticsCards = ({
  donations = [],
  loading,
}) => {
  const totalDonations = donations.length;

  const totalMeals = donations.reduce(
    (total, donation) =>
      total + Number(donation.estimatedMeals || 0),
    0
  );

  const accepted = donations.filter(
    (donation) =>
      donation.status === "NGO Accepted"
  ).length;

  const pending = donations.filter(
    (donation) =>
      donation.status ===
      "Waiting for NGO Acceptance"
  ).length;

  const cards = [
    {
      title: "Total Donations",
      value: totalDonations,
      icon: ClipboardList,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Total Meals",
      value: totalMeals.toLocaleString(),
      icon: UtensilsCrossed,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Accepted",
      value: accepted,
      icon: CheckCircle,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <p className="text-sm text-gray-400">
              Loading...
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-600 sm:text-sm">
                  {card.title}
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-gray-900 sm:mt-2 sm:text-3xl">
                  {card.value}
                </h2>
              </div>

              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.bg} sm:h-14 sm:w-14`}
              >
                <Icon
                  className={card.color}
                  size={18}
                />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsCards;