import {
  Store,
  Phone,
  MapPin,
  BadgeCheck,
} from "lucide-react";

const RestaurantInfo = ({
  profile,
}) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Restaurant Information
      </h2>


      <div className="space-y-6">

        {/* Restaurant Name */}
        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-green-100 p-3">
            <Store
              size={22}
              className="text-green-700"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Restaurant Name
            </p>

            <h3 className="text-lg font-semibold text-gray-900">
              {profile.name}
            </h3>
          </div>

        </div>


        {/* Trade License */}
        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-blue-100 p-3">
            <BadgeCheck
              size={22}
              className="text-blue-700"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Trade License
            </p>

            <h3 className="break-all text-lg font-semibold text-gray-900">
              {profile.tradeLicense}
            </h3>
          </div>

        </div>


        {/* Phone */}
        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-yellow-100 p-3">
            <Phone
              size={22}
              className="text-yellow-700"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Phone Number
            </p>

            <h3 className="text-lg font-semibold text-gray-900">
              {profile.phone}
            </h3>
          </div>

        </div>


        {/* Address */}
        <div className="flex items-start gap-4">

          <div className="rounded-xl bg-red-100 p-3">
            <MapPin
              size={22}
              className="text-red-700"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-gray-500">
              Address
            </p>

            <h3 className="text-lg font-semibold text-gray-900">
              {profile.address}
            </h3>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RestaurantInfo;