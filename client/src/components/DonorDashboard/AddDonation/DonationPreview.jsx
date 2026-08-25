import {
  Store,
  Utensils,
  Package,
  Clock,
  CalendarClock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const DonationPreview = () => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      {/* Header */}

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-gray-800">
          Donation Preview
        </h2>

        <p className="mt-2 text-gray-500">
          Review your donation details before publishing.
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="rounded-2xl bg-gray-50 p-5">

          <div className="flex items-center gap-3">

            <Store className="text-green-600" />

            <h3 className="font-semibold text-gray-800">
              Restaurant
            </h3>

          </div>

          <p className="mt-3 text-gray-600">
            Cafe One
          </p>

        </div>

        <div className="rounded-2xl bg-gray-50 p-5">

          <div className="flex items-center gap-3">

            <Utensils className="text-green-600" />

            <h3 className="font-semibold text-gray-800">
              Food Name
            </h3>

          </div>

          <p className="mt-3 text-gray-600">
            Chicken Biryani
          </p>

        </div>

        <div className="rounded-2xl bg-gray-50 p-5">

          <div className="flex items-center gap-3">

            <Package className="text-green-600" />

            <h3 className="font-semibold text-gray-800">
              Quantity
            </h3>

          </div>

          <p className="mt-3 text-gray-600">
            20 KG (80 Meals)
          </p>

        </div>

        <div className="rounded-2xl bg-gray-50 p-5">

          <div className="flex items-center gap-3">

            <Clock className="text-green-600" />

            <h3 className="font-semibold text-gray-800">
              Cooking Time
            </h3>

          </div>

          <p className="mt-3 text-gray-600">
            Today • 11:30 AM
          </p>

        </div>

        <div className="rounded-2xl bg-gray-50 p-5">

          <div className="flex items-center gap-3">

            <CalendarClock className="text-green-600" />

            <h3 className="font-semibold text-gray-800">
              Best Before
            </h3>

          </div>

          <p className="mt-3 text-gray-600">
            Today • 4:30 PM
          </p>

        </div>

        <div className="rounded-2xl bg-gray-50 p-5">

          <div className="flex items-center gap-3">

            <MapPin className="text-green-600" />

            <h3 className="font-semibold text-gray-800">
              Pickup Location
            </h3>

          </div>

          <p className="mt-3 text-gray-600">
            Banani, Dhaka
          </p>

        </div>

      </div>

      {/* Safety */}

      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

        <div className="flex items-center gap-3">

          <ShieldCheck className="text-green-600" />

          <h3 className="font-semibold text-green-700">
            Safety Declaration Confirmed
          </h3>

        </div>

        <p className="mt-3 text-sm text-green-700">

          This donation is ready to be published. After publishing,
          a unique QR Code will be generated for pickup verification.

        </p>

      </div>

    </div>
  );
};

export default DonationPreview;