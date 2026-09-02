
import {
  CheckCircle2,
  Utensils,
  Scale,
  Users,
  Clock,
  MapPin,
  Calendar,
  Phone,
  QrCode,
  ArrowRight,
  Copy,
  Timer,
} from "lucide-react";

import { QRCodeCanvas } from "qrcode.react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const DonationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);

  // Get actual donation from navigation state
  const donationFromState = location.state?.donation;

  // Fallback for page refresh
  const donationFromStorage = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("lastDonation")
      );
    } catch {
      return null;
    }
  })();

  const donation =
    donationFromState || donationFromStorage;

  // No donation found
  if (!donation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <QrCode
              size={30}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Donation Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            We could not find the donation information.
            Please create a new donation.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/restaurant/add-donation")
            }
            className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Create Donation
          </button>

        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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

  const copyDonationId = async () => {
    try {
      await navigator.clipboard.writeText(
        donation.donationId
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  /*
    QR contains the unique Donation ID.

    Later, when NGO verification page is ready,
    this can be changed to a verification URL such as:

    http://localhost:5173/ngo/verify/FD-2026-123456
  */

  
const qrValue = `${window.location.origin}/delivery/safety/${donation.donationId}`;



  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto w-full max-w-5xl">

        {/* SUCCESS HEADER */}
        <div className="rounded-3xl border border-green-200 bg-white px-6 py-8 text-center shadow-sm sm:px-10">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2
              size={44}
              className="text-green-600"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Donation Published Successfully!
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Your food donation has been successfully
            submitted and is now available for NGO acceptance.
          </p>

          {/* DONATION ID */}
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-dashed border-green-300 bg-green-50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              Donation ID
            </p>

            <div className="mt-2 flex items-center justify-center gap-2">

              <span className="text-xl font-bold tracking-wide text-green-800">
                {donation.donationId}
              </span>

              <button
                type="button"
                onClick={copyDonationId}
                title="Copy Donation ID"
                className="rounded-lg p-2 text-green-600 transition hover:bg-green-100"
              >
                <Copy size={17} />
              </button>

            </div>

            {copied && (
              <p className="mt-1 text-xs font-medium text-green-600">
                Donation ID copied!
              </p>
            )}

          </div>

        </div>

        {/* DONATION DETAILS */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Donation Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Details of your published donation.
            </p>
          </div>

          {/* FOOD */}
          <div className="rounded-2xl bg-gray-50 p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                <Utensils
                  size={22}
                  className="text-green-600"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  {donation.foodName}
                </h3>

                <p className="text-sm text-gray-500">
                  {donation.foodType}
                </p>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">

              <div>
                <p className="text-xs text-gray-400">
                  Quantity
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Scale
                    size={16}
                    className="text-green-600"
                  />

                  <p className="text-sm font-semibold text-gray-800">
                    {donation.quantity} KG
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Estimated Meals
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Users
                    size={16}
                    className="text-blue-600"
                  />

                  <p className="text-sm font-semibold text-gray-800">
                    {donation.estimatedMeals}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Condition
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {donation.condition}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Category
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {donation.foodCategory}
                </p>
              </div>

            </div>

          </div>

          {/* PICKUP */}
          <div className="mt-6">

            <h3 className="mb-4 font-bold text-gray-900">
              Pickup Information
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                  <p className="text-xs text-gray-400">
                    Pickup Address
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-5 text-gray-800">
                    {donation.pickupAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <p className="text-xs text-gray-400">
                    Pickup Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDate(donation.pickupDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-xs text-gray-400">
                    Pickup Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatTime(donation.pickupTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-purple-600"
                />

                <div>
                  <p className="text-xs text-gray-400">
                    Contact
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {donation.contactNumber}
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div className="flex items-start gap-3">
                <Timer
                  size={18}
                  className="mt-0.5 shrink-0 text-orange-500"
                />

                <div>
                  <p className="text-xs text-gray-400">
                    Pickup Duration
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {donation.pickupDuration}
                  </p>
                </div>
              </div>

              {donation.specialInstructions && (
                <div className="flex items-start gap-3">
                  <Utensils
                    size={18}
                    className="mt-0.5 shrink-0 text-gray-400"
                  />

                  <div>
                    <p className="text-xs text-gray-400">
                      Special Instructions
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {donation.specialInstructions}
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* STATUS */}
          <div className="mt-7 border-t border-gray-100 pt-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs text-gray-400">
                  Current Status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                  <span className="text-sm font-bold text-gray-800">
                    {donation.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Best Before
                </p>

                <p className="mt-2 text-sm font-semibold text-gray-800">
                  {formatDate(donation.bestBefore)}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* QR CODE */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <QrCode
                size={26}
                className="text-green-600"
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Donation QR Code
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
              The NGO or volunteer can scan this QR code
              to identify your donation.
            </p>

            {/* REAL QR CODE */}
            <div className="mx-auto mt-6 flex w-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

              <QRCodeCanvas
                value={qrValue}
                size={220}
                bgColor="#ffffff"
                fgColor="#111827"
                level="H"
                includeMargin={true}
              />

            </div>

            <p className="mt-4 text-xs text-gray-400">
              Scan to identify donation
            </p>

            <p className="mt-1 text-sm font-bold text-gray-700">
              {donation.donationId}
            </p>

          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

          <button
            type="button"
            onClick={() =>
              navigate("/restaurant/dashboard")
            }
            className="rounded-xl border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Go to Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/restaurant/add-donation")
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Donate More Food
            <ArrowRight size={18} />
          </button>

        </div>

      </div>
    </div>
  );
};

export default DonationSuccess;

