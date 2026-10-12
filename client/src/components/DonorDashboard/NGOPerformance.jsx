import { useState } from "react";
import {
  Star,
  Truck,
  Utensils,
  Leaf,
  Eye,
  CheckCircle,
  X,
  Clock,
} from "lucide-react";

const NGOPerformance = ({ ngoPartners = [] }) => {
  const ngoList = Array.isArray(ngoPartners) ? ngoPartners : [];

  const [selectedNgo, setSelectedNgo] = useState(null);

  const closeModal = () => {
    setSelectedNgo(null);
  };

  return (
    <>
      {/* =====================================================
          NGO PARTNERS SECTION
      ====================================================== */}
      <div className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-7">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              NGO Partners
            </h2>

            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Registered NGOs working with your restaurant.
            </p>
          </div>

          <span className="w-fit shrink-0 rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-700 sm:px-4 sm:text-sm">
            {ngoList.length} Active NGOs
          </span>
        </div>

        {/* =====================================================
            NGO CARDS
        ====================================================== */}
        <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-5">
          {ngoList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center sm:p-8">
              <p className="text-sm text-gray-500 sm:text-base">
                No NGO partners found yet.
              </p>
            </div>
          ) : (
            ngoList.map((ngo, index) => (
              <div
                key={ngo.id || ngo.organizationId || index}
                className="min-w-0 rounded-2xl border border-gray-200 p-4 transition hover:shadow-lg sm:p-5 lg:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* LEFT CONTENT */}
                  <div className="min-w-0 flex-1">
                    {/* NGO Name + Status */}
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="min-w-0 break-words text-lg font-bold text-gray-800 sm:text-xl">
                          {ngo.name || "NGO Partner"}
                        </h3>

                        <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle size={14} className="mr-1" />
                          {ngo.status || "Active"}
                        </span>
                      </div>

                      {ngo.organizationId && (
                        <p className="break-all text-xs text-gray-500 sm:text-sm">
                          Organization ID:{" "}
                          <span className="font-semibold text-gray-700">
                            {ngo.organizationId}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Statistics */}
                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-5 md:grid-cols-4">
                      {/* Rating */}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 sm:text-sm">
                          Rating
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-800 sm:text-base">
                          <Star
                            size={16}
                            className="shrink-0 fill-yellow-400 text-yellow-400"
                          />
                          N/A
                        </p>
                      </div>

                      {/* Meals */}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 sm:text-sm">
                          Meals Collected
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-800 sm:text-base">
                          <Utensils
                            size={16}
                            className="shrink-0 text-green-600"
                          />
                          {ngo.meals || 0}
                        </p>
                      </div>

                      {/* Pickups */}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 sm:text-sm">
                          Pickups
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-800 sm:text-base">
                          <Truck
                            size={16}
                            className="shrink-0 text-blue-600"
                          />
                          {ngo.requestCount || 0}
                        </p>
                      </div>

                      {/* Carbon */}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 sm:text-sm">
                          Carbon Saved
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-800 sm:text-base">
                          <Leaf
                            size={16}
                            className="shrink-0 text-emerald-600"
                          />
                          N/A
                        </p>
                      </div>
                    </div>

                    {/* Last Request */}
                    <p className="mt-4 break-words text-xs text-gray-500 sm:mt-5 sm:text-sm">
                      Last Pickup:{" "}
                      <span className="font-semibold text-gray-700">
                        {ngo.lastRequest
                          ? new Date(ngo.lastRequest).toLocaleString()
                          : "N/A"}
                      </span>
                    </p>

                    {/* Contact / Address */}
                    {(ngo.phone || ngo.address) && (
                      <div className="mt-3 space-y-2 text-xs text-gray-500 sm:text-sm">
                        {ngo.phone && (
                          <p className="break-words">
                            <span className="font-semibold text-gray-700">
                              Phone:
                            </span>{" "}
                            {ngo.phone}
                          </p>
                        )}

                        {ngo.address && (
                          <p className="break-words">
                            <span className="font-semibold text-gray-700">
                              Address:
                            </span>{" "}
                            {ngo.address}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* VIEW DETAILS BUTTON */}
                  <button
                    type="button"
                    onClick={() => setSelectedNgo(ngo)}
                    className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 lg:w-auto"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* =====================================================
          NGO DETAILS MODAL
      ====================================================== */}
      {selectedNgo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-2 sm:p-4"
          onClick={closeModal}
        >
          {/* MODAL */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ngo-details-title"
            className="my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* =================================================
                MODAL HEADER
            ================================================== */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 p-4 sm:p-6">
              <div className="min-w-0 flex-1">
                <h2
                  id="ngo-details-title"
                  className="break-words text-lg font-bold text-gray-800 sm:text-2xl"
                >
                  {selectedNgo.name || "NGO Partner"}
                </h2>

                {selectedNgo.organizationId && (
                  <p className="mt-1 break-all text-xs text-gray-500 sm:text-sm">
                    Organization ID:{" "}
                    <span className="font-semibold text-gray-700">
                      {selectedNgo.organizationId}
                    </span>
                  </p>
                )}
              </div>

              {/* CLOSE ICON */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close NGO details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* =================================================
                SCROLLABLE MODAL CONTENT
            ================================================== */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {/* =================================================
                  STATISTICS
              ================================================== */}
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
                {/* Total Requests */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 sm:text-sm">
                    Total Requests
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-800 sm:text-2xl">
                    {selectedNgo.requestCount || 0}
                  </p>
                </div>

                {/* Meals */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 sm:text-sm">
                    Meals
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-800 sm:text-2xl">
                    {selectedNgo.meals || 0}
                  </p>
                </div>

                {/* Quantity */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 sm:text-sm">
                    Total Quantity
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-800 sm:text-2xl">
                    {selectedNgo.quantity || 0} KG
                  </p>
                </div>
              </div>

              {/* =================================================
                  CONTACT INFORMATION
              ================================================== */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-base font-bold text-gray-800 sm:text-lg">
                  Contact Information
                </h3>

                <div className="mt-3 space-y-3 text-sm text-gray-600">
                  <p className="break-words">
                    <span className="font-semibold text-gray-800">
                      Phone:
                    </span>{" "}
                    {selectedNgo.phone || "N/A"}
                  </p>

                  <p className="break-words">
                    <span className="font-semibold text-gray-800">
                      Address:
                    </span>{" "}
                    {selectedNgo.address || "N/A"}
                  </p>
                </div>
              </div>

              {/* =================================================
                  DONATION HISTORY
              ================================================== */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-bold text-gray-800 sm:text-lg">
                    Donation Request History
                  </h3>

                  <span className="text-xs text-gray-500 sm:text-sm">
                    {selectedNgo.history?.length || 0} records
                  </span>
                </div>

                {!selectedNgo.history ||
                selectedNgo.history.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-5 text-center sm:p-6">
                    <p className="text-sm text-gray-500">
                      No donation history found.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {selectedNgo.history.map((item, index) => (
                      <div
                        key={
                          item.donationId ||
                          item.customDonationId ||
                          index
                        }
                        className="min-w-0 rounded-xl border border-gray-200 p-3 sm:p-4"
                      >
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          {/* DONATION DETAILS */}
                          <div className="min-w-0 flex-1">
                            <h4 className="break-words text-sm font-semibold text-gray-800 sm:text-base">
                              {item.foodName || "Food Donation"}
                            </h4>

                            {item.foodType && (
                              <p className="mt-1 break-words text-xs text-gray-500 sm:text-sm">
                                Type: {item.foodType}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 sm:text-sm">
                              <span>
                                Quantity:{" "}
                                <strong className="text-gray-800">
                                  {item.quantity || 0} KG
                                </strong>
                              </span>

                              <span>
                                Meals:{" "}
                                <strong className="text-gray-800">
                                  {item.estimatedMeals || 0}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* STATUS + DATE */}
                          <div className="flex min-w-0 flex-col items-start gap-2 sm:items-end">
                            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle
                                size={13}
                                className="shrink-0"
                              />

                              <span className="break-words">
                                {item.pipelineStatus ||
                                  item.status ||
                                  "Unknown"}
                              </span>
                            </span>

                            <p className="flex max-w-full items-start gap-1 break-words text-xs text-gray-500 sm:text-right">
                              <Clock
                                size={13}
                                className="mt-0.5 shrink-0"
                              />

                              <span>
                                {item.requestedAt
                                  ? new Date(
                                      item.requestedAt
                                    ).toLocaleString()
                                  : item.createdAt
                                  ? new Date(
                                      item.createdAt
                                    ).toLocaleString()
                                  : "N/A"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================== */}
            <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white p-3 sm:p-5">
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 sm:w-auto sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NGOPerformance;