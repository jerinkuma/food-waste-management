import {
  Star,
  Truck,
  Utensils,
  Leaf,
  Eye,
  CheckCircle,
} from "lucide-react";

const ngoList = [
  {
    id: 1,
    name: "Hope Foundation",
    rating: "4.9",
    meals: 1240,
    pickups: 56,
    carbon: "420 KG",
    lastPickup: "Today • 11:30 AM",
    status: "Active",
  },
  {
    id: 2,
    name: "Food For All",
    rating: "4.8",
    meals: 980,
    pickups: 41,
    carbon: "315 KG",
    lastPickup: "Yesterday",
    status: "Active",
  },
  {
    id: 3,
    name: "Smile Charity",
    rating: "4.7",
    meals: 720,
    pickups: 32,
    carbon: "205 KG",
    lastPickup: "2 Days Ago",
    status: "Active",
  },
];

const NGOPerformance = () => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            NGO Partners
          </h2>

          <p className="mt-1 text-gray-500">
            Registered NGOs working with your restaurant.
          </p>

        </div>

        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
          {ngoList.length} Active NGOs
        </span>

      </div>

      {/* Cards */}

      <div className="mt-8 space-y-5">

        {ngoList.map((ngo) => (

          <div
            key={ngo.id}
            className="rounded-2xl border border-gray-200 p-6 transition hover:shadow-lg"
          >

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* Left */}

              <div>

                <div className="flex items-center gap-3">

                  <h3 className="text-xl font-bold text-gray-800">
                    {ngo.name}
                  </h3>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    <CheckCircle size={14} className="inline mr-1" />
                    {ngo.status}
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-4">

                  <div>

                    <p className="text-sm text-gray-500">
                      Rating
                    </p>

                    <p className="mt-1 flex items-center gap-1 font-semibold">

                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />

                      {ngo.rating}

                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Meals Collected
                    </p>

                    <p className="mt-1 flex items-center gap-1 font-semibold">

                      <Utensils
                        size={16}
                        className="text-green-600"
                      />

                      {ngo.meals}

                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Pickups
                    </p>

                    <p className="mt-1 flex items-center gap-1 font-semibold">

                      <Truck
                        size={16}
                        className="text-blue-600"
                      />

                      {ngo.pickups}

                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Carbon Saved
                    </p>

                    <p className="mt-1 flex items-center gap-1 font-semibold">

                      <Leaf
                        size={16}
                        className="text-emerald-600"
                      />

                      {ngo.carbon}

                    </p>

                  </div>

                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Last Pickup :
                  <span className="font-semibold text-gray-700">
                    {" "}{ngo.lastPickup}
                  </span>
                </p>

              </div>

              {/* Right */}

              <button className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700">

                <Eye size={18} />

                View Details

              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default NGOPerformance;