import {
  Clock3,
  MapPin,
  AlertTriangle,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";

const AlertCard = () => {
  return (
    <div className="rounded-3xl border border-red-200 bg-white p-7 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-red-100 p-3">

            <AlertTriangle
              size={24}
              className="text-red-600"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-gray-800">
              Freshness Alert
            </h2>

            <p className="text-gray-500">
              Donation requires immediate pickup.
            </p>

          </div>

        </div>

        <span className="rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-600">
          HIGH
        </span>

      </div>

      {/* Food */}

      <div className="mt-8 rounded-2xl bg-gray-50 p-5">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-green-100 p-3">

            <UtensilsCrossed
              size={26}
              className="text-green-600"
            />

          </div>

          <div>

            <h3 className="text-xl font-bold text-gray-800">
              Chicken Biryani
            </h3>

            <p className="text-gray-500">
              20 Meal Boxes
            </p>

          </div>

        </div>

        <div className="mt-6 space-y-4">

          <div className="flex items-center gap-3">

            <MapPin
              size={18}
              className="text-green-600"
            />

            <span className="text-gray-600">
              Banani Branch, Dhaka
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Clock3
              size={18}
              className="text-orange-500"
            />

            <span className="font-medium text-orange-600">
              Expires in 22 Minutes
            </span>

          </div>

        </div>

      </div>

      {/* Buttons */}

      <div className="mt-7 flex gap-4">

        <button className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700">

          Donate Now

        </button>

        <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 font-semibold text-gray-700 transition hover:bg-gray-100">

          Details

          <ArrowRight size={18} />

        </button>

      </div>

    </div>
  );
};

export default AlertCard;