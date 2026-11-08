
import {
  Pizza,
  Soup,
  Sandwich,
  Salad,
  Cake,
  Utensils,
  TrendingUp,
} from "lucide-react";

const categoryStyles = [
  {
    icon: Pizza,
    color: "bg-orange-500",
  },
  {
    icon: Soup,
    color: "bg-red-500",
  },
  {
    icon: Sandwich,
    color: "bg-blue-500",
  },
  {
    icon: Salad,
    color: "bg-green-500",
  },
  {
    icon: Cake,
    color: "bg-pink-500",
  },
];

const getFoodIcon = (foodType) => {
  const type = String(foodType || "").toLowerCase();

  if (
    /rice|biryani|pulao|khichuri|polao/.test(type)
  ) {
    return Pizza;
  }

  if (
    /curry|soup|dal|lentil|stew/.test(type)
  ) {
    return Soup;
  }

  if (
    /sandwich|burger|bread|pizza|fast food/.test(type)
  ) {
    return Sandwich;
  }

  if (
    /vegetable|salad|fruit|greens/.test(type)
  ) {
    return Salad;
  }

  if (
    /cake|dessert|sweet|pastry/.test(type)
  ) {
    return Cake;
  }

  return Utensils;
};

const TopDonatedCategories = ({
  categories = [],
}) => {
  const validCategories = Array.isArray(categories)
    ? categories
      .filter(
        (item) =>
          item &&
          item.name &&
          Number(item.quantity) > 0
      )
      .sort(
        (a, b) =>
          Number(b.quantity) - Number(a.quantity)
      )
      .slice(0, 5)
    : [];

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    );
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-colors duration-300 sm:p-6 lg:p-7 dark:border-gray-700 dark:bg-gray-800">

      {/* Header */}

      <div className="flex items-center justify-between gap-3">

        <div>
          <h2 className="text-xl font-bold text-gray-800 sm:text-2xl dark:text-gray-100">
            Top Donated Food Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Most donated food types based on completed donations
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-green-100 p-3 dark:bg-green-900/30">
          <TrendingUp
            className="text-green-600 dark:text-green-400"
            size={24}
          />
        </div>

      </div>

      {/* Dynamic Categories */}

      {validCategories.length > 0 ? (

        <div className="mt-8 space-y-6">

          {validCategories.map((item, index) => {
            const Icon = getFoodIcon(item.name);

            const style =
              categoryStyles[index % categoryStyles.length];

            const percentage = Math.min(
              Math.max(Number(item.percent) || 0, 0),
              100
            );

            return (
              <div key={`${item.name}-${index}`}>

                {/* Category Information */}

                <div className="mb-2 flex items-center justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div
                      className={`shrink-0 rounded-xl p-3 ${style.color}`}
                    >
                      <Icon
                        className="text-white"
                        size={20}
                      />
                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate font-semibold text-gray-800 dark:text-gray-100">
                        {item.name}
                      </h3>

                      <p className="text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                        {formatNumber(item.quantity)} KG donated
                      </p>

                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {Number(item.count) || 0} donation(s)
                      </p>

                    </div>

                  </div>

                  <span className="shrink-0 font-bold text-gray-700 dark:text-gray-200">
                    {percentage}%
                  </span>

                </div>

                {/* Progress Bar */}

                <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">

                  <div
                    className={`${style.color} h-full rounded-full transition-all duration-700`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>

              </div>
            );
          })}

        </div>

      ) : (

        /* Empty State */

        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center dark:border-gray-600">

          <Utensils
            size={38}
            className="mb-3 text-gray-400"
          />

          <h3 className="font-semibold text-gray-700 dark:text-gray-200">
            No Completed Food Donations Yet
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your donated food types will appear here after successful completion.
          </p>

        </div>

      )}

    </div>
  );
};

export default TopDonatedCategories;
