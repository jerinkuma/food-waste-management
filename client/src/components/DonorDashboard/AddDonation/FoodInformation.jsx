import { useState } from "react";
import {
  Utensils,
  Package,
  Scale,
  Clock4,
  CalendarClock,
} from "lucide-react";

const FoodInformation = () => {
  const [quantity, setQuantity] = useState("");

  const estimatedMeals =
    quantity && Number(quantity) > 0
      ? Math.floor(Number(quantity) / 0.25)
      : 0;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      {/* Header */}

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
            placeholder="e.g. Rice, Curry, Fast Food, Dessert, Bakery"
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
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter Quantity (KG)"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />

        </div>

        {/* Estimated Meals */}

        <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex flex-col justify-center">

          <p className="text-sm text-gray-600">
            Estimated Meals
          </p>

          <h2 className="mt-2 text-4xl font-bold text-green-700">
            {estimatedMeals}
          </h2>

          <p className="mt-2 text-xs text-gray-500">
            Approximate meal estimation based on food quantity.
          </p>

        </div>

        {/* Cooking Time */}

        <div>

          <label className="mb-2 flex items-center gap-2 font-medium text-gray-700">

            <Clock4 size={18} />

            Cooking Time

          </label>

          <input
            type="time"
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
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500"
          />

        </div>

      </div>

    </div>
  );
};

export default FoodInformation;