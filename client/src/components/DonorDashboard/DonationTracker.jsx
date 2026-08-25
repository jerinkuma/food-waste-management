import {
  Truck,
  User,
  Phone,
  MapPin,
  Clock3,
  CheckCircle2,
  Navigation,
} from "lucide-react";

const DonationTracker = () => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-blue-100 p-3">

            <Truck
              size={24}
              className="text-blue-600"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-gray-800">
              Pickup Tracker
            </h2>

            <p className="text-gray-500">
              Live donation pickup status
            </p>

          </div>

        </div>

        <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
          ON THE WAY
        </span>

      </div>

      {/* NGO */}

      <div className="mt-8 rounded-2xl bg-gray-50 p-5">

        <div className="grid grid-cols-2 gap-6">

          <div>

            <p className="text-sm text-gray-500">
              NGO
            </p>

            <h3 className="mt-1 font-semibold text-gray-800">
              Hope Foundation
            </h3>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Driver
            </p>

            <div className="mt-1 flex items-center gap-2">

              <User
                size={17}
                className="text-green-600"
              />

              <span className="font-semibold text-gray-800">
                Rakib Hasan
              </span>

            </div>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Phone
            </p>

            <div className="mt-1 flex items-center gap-2">

              <Phone
                size={17}
                className="text-blue-600"
              />

              <span className="text-gray-800">
                +880 1712-345678
              </span>

            </div>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Vehicle
            </p>

            <h3 className="mt-1 font-semibold text-gray-800">
              DHAKA METRO-GA-2456
            </h3>

          </div>

        </div>

      </div>

      {/* Status */}

      <div className="mt-6 space-y-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Clock3
              size={18}
              className="text-orange-500"
            />

            <span className="text-gray-700">
              Estimated Arrival
            </span>

          </div>

          <span className="font-semibold text-orange-600">
            8 Minutes
          </span>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <MapPin
              size={18}
              className="text-red-500"
            />

            <span className="text-gray-700">
              Distance
            </span>

          </div>

          <span className="font-semibold text-gray-800">
            2.1 KM Away
          </span>

        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <CheckCircle2
              size={18}
              className="text-green-600"
            />

            <span className="text-gray-700">
              Pickup Status
            </span>

          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            Driver Assigned
          </span>

        </div>

      </div>

      {/* Progress */}

      <div className="mt-7">

        <div className="mb-2 flex justify-between text-sm">

          <span className="text-gray-500">
            Pickup Progress
          </span>

          <span className="font-semibold text-green-600">
            72%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-200">

          <div
            className="h-3 rounded-full bg-green-500"
            style={{ width: "72%" }}
          />

        </div>

      </div>

      {/* Buttons */}

      <div className="mt-7 flex gap-4">

        <button className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700">

          Call Driver

        </button>

        <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 font-semibold text-gray-700 transition hover:bg-gray-100">

          <Navigation size={18} />

          Track

        </button>

      </div>

    </div>
  );
};

export default DonationTracker;