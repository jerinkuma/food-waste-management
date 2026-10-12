import {
  Truck,
  User,
  Phone,
  MapPin,
  Clock3,
  CheckCircle2,
  Navigation,
  Building2,
  PackageCheck,
} from "lucide-react";

const DonationTracker = ({
  donation,
  donations = [],
}) => {
  // Support both:
  // donations={[]}
  // and older donation={object}
  const allDonations =
    donations.length > 0
      ? donations
      : donation
        ? [donation]
        : [];

  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const getStatus = (item) => {
    return String(
      item?.pipelineStatus ||
      item?.status ||
      ""
    ).trim();
  };

  const isHistoryStatus = (item) => {
    const status = getStatus(item).toLowerCase();

    return (
      status.includes("completed") ||
      status.includes("rejected")
    );
  };

  const isActivePickup = (item) => {
    const pipelineStatus = String(
      item?.pipelineStatus || ""
    ).trim();

    const displayStatus = String(
      item?.status || ""
    ).trim();

    return (
      [
        "Accepted",
        "Out for Delivery",
      ].includes(pipelineStatus) ||
      [
        "Delivery Man Assigned",
        "Food Picked Up",
      ].includes(displayStatus)
    );
  };

  const activeDonations = allDonations.filter(
    (item) =>
      isActivePickup(item) &&
      !isHistoryStatus(item)
  );

  // =====================================================
  // DISTANCE CALCULATION
  // =====================================================

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const earthRadius = 6371;

    const toRadians = (value) =>
      (value * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return earthRadius * c;
  };

  // =====================================================
  // FOOD NAME
  // =====================================================

  const getDonationName = (item) => {
    return (
      item?.foodName ||
      item?.foodType ||
      "Food Donation"
    );
  };

  // =====================================================
  // NGO NAME
  // =====================================================

  const getNgoName = (item) => {
    return (
      item?.ngo?.name ||
      item?.ngo?.organizationName ||
      item?.ngo?.organizationId ||
      "NGO Partner"
    );
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (item) => {
    return (
      item?.pipelineStatus ||
      item?.status ||
      "In Progress"
    );
  };

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (item) => {
    const status = getStatus(item);

    if (
      status === "Out for Delivery" ||
      status === "Food Picked Up"
    ) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
    }

    if (
      status === "Delivery Man Assigned" ||
      status === "Accepted"
    ) {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300";
    }

    return "bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300";
  };

  // =====================================================
  // ACTIVE DONATION CARD
  // =====================================================

  const renderActiveDonation = (item) => {
    const driver =
      item?.deliveryMan || null;

    // Driver live location
    const driverLatitude =
      item?.liveLocation?.latitude;

    const driverLongitude =
      item?.liveLocation?.longitude;

    // Restaurant / donor location
    const restaurantLatitude =
      item?.donor?.location?.latitude;

    const restaurantLongitude =
      item?.donor?.location?.longitude;

    const hasDriverLocation =
      typeof driverLatitude === "number" &&
      typeof driverLongitude === "number";

    const hasRestaurantLocation =
      typeof restaurantLatitude === "number" &&
      typeof restaurantLongitude === "number";

    // =================================================
    // DISTANCE
    // =================================================

    let distanceKm = null;

    if (
      hasDriverLocation &&
      hasRestaurantLocation
    ) {
      distanceKm = calculateDistance(
        driverLatitude,
        driverLongitude,
        restaurantLatitude,
        restaurantLongitude
      );
    }

    // =================================================
    // ESTIMATED ARRIVAL
    // =================================================

    let estimatedArrival = null;

    if (distanceKm !== null) {
      estimatedArrival = Math.max(
        1,
        Math.ceil(
          (distanceKm / 25) * 60
        )
      );
    }

    // =================================================
    // PICKUP STATUS / PROGRESS
    // =================================================

    const status = getStatus(item);

    let progress = 30;

    if (status === "Accepted") {
      progress = 30;
    }

    if (
      status === "Delivery Man Assigned"
    ) {
      progress = 50;
    }

    if (
      status === "Out for Delivery"
    ) {
      progress = 75;
    }

    if (
      status === "Food Picked Up"
    ) {
      progress = 90;
    }

    // =================================================
    // CALL DRIVER
    // =================================================

    const handleCallDriver = () => {
      if (!driver?.phone) {
        return;
      }

      window.location.href =
        `tel:${driver.phone}`;
    };

    // =================================================
    // TRACK DRIVER
    // =================================================

    const handleTrackDriver = () => {
      if (!hasDriverLocation) {
        alert(
          "Driver location is not available yet."
        );

        return;
      }

      alert(
        `Driver is approximately ${distanceKm !== null
          ? distanceKm.toFixed(1)
          : "?"
        } KM away from the restaurant.`
      );
    };

    return (
      <div
        key={
          item?._id ||
          item?.donationId ||
          "active-donation"
        }
        className="
          rounded-2xl
          border border-green-100
          bg-green-50/40
          p-4
          transition-colors
          dark:border-gray-700
          dark:bg-[#18241f]
          sm:p-5
        "
      >
        {/* ============================================
            HEADER
        ============================================ */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Food Donation
            </p>

            <h4 className="mt-1 text-lg font-bold text-gray-800 dark:text-gray-100">
              {getDonationName(item)}
            </h4>

            {item?.donationId && (
              <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                ID: {item.donationId}
              </p>
            )}
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
              item
            )}`}
          >
            {getStatusLabel(item)}
          </span>
        </div>

        {/* ============================================
            NGO / DRIVER INFORMATION
        ============================================ */}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* NGO */}

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              NGO
            </p>

            <div className="mt-1 flex items-center gap-2">
              <Building2
                size={15}
                className="shrink-0 text-green-600 dark:text-green-400"
              />

              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {getNgoName(item)}
              </span>
            </div>
          </div>

          {/* DRIVER */}

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Driver
            </p>

            <div className="mt-1 flex items-center gap-2">
              <User
                size={15}
                className="shrink-0 text-blue-600 dark:text-blue-400"
              />

              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {driver?.name ||
                  "Information unavailable"}
              </span>
            </div>
          </div>

          {/* PHONE */}

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Phone
            </p>

            <div className="mt-1 flex items-center gap-2">
              <Phone
                size={15}
                className="shrink-0 text-blue-600 dark:text-blue-400"
              />

              <span className="text-sm text-gray-700 dark:text-gray-300">
                {driver?.phone ||
                  "Not available"}
              </span>
            </div>
          </div>

          {/* VEHICLE */}

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vehicle
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {driver?.vehicleNumber ||
                "Not available"}
            </p>
          </div>
        </div>

        {/* ============================================
            PICKUP INFORMATION
        ============================================ */}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* ESTIMATED ARRIVAL */}

          <div className="rounded-xl bg-white p-3 dark:bg-[#202d28]">
            <div className="flex items-center gap-2">
              <Clock3
                size={16}
                className="text-orange-500"
              />

              <span className="text-xs text-gray-500 dark:text-gray-400">
                Estimated Arrival
              </span>
            </div>

            <p className="mt-1 text-sm font-bold text-orange-600 dark:text-orange-400">
              {estimatedArrival !== null
                ? `${estimatedArrival} min`
                : "Waiting"}
            </p>
          </div>

          {/* DISTANCE */}

          <div className="rounded-xl bg-white p-3 dark:bg-[#202d28]">
            <div className="flex items-center gap-2">
              <MapPin
                size={16}
                className="text-red-500"
              />

              <span className="text-xs text-gray-500 dark:text-gray-400">
                Distance
              </span>
            </div>

            <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200">
              {distanceKm !== null
                ? `${distanceKm.toFixed(
                  1
                )} KM`
                : "Unavailable"}
            </p>
          </div>

          {/* STATUS */}

          <div className="rounded-xl bg-white p-3 dark:bg-[#202d28]">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={16}
                className="text-green-600 dark:text-green-400"
              />

              <span className="text-xs text-gray-500 dark:text-gray-400">
                Status
              </span>
            </div>

            <p className="mt-1 text-sm font-bold text-green-700 dark:text-green-400">
              {getStatusLabel(item)}
            </p>
          </div>
        </div>

        {/* ============================================
            DRIVER LOCATION
        ============================================ */}

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
          <div className="flex items-start gap-2">
            <Navigation
              size={17}
              className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
            />

            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Driver Location
              </p>

              <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
                {hasDriverLocation
                  ? "Driver location is available."
                  : "Waiting for driver to share live location."}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================
            PICKUP PROGRESS
        ============================================ */}

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              Pickup Progress
            </span>

            <span className="font-semibold text-green-600 dark:text-green-400">
              {progress}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2.5 rounded-full bg-green-500 transition-all dark:bg-green-600"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* ============================================
            ACTION BUTTONS
        ============================================ */}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

          {/* CALL DRIVER */}

          <button
            onClick={handleCallDriver}
            disabled={!driver?.phone}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition ${driver?.phone
                ? "bg-blue-600 hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300 dark:bg-gray-700"
              }`}
          >
            Call Driver
          </button>

          {/* TRACK DRIVER */}

          <button
            onClick={handleTrackDriver}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-gray-300
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-50
              dark:border-gray-600
              dark:bg-[#202d28]
              dark:text-gray-200
              dark:hover:bg-[#263630]
            "
          >
            <Navigation size={16} />
            Track Driver
          </button>
        </div>
      </div>
    );
  };

  // =====================================================
  // MAIN RETURN
  // =====================================================

  return (
    <div
      className="
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        dark:border-gray-700
        dark:bg-[#111916]
        sm:p-6
      "
    >
      {/* ================================================
          HEADER
      ================================================ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-3 dark:bg-blue-500/15">
            <Truck
              size={23}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl">
              Pickup Tracker
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your food donation pickups
            </p>
          </div>
        </div>

        {activeDonations.length > 0 && (
          <span className="w-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-400">
            {activeDonations.length} Active Pickup
            {activeDonations.length > 1
              ? "s"
              : ""}
          </span>
        )}
      </div>

      {/* ================================================
          ACTIVE PICKUPS
      ================================================ */}

      {activeDonations.length > 0 && (
        <div className="mt-6 space-y-5">

          <div className="flex items-center gap-2">
            <PackageCheck
              size={19}
              className="text-green-600 dark:text-green-400"
            />

            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
              Active Pickup
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {activeDonations.map(
              renderActiveDonation
            )}
          </div>
        </div>
      )}

      {/* ================================================
          NO ACTIVE PICKUP
      ================================================ */}

      {activeDonations.length === 0 && (
        <div className="mt-6 rounded-2xl bg-gray-50 p-7 text-center dark:bg-[#18221f]">
          <Truck
            size={38}
            className="mx-auto text-gray-400 dark:text-gray-500"
          />

          <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">
            No active pickup
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your donation pickup information will
            appear here once an NGO assigns a
            driver.
          </p>
        </div>
      )}
    </div>
  );
};

export default DonationTracker;