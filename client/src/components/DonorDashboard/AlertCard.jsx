
import {
  Clock3,
  MapPin,
  AlertTriangle,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";

const formatRemainingTime = (minutes) => {
  if (minutes === undefined || minutes === null) {
    return "Expiry time unavailable";
  }

  const value = Math.max(0, Number(minutes));

  if (Number.isNaN(value)) {
    return "Expiry time unavailable";
  }

  if (value <= 0) {
    return "Expired";
  }

  const hours = Math.floor(value / 60);
  const mins = value % 60;

  if (hours > 0) {
    return `Expires in ${hours}h ${mins}m`;
  }

  return `Expires in ${mins} Minutes`;
};

const AlertCard = ({
  donation,
  onDonate,
  onDetails,
}) => {
  if (!donation) return null;

  const foodName =
    donation.foodName || "Food Donation";

  const quantity =
    donation.quantity ?? "N/A";

  const address =
    donation.pickupAddress ||
    donation.address ||
    "Pickup location unavailable";

  const remainingMinutes =
    donation.remainingMinutes ??
    donation.data?.remainingMinutes;

  const urgency =
    donation.urgency ||
    donation.data?.urgency ||
    "critical";

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
          {urgency === "critical" ? "HIGH" : "WARNING"}
        </span>

      </div>

      {/* Food Information */}

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
              {foodName}
            </h3>

            <p className="text-gray-500">
              {quantity} Meal Boxes
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
              {address}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock3
              size={18}
              className="text-orange-500"
            />

            <span className="font-medium text-orange-600">
              {formatRemainingTime(remainingMinutes)}
            </span>
          </div>

        </div>

      </div>

      {/* Buttons */}

      <div className="mt-7 flex gap-4">

        <button
          type="button"
          onClick={() => onDonate?.(donation)}
          className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Donate Now
        </button>

        <button
          type="button"
          onClick={() => onDetails?.(donation)}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Details
          <ArrowRight size={18} />
        </button>

      </div>

    </div>
  );
};

export default AlertCard;
