
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ShieldCheck,
  Utensils,
  Scale,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
} from "lucide-react";


const SafetyVerification = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checks, setChecks] = useState([
    false,
    false,
    false,
    false,
  ]);

  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // Load donation
  useEffect(() => {
    const loadDonation = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/donations/donation-id/${donationId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Donation not found."
          );
        }

        setDonation(data.donation);
      } catch (error) {
        console.error(
          "Load donation error:",
          error
        );

        setError(
          error.message ||
            "Failed to load donation."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDonation();
  }, [donationId]);


  const handleCheck = (index) => {
    const updatedChecks = [...checks];

    updatedChecks[index] =
      !updatedChecks[index];

    setChecks(updatedChecks);
    setError("");
  };


  const allChecked = checks.every(Boolean);


  // Accept donation
  const handleAccept = async () => {
    setError("");
    setSuccess("");

    if (!allChecked) {
      setError(
        "Please complete all safety checks before accepting."
      );

      return;
    }

    if (!donation?._id) {
      setError("Donation information is missing.");
      return;
    }

    try {
      setVerifying(true);

      const response = await fetch(
        `http://localhost:5000/api/donations/${donation._id}/verify`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            approved: true,
            checks,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to verify donation."
        );
      }

      setDonation(data.donation);

      setSuccess(
        "Donation has been successfully verified."
      );
    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setError(
        error.message ||
          "Failed to verify donation."
      );
    } finally {
      setVerifying(false);
    }
  };


  // Reject donation
  const handleReject = async () => {
    setError("");
    setSuccess("");

    if (!donation?._id) {
      setError("Donation information is missing.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to reject this donation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setVerifying(true);

      const response = await fetch(
        `http://localhost:5000/api/donations/${donation._id}/reject`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reject donation."
        );
      }

      setDonation(data.donation);

      setSuccess(
        "Donation has been rejected."
      );
    } catch (error) {
      console.error(
        "Reject donation error:",
        error
      );

      setError(
        error.message ||
          "Failed to reject donation."
      );
    } finally {
      setVerifying(false);
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

        <div className="text-center">

          <Loader2
            size={36}
            className="mx-auto animate-spin text-green-600"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading donation information...
          </p>

        </div>

      </div>
    );
  }


  if (!donation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle
              size={34}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Donation Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This QR code does not belong to a valid
            donation.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto w-full max-w-4xl">

        {/* HEADER */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <ShieldCheck
              size={34}
              className="text-green-600"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
            Food Safety Verification
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Verify the donated food before accepting
            it for pickup.
          </p>

          <div className="mt-5 inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
            {donation.donationId}
          </div>

        </div>


        {/* DONATION DETAILS */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <Utensils
                size={22}
                className="text-green-600"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Donation Details
              </h2>

              <p className="text-sm text-gray-500">
                Check the information against the actual food.
              </p>
            </div>

          </div>


          <div className="rounded-2xl bg-gray-50 p-5">

            <h3 className="text-xl font-bold text-gray-900">
              {donation.foodName}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {donation.foodType}
            </p>


            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">

              <div>
                <p className="text-xs text-gray-400">
                  Quantity
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Scale
                    size={17}
                    className="text-green-600"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    {donation.quantity} KG
                  </span>
                </div>
              </div>


              <div>
                <p className="text-xs text-gray-400">
                  Condition
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Package
                    size={17}
                    className="text-orange-500"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    {donation.condition}
                  </span>
                </div>
              </div>


              <div>
                <p className="text-xs text-gray-400">
                  Best Before
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Calendar
                    size={17}
                    className="text-blue-500"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(
                      donation.bestBefore
                    ).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>


              <div>
                <p className="text-xs text-gray-400">
                  Cooking Time
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <Clock
                    size={17}
                    className="text-purple-500"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    {donation.cookingTime}
                  </span>
                </div>
              </div>

            </div>

          </div>


          {/* PICKUP */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4">

              <MapPin
                size={19}
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


            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4">

              <Calendar
                size={19}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Pickup Schedule
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {new Date(
                    donation.pickupDate
                  ).toLocaleDateString("en-GB")}{" "}
                  at {donation.pickupTime}
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* SAFETY CHECKLIST */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-gray-900">
              Safety Checklist
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Confirm each item before accepting the donation.
            </p>

          </div>


          <div className="space-y-3">

            {[
              "Food condition matches the information provided.",
              "Food appears safe for consumption.",
              "Packaging and storage condition are acceptable.",
              "Food is within the safe consumption period.",
            ].map((text, index) => (

              <label
                key={index}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  checks[index]
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-gray-50 hover:border-green-300"
                }`}
              >

                <input
                  type="checkbox"
                  checked={checks[index]}
                  onChange={() =>
                    handleCheck(index)
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-green-600"
                />

                <span className="text-sm font-medium leading-6 text-gray-700">
                  {text}
                </span>

              </label>

            ))}

          </div>


          {/* MESSAGE */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {success && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {success}
            </div>
          )}


          {/* ACTIONS */}
          {donation.status ===
          "Waiting for NGO Acceptance" ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={handleReject}
                disabled={verifying}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={19} />
                Reject Food
              </button>


              <button
                type="button"
                onClick={handleAccept}
                disabled={
                  verifying || !allChecked
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {verifying ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={19} />
                    Accept & Verify
                  </>
                )}

              </button>

            </div>
          ) : (
            <div className="mt-7 rounded-2xl bg-green-50 p-5 text-center">

              <CheckCircle2
                size={30}
                className="mx-auto text-green-600"
              />

              <p className="mt-2 font-bold text-green-800">
                Donation Status: {donation.status}
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SafetyVerification;

