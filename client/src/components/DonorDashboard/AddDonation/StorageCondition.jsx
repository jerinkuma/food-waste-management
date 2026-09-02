
import { Snowflake, Flame, Package, Leaf, Drumstick } from "lucide-react";

const FoodCondition = ({ donationData, updateDonationData }) => {
  const conditions = [
    { title: "Fresh", icon: Leaf, color: "text-green-600" },
    { title: "Hot", icon: Flame, color: "text-red-500" },
    { title: "Cold", icon: Snowflake, color: "text-blue-500" },
    { title: "Packed", icon: Package, color: "text-yellow-500" },
  ];

  const categories = [
    {
      title: "Vegetarian",
      icon: Leaf,
      color: "text-emerald-600",
    },
    {
      title: "Non-Vegetarian",
      icon: Drumstick,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-800">
          Food Condition
        </h2>

        <p className="mt-2 text-gray-500">
          Select the current condition and category of the donated food.
        </p>
      </div>

      {/* Condition */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Condition
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {conditions.map((item) => {
            const Icon = item.icon;

            const isSelected =
              donationData.condition === item.title;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() =>
                  updateDonationData("condition", item.title)
                }
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition duration-200 ${
                  isSelected
                    ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                <Icon
                  size={19}
                  className={
                    isSelected ? "text-green-600" : item.color
                  }
                />

                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Food Category */}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Food Category
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((item) => {
            const Icon = item.icon;

            const isSelected =
              donationData.foodCategory === item.title;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() =>
                  updateDonationData(
                    "foodCategory",
                    item.title
                  )
                }
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition duration-200 ${
                  isSelected
                    ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50"
                }`}
              >
                <Icon
                  size={19}
                  className={
                    isSelected ? "text-green-600" : item.color
                  }
                />

                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FoodCondition;

