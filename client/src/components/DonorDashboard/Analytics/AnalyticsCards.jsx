import {
  ClipboardList,
  UtensilsCrossed,
  CheckCircle,
  Clock3,
} from "lucide-react";

const AnalyticsCards = () => {
  const cards = [
    {
      title: "Total Donations",
      value: "25",
      icon: ClipboardList,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Total Meals",
      value: "1,850",
      icon: UtensilsCrossed,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Completed",
      value: "18",
      icon: CheckCircle,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    },
    {
      title: "Pending",
      value: "5",
      icon: Clock3,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </h2>

              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg}`}
              >
                <Icon className={card.color} size={28} />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsCards;