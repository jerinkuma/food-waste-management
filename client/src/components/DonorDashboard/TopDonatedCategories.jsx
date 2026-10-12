import {
  Pizza,
  Soup,
  Sandwich,
  Salad,
  Cake,
  TrendingUp,
} from "lucide-react";

const TopDonatedCategories = ({
  categories = [],
}) => {
  // Different icons/colors for different food categories
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

  const categoryList = Array.isArray(categories)
    ? categories
    : [];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Top Donated Food Categories
          </h2>

          <p className="mt-1 text-gray-500">
            Most donated food items this month
          </p>

        </div>

        <div className="rounded-2xl bg-green-100 p-3">

          <TrendingUp
            className="text-green-600"
            size={26}
          />

        </div>

      </div>

      {/* Categories */}

      <div className="mt-8 space-y-6">

        {categoryList.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">

            <p className="text-gray-500">
              No food category data available yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Categories will appear here after you make donations.
            </p>

          </div>

        ) : (

          categoryList.map((item, index) => {

            const style =
              categoryStyles[
                index %
                  categoryStyles.length
              ];

            const Icon = style.icon;

            const meals =
              Number(item.meals) || 0;

            const percent = Math.min(
              Math.max(
                Number(item.percent) || 0,
                0
              ),
              100
            );

            return (

              <div
                key={`${item.name}-${index}`}
              >

                <div className="mb-2 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className={`rounded-xl p-3 ${style.color}`}
                    >
                      <Icon
                        className="text-white"
                        size={20}
                      />
                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-800">
                        {item.name || "Other"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {meals.toLocaleString()} Meals Donated
                      </p>

                    </div>

                  </div>

                  <span className="font-bold text-gray-700">
                    {percent}%
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                  <div
                    className={`${style.color} h-full rounded-full transition-all duration-500`}
                    style={{
                      width: `${percent}%`,
                    }}
                  />

                </div>

              </div>

            );

          })

        )}

      </div>

    </div>
  );
};

export default TopDonatedCategories;