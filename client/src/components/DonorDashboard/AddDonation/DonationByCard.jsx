import { useEffect, useState } from "react";

import {
  BadgeCheck,
  Store,
  MapPin,
  Phone,
  Hash,
} from "lucide-react";

const DonationByCard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRestaurantProfile = async () => {
      try {
        const user = JSON.parse(
          localStorage.getItem("user")
        );

        if (!user?.id) {
          console.error("User not found");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/restaurants/profile/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || "Failed to load restaurant"
          );
          setLoading(false);
          return;
        }

        setRestaurant(data.restaurant);

      } catch (error) {
        console.error(
          "Restaurant profile error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getRestaurantProfile();
  }, []);


  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-500">
          Loading donor information...
        </p>
      </div>
    );
  }


  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-xl font-bold text-gray-900">
        Donation By
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">

        {/* Left Side */}
        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-100">
            <Store
              size={30}
              className="text-green-700"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {restaurant?.name || "Restaurant"}
            </h3>

            <div className="mt-1 flex items-center gap-2 text-green-600">
              <BadgeCheck size={18} />

              <span className="text-sm font-medium">
                Verified Restaurant
              </span>
            </div>
          </div>

        </div>


        {/* Right Side */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Donor ID */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">

            <Hash
              size={18}
              className="text-green-600"
            />

            <div className="min-w-0">

              <p className="text-xs text-gray-500">
                Donor ID
              </p>

              <p className="truncate text-sm font-semibold text-gray-800">
                {restaurant?.userId || "N/A"}
              </p>

            </div>

          </div>


          {/* Location */}
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">

            <MapPin
              size={18}
              className="shrink-0 text-red-500"
            />

            <div className="min-w-0">

              <p className="text-xs text-gray-500">
                Location
              </p>

              <p className="truncate text-sm font-semibold text-gray-800">
                {restaurant?.address || "N/A"}
              </p>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DonationByCard;