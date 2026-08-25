import { Snowflake, Flame, Package, Leaf, Drumstick } from "lucide-react";

const FoodCondition = () => {
  const conditions = [
    {
      title: "Fresh",
      icon: <Leaf size={28} />,
      color: "text-green-600",
    },
    {
      title: "Hot",
      icon: <Flame size={28} />,
      color: "text-red-500",
    },
    {
      title: "Cold",
      icon: <Snowflake size={28} />,
      color: "text-blue-500",
    },
    {
      title: "Packed",
      icon: <Package size={28} />,
      color: "text-yellow-500",
    },
    {
      title: "Vegetarian",
      icon: <Leaf size={28} />,
      color: "text-emerald-600",
    },
    {
      title: "Non-Vegetarian",
      icon: <Drumstick size={28} />,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      {/* Header */}

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-gray-800">
          Food Condition
        </h2>

        <p className="mt-2 text-gray-500">
          Select the current condition of the donated food.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">

        {conditions.map((item) => (

          <button
            key={item.title}
            className="group rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:border-green-500 hover:bg-green-50 hover:shadow-lg"
          >

            <div className="flex flex-col items-center">

              <div className={item.color}>
                {item.icon}
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                {item.title}
              </h3>

            </div>

          </button>

        ))}

      </div>

    </div>
  );
};

export default FoodCondition;