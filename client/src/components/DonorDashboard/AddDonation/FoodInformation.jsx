
import {
  Utensils,
  Package,
  Scale,
  Clock4,
  CalendarClock,
} from "lucide-react";

const FoodInformation = ({ donationData, updateDonationData }) => {
  const quantity = donationData.quantity;

  const estimatedMeals =
    quantity && Number(quantity) > 0
      ? Math.floor(Number(quantity) / 0.25)
      : 0;

  const handleChange = (field, value) => {
    updateDonationData(field, value);

    // Quantity change হলে estimated meals automatically update হবে
    if (field === "quantity") {
      const meals =
        value && Number(value) > 0
          ? Math.floor(Number(value) / 0.25)
          : 0;

      updateDonationData("estimatedMeals", meals);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Food Information
        </h2>

        <p className="mt-2 text-gray-500">
          Enter the details of the food you want to donate.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Food Name */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">
            <Utensils size={18} />
            Food Name
          </label>

          <input
            type="text"
            value={donationData.foodName}
            onChange={(e) =>
              handleChange("foodName", e.target.value)
            }
            placeholder="e.g. Chicken Biryani"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Food Type */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">
            <Package size={18} />
            Food Type
          </label>

          <input
            type="text"
            value={donationData.foodType}
            onChange={(e) =>
              handleChange("foodType", e.target.value)
            }
            placeholder="e.g. Rice, Curry, Fast Food, Dessert, Bakery, etc."
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">
            <Scale size={18} />
            Quantity (KG)
          </label>

          <input
            type="number"
            min="0"
            value={donationData.quantity}
            onChange={(e) =>
              handleChange("quantity", e.target.value)
            }
            placeholder="Enter Quantity (KG)"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Estimated Meals */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">
            <Utensils size={18} />
            Estimated Meals
          </label>

          <div className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700">
            {estimatedMeals}
          </div>
        </div>

        {/* Cooking Time */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">
            <Clock4 size={18} />
            Cooking Time
          </label>

          <input
            type="time"
            value={donationData.cookingTime}
            onChange={(e) =>
              handleChange("cookingTime", e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />
        </div>

        {/* Best Before */}
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">
            <CalendarClock size={18} />
            Best Before
          </label>

          <input
            type="datetime-local"
            value={donationData.bestBefore}
            onChange={(e) =>
              handleChange("bestBefore", e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />
        </div>

      </div>
    </div>
  );
};

export default FoodInformation;

