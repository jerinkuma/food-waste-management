import {
  Pizza,
  Soup,
  Sandwich,
  Salad,
  Cake,
  TrendingUp,
} from "lucide-react";

const categories = [
  {
    icon: Pizza,
    name: "Rice & Biryani",
    meals: 1240,
    percent: 92,
    color: "bg-orange-500",
  },
  {
    icon: Soup,
    name: "Curries",
    meals: 860,
    percent: 78,
    color: "bg-red-500",
  },
  {
    icon: Sandwich,
    name: "Fast Food",
    meals: 620,
    percent: 61,
    color: "bg-blue-500",
  },
  {
    icon: Salad,
    name: "Vegetables",
    meals: 510,
    percent: 48,
    color: "bg-green-500",
  },
  {
    icon: Cake,
    name: "Desserts",
    meals: 290,
    percent: 29,
    color: "bg-pink-500",
  },
];

const TopDonatedCategories = () => {
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

        {categories.map((item, index) => {

          const Icon = item.icon;

          return (

            <div key={index}>

              <div className="mb-2 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div
                    className={`rounded-xl p-3 ${item.color}`}
                  >
                    <Icon
                      className="text-white"
                      size={20}
                    />
                  </div>

                  <div>

                    <h3 className="font-semibold text-gray-800">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.meals} Meals Donated
                    </p>

                  </div>

                </div>

                <span className="font-bold text-gray-700">
                  {item.percent}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                <div
                  className={`${item.color} h-full rounded-full`}
                  style={{
                    width: `${item.percent}%`,
                  }}
                />

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
};

export default TopDonatedCategories;