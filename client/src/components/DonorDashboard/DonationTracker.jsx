
import { useState } from "react";
import {
  Truck,
  User,
  Phone,
  Building2,
  PackageCheck,
  Check,
  X,
} from "lucide-react";
import { API_URL } from "../../config";

const getToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("user") || "{}")?.token ||
      ""
    );
  } catch {
    return localStorage.getItem("token") || "";
  }
};

const DonationTracker = ({
  donation,
  donations = [],
  onRefresh,
}) => {
  const [processing, setProcessing] = useState("");

  const allDonations =
    donations.length > 0
      ? donations
      : donation
        ? [donation]
        : [];

  const getStatus = (item) =>
    String(
      item?.pipelineStatus ||
      item?.status ||
      ""
    ).trim();

  const isHistoryStatus = (item) => {
    const status = getStatus(item).toLowerCase();

    return (
      status.includes("completed") ||
      status.includes("rejected")
    );
  };

  const isActivePickup = (item) => {
    return (
      [
        "Accepted",
        "Out for Delivery",
      ].includes(
        String(item?.pipelineStatus || "").trim()
      ) ||
      [
        "Delivery Man Assigned",
        "Food Picked Up",
      ].includes(
        String(item?.status || "").trim()
      )
    );
  };

  const requestDonations = allDonations.filter((item) => {
    const hasPendingRequests =
      Array.isArray(item?.ngoRequests) &&
      item.ngoRequests.some(
        (request) => request.status === "Pending"
      );

    return (
      item?.pipelineStatus === "Pending" &&
      !item?.selectedNgo &&
      hasPendingRequests &&
      !isHistoryStatus(item)
    );
  });

  const activeDonations = allDonations.filter(
    (item) =>
      isActivePickup(item) &&
      !isHistoryStatus(item)
  );

  const getDonationName = (item) =>
    item?.foodName ||
    item?.foodType ||
    "Food Donation";

  const getNgoName = (item) => {
    const selectedNgo = item?.selectedNgo;
    const acceptedNgo = item?.ngoRequest?.requestedBy;
    const ngo = item?.ngo;

    const ngoInfo =
      selectedNgo && typeof selectedNgo === "object"
        ? selectedNgo
        : acceptedNgo && typeof acceptedNgo === "object"
          ? acceptedNgo
          : ngo && typeof ngo === "object"
            ? ngo
            : null;

    return (
      ngoInfo?.user?.name ||
      ngoInfo?.name ||
      ngoInfo?.organizationName ||
      ngoInfo?.organizationId ||
      "NGO Partner"
    );
  };

  const getRequestNgoName = (request) => {
    const ngo = request?.requestedBy;

    return (
      ngo?.user?.name ||
      ngo?.organizationName ||
      ngo?.organizationId ||
      "NGO Partner"
    );
  };

  // ACCEPT / DECLINE NGO REQUEST
  const handleNgoRequest = async (
    item,
    ngoId,
    action
  ) => {
    const donationId = item?._id;

    if (!donationId || !ngoId) {
      alert("Donation or NGO information is missing.");
      return;
    }

    if (processing) return;

    const confirmed = window.confirm(
      action === "accept"
        ? "Are you sure you want to select this NGO? Other pending NGO requests will be rejected automatically."
        : "Are you sure you want to decline this NGO request?"
    );

    if (!confirmed) return;

    try {
      const actionKey = `${donationId}-${ngoId}`;

      setProcessing(actionKey);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token not found. Please log in again."
        );
      }

      const endpoint =
        action === "accept"
          ? `${API_URL}/donations/${donationId}/select-ngo/${ngoId}`
          : `${API_URL}/donations/${donationId}/decline-ngo/${ngoId}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          `Failed to ${action} NGO request.`
        );
      }

      alert(
        action === "accept"
          ? "NGO selected successfully!"
          : "NGO request declined successfully!"
      );

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("NGO request action error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setProcessing("");
    }
  };

  // NGO REQUEST CARD
  const renderRequestDonation = (item) => {
    const pendingRequests =
      (item?.ngoRequests || []).filter(
        (request) => request.status === "Pending"
      );

    return (
      <div
        key={item._id}
        className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 dark:border-orange-900/50 dark:bg-[#241f18] sm:p-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Food Donation
            </p>

            <h4 className="mt-1 text-lg font-bold text-gray-800 dark:text-gray-100">
              {getDonationName(item)}
            </h4>

            {item?.donationId && (
              <p className="mt-1 text-[11px] text-gray-400">
                ID: {item.donationId}
              </p>
            )}
          </div>

          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            {pendingRequests.length} NGO Request
            {pendingRequests.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {pendingRequests.map((request) => {
            const ngoId =
              request?.requestedBy?._id ||
              request?.requestedBy;

            const actionKey = `${item._id}-${ngoId}`;
            const isProcessing =
              processing === actionKey;

            return (
              <div
                key={actionKey}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#202d28]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-green-100 p-2 dark:bg-green-500/15">
                      <Building2
                        size={19}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {getRequestNgoName(request)}
                      </p>

                      {request?.requestedBy?.organizationId && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          ID: {request.requestedBy.organizationId}
                        </p>
                      )}

                      {request?.requestedAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          Requested:{" "}
                          {new Date(
                            request.requestedAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
                    Pending
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={Boolean(processing)}
                    onClick={() =>
                      handleNgoRequest(
                        item,
                        ngoId,
                        "accept"
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={16} />
                    {isProcessing
                      ? "Processing..."
                      : "Accept NGO"}
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(processing)}
                    onClick={() =>
                      handleNgoRequest(
                        item,
                        ngoId,
                        "decline"
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-[#202d28] dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <X size={16} />
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ACTIVE DONATION CARD
  const renderActiveDonation = (item) => {
    const driver = item?.deliveryMan || null;
    const status = getStatus(item);

    let progress = 30;

    if (status === "Delivery Man Assigned") {
      progress = 50;
    }

    if (status === "Out for Delivery") {
      progress = 75;
    }

    if (status === "Food Picked Up") {
      progress = 90;
    }

    const handleCallDriver = () => {
      if (!driver?.phone) {
        alert("Driver phone number not available.");
        return;
      }

      let phone = driver.phone.replace(/\D/g, "");

      if (phone.startsWith("01")) {
        phone = `88${phone}`;
      } else if (phone.startsWith("1")) {
        phone = `880${phone}`;
      }

      window.open(`https://wa.me/${phone}`, "_blank");
    };

    return (
      <div
        key={item?._id || item?.donationId}
        className="rounded-2xl border border-green-100 bg-green-50/40 p-4 transition-colors dark:border-gray-700 dark:bg-[#18241f] sm:p-5"
      >
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

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              NGO Partner
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
                {driver?.name || "Information unavailable"}
              </span>
            </div>
          </div>

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
                {driver?.phone || "Not available"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Vehicle
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {driver?.vehicleNumber || "Not available"}
            </p>
          </div>
        </div>

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
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={handleCallDriver}
            disabled={!driver?.phone}
            className={`
              !flex !w-full !max-w-[320px]
              !items-center !justify-center !gap-2
              !rounded-xl !px-5 !py-3
              !text-sm !font-semibold !text-white
              !shadow-md
              ${
                driver?.phone
                  ? "!bg-green-600 hover:!bg-green-700"
                  : "!bg-gray-400 cursor-not-allowed"
              }
            `}
          >
            <Phone size={17} />
            Call Driver
          </button>
        </div>
      </div>
    );
  };

  // MAIN RETURN
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-[#111916] sm:p-6">
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
              Manage NGO requests and food donation pickups
            </p>
          </div>
        </div>

        {activeDonations.length > 0 && (
          <span className="w-fit rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-400">
            {activeDonations.length} Active Pickup
            {activeDonations.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {requestDonations.length > 0 && (
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-2">
            <Building2
              size={19}
              className="text-orange-600 dark:text-orange-400"
            />

            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
              NGO Requests
            </h3>

            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
              {requestDonations.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {requestDonations.map(renderRequestDonation)}
          </div>
        </div>
      )}

      {activeDonations.length > 0 && (
        <div className="mt-7 space-y-5">
          <div className="flex items-center gap-2">
            <PackageCheck
              size={19}
              className="text-green-600 dark:text-green-400"
            />

            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
              Active Pickup
            </h3>
          </div>

          <div
            className={`grid grid-cols-1 gap-5 ${
              activeDonations.length >= 2
                ? "md:grid-cols-2"
                : ""
            }`}
          >
            {activeDonations.map(renderActiveDonation)}
          </div>
        </div>
      )}

      {requestDonations.length === 0 &&
        activeDonations.length === 0 && (
          <div className="mt-6 rounded-2xl bg-gray-50 p-7 text-center dark:bg-[#18221f]">
            <Truck
              size={38}
              className="mx-auto text-gray-400 dark:text-gray-500"
            />

            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-200">
              No active pickup
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              NGO requests and donation pickup information
              will appear here when available.
            </p>
          </div>
        )}
    </div>
  );
};

export default DonationTracker;
