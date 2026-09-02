
import {
  Utensils,
  Scale,
  Clock4,
  CalendarClock,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Package,
  Leaf,
  ShieldCheck,
  FileText,
  Timer,
} from "lucide-react";

const DonationPreview = ({ donationData }) => {
  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not provided";

    return new Date(dateTime).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Not provided";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const Detail = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon size={17} className="text-green-600" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>

        <p className="truncate text-sm font-semibold text-gray-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Donation Review
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Check your donation details before publishing.
          </p>
        </div>

        <div
          className={`flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            donationData.safetyConfirmed
              ? "bg-green-50 text-green-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          <ShieldCheck size={17} />

          {donationData.safetyConfirmed
            ? "Ready to Publish"
            : "Complete Safety Declaration"}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-8">

        {/* FOOD SECTION */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">

          {/* Food Information */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <Utensils
                  size={20}
                  className="text-green-600"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Food Information
                </h3>

                <p className="text-xs text-gray-400">
                  Donated food details
                </p>
              </div>
            </div>

            {/* Food Name */}
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Food Name
              </p>

              <h4 className="mt-1 text-xl font-bold text-gray-900">
                {donationData.foodName || "Not provided"}
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                {donationData.foodType || "Food type not provided"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <Detail
                icon={Scale}
                label="Quantity"
                value={
                  donationData.quantity
                    ? `${donationData.quantity} KG`
                    : "Not provided"
                }
              />

              <Detail
                icon={Utensils}
                label="Estimated Meals"
                value={`${donationData.estimatedMeals || 0} meals`}
              />

              <Detail
                icon={Clock4}
                label="Cooking Time"
                value={formatTime(donationData.cookingTime)}
              />

              <Detail
                icon={CalendarClock}
                label="Best Before"
                value={formatDateTime(donationData.bestBefore)}
              />
            </div>
          </div>

          {/* Condition */}
          <div className="border-t border-gray-100 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                <Package
                  size={20}
                  className="text-orange-600"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Food Condition
                </h3>

                <p className="text-xs text-gray-400">
                  Current condition
                </p>
              </div>
            </div>

            <div className="space-y-5">

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Condition
                </p>

                <span className="inline-flex items-center rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  {donationData.condition || "Not selected"}
                </span>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Food Category
                </p>

                <div className="flex items-center gap-2">
                  <Leaf size={18} className="text-green-600" />

                  <span className="text-sm font-semibold text-gray-800">
                    {donationData.foodCategory || "Not selected"}
                  </span>
                </div>
              </div>

              

            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-8 border-t border-gray-100" />

        {/* PICKUP SECTION */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <MapPin
                size={20}
                className="text-red-500"
              />
            </div>

            <div>
              <h3 className="font-bold text-gray-900">
                Pickup Information
              </h3>

              <p className="text-xs text-gray-400">
                Pickup location and schedule
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="mb-6 rounded-2xl bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Pickup Address
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-gray-800">
                  {donationData.pickupAddress ||
                    "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Detail
              icon={Calendar}
              label="Pickup Date"
              value={formatDate(donationData.pickupDate)}
            />

            <Detail
              icon={Clock}
              label="Pickup Time"
              value={formatTime(donationData.pickupTime)}
            />

            <Detail
              icon={Phone}
              label="Contact"
              value={donationData.contactNumber}
            />

            <Detail
              icon={Timer}
              label="Duration"
              value={donationData.pickupDuration}
            />
          </div>

          {/* Instructions */}
          {donationData.specialInstructions && (
            <div className="mt-6 flex items-start gap-3">
              <FileText
                size={18}
                className="mt-0.5 shrink-0 text-gray-400"
              />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Special Instructions
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-700">
                  {donationData.specialInstructions}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SAFETY */}
        <div className="mt-8 border-t border-gray-100 pt-7">
          <div
            className={`flex items-center gap-3 rounded-2xl px-5 py-4 ${
              donationData.safetyConfirmed
                ? "bg-green-50"
                : "bg-yellow-50"
            }`}
          >
            <ShieldCheck
              size={22}
              className={
                donationData.safetyConfirmed
                  ? "text-green-600"
                  : "text-yellow-600"
              }
            />

            <div>
              <p
                className={`text-sm font-bold ${
                  donationData.safetyConfirmed
                    ? "text-green-800"
                    : "text-yellow-800"
                }`}
              >
                Safety Declaration
              </p>

              <p
                className={`mt-0.5 text-xs ${
                  donationData.safetyConfirmed
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                {donationData.safetyConfirmed
                  ? "All safety declarations have been confirmed."
                  : "Please complete all safety declarations before publishing."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DonationPreview;

