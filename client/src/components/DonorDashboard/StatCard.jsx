import {
  UtensilsCrossed,
  Soup,
  Star,
  Leaf,
  TrendingUp,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  color,
  change,
}) => {
  const getIcon = () => {
    switch (title) {
      case "Total Donations":
        return <UtensilsCrossed size={28} className="text-white" />;

      case "Meals Served":
        return <Soup size={28} className="text-white" />;

      case "Restaurant Rating":
        return <Star size={28} className="text-white fill-white" />;

      case "Carbon Prevented":
        return <Leaf size={28} className="text-white" />;

      default:
        return <TrendingUp size={28} className="text-white" />;
    }
  };

  return (
    <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

      {/* Top */}

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-800">
            {value}
          </h2>

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} shadow-lg transition group-hover:scale-110`}
        >
          {getIcon()}
        </div>

      </div>

      {/* Bottom */}

      <div className="mt-6 flex items-center justify-between">

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          {change}
        </span>

        <span className="text-xs text-gray-400">
          Updated just now
        </span>

      </div>

    </div>
  );
};

export default StatCard;