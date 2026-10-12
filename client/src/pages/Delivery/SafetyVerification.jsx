import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Loader2,
  PackageCheck,
  ShieldCheck,
  Thermometer,
  UserRound,
  Phone,
  Car,
  MapPin,
  Utensils,
} from "lucide-react";

const SafetyVerification = () => {
  const params = useParams();
  const navigate = useNavigate();

  // ==================================================
  // SUPPORT BOTH:
  // /delivery/safety/:id
  // /delivery/safety/:donationId
  // ==================================================

  const donationId =
    params.donationId ||
    params.id ||
    "";

  // ==================================================
  // STATES
  // ==================================================

  const [donation, setDonation] =
    useState(null);

  const [loadingDonation, setLoadingDonation] =
    useState(true);

  const [checks, setChecks] = useState({
    foodCondition: false,
    packaging: false,
    temperature: false,
    expiry: false,
  });

  const [verifying, setVerifying] =
    useState(false);

  const [rejecting, setRejecting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==================================================
  // TOKEN
  // ==================================================

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  // ==================================================
  // LOAD DONATION
  // IMPORTANT:
  // Custom FL-xxxx ID uses /donation-id/:donationId
  // ==================================================

  useEffect(() => {
    const loadDonation = async () => {
      if (!donationId) {
        setError(
          "Donation ID is missing."
        );

        setLoadingDonation(false);
        return;
      }

      try {
        setLoadingDonation(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/donations/donation-id/${encodeURIComponent(
            donationId
          )}`,
          {
            method: "GET",

            headers: {
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        const data =
          await response.json();

        console.log(
          "DONATION DETAILS RESPONSE:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load donation."
          );
        }

        setDonation(
          data.donation ||
            data.data
        );
      } catch (err) {
        console.error(
          "Load donation error:",
          err
        );

        setError(
          err.message ||
            "Failed to load donation details."
        );
      } finally {
        setLoadingDonation(false);
      }
    };

    loadDonation();
  }, [donationId, token]);

  // ==================================================
  // CHECK CHANGE
  // ==================================================

  const handleCheckChange = (
    key
  ) => {
    if (
      verifying ||
      rejecting
    ) {
      return;
    }

    setChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setError("");
    setSuccessMessage("");
  };

  // ==================================================
  // ALL CHECKS
  // ==================================================

  const allChecked =
    checks.foodCondition === true &&
    checks.packaging === true &&
    checks.temperature === true &&
    checks.expiry === true;

  // ==================================================
  // VERIFY
  // ==================================================

  const handleVerify = async () => {
    if (!donationId) {
      setError(
        "Donation ID is missing."
      );
      return;
    }

    if (!allChecked) {
      setError(
        "Please complete all four safety checks before verification."
      );
      return;
    }

    // Prevent double click
    if (
      verifying ||
      rejecting
    ) {
      return;
    }

    try {
      setVerifying(true);

      setError("");
      setSuccessMessage("");

      console.log(
        "================================="
      );

      console.log(
        "VERIFY DONATION:"
      );

      console.log(
        "Donation ID:",
        donationId
      );

      console.log(
        "Checks:",
        checks
      );

      console.log(
        "================================="
      );

      const response =
        await fetch(
          `http://localhost:5000/api/donations/${encodeURIComponent(
            donationId
          )}/verify`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              approved: true,

              checks: {
                foodCondition:
                  true,

                packaging:
                  true,

                temperature:
                  true,

                expiry:
                  true,
              },
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "VERIFY RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Donation verification failed."
        );
      }

      setSuccessMessage(
        "Donation verified successfully and marked as Completed."
      );

      // Go back after success
      setTimeout(() => {
        navigate(-1);
      }, 1200);
    } catch (err) {
      console.error(
        "Verification error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong during verification."
      );
    } finally {
      setVerifying(false);
    }
  };

  // ==================================================
  // REJECT
  //
  // IMPORTANT:
  // Reject MUST use /reject
  // NOT /verify
  // ==================================================

  const handleReject = async () => {
    if (!donationId) {
      setError(
        "Donation ID is missing."
      );
      return;
    }

    // Prevent double click
    if (
      verifying ||
      rejecting
    ) {
      return;
    }

    try {
      setRejecting(true);

      setError("");
      setSuccessMessage("");

      console.log(
        "================================="
      );

      console.log(
        "REJECT DONATION:"
      );

      console.log(
        "Donation ID:",
        donationId
      );

      console.log(
        "================================="
      );

      const response =
        await fetch(
          `http://localhost:5000/api/donations/${encodeURIComponent(
            donationId
          )}/reject`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              reason:
                "Food failed the safety verification.",
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "REJECT RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Donation rejection failed."
        );
      }

      setSuccessMessage(
        "Donation rejected successfully."
      );

      setTimeout(() => {
        navigate(-1);
      }, 1200);
    } catch (err) {
      console.error(
        "Rejection error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while rejecting donation."
      );
    } finally {
      setRejecting(false);
    }
  };

  // ==================================================
  // CHECK ITEMS
  // ==================================================

  const checkItems = [
    {
      key: "foodCondition",

      title: "Food Condition",

      description:
        "Food is fresh, safe and suitable for consumption.",

      icon: ShieldCheck,
    },

    {
      key: "packaging",

      title: "Packaging",

      description:
        "Food is properly packed and protected.",

      icon: PackageCheck,
    },

    {
      key: "temperature",

      title: "Temperature",

      description:
        "Food has been stored at a safe temperature.",

      icon: Thermometer,
    },

    {
      key: "expiry",

      title: "Expiry / Freshness",

      description:
        "Food is within its safe consumption period.",

      icon: CalendarCheck,
    },
  ];

  // ==================================================
  // LOADING
  // ==================================================

  if (loadingDonation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">

          <Loader2
            size={22}
            className="animate-spin"
          />

          <span className="font-medium">
            Loading donation details...
          </span>

        </div>
      </div>
    );
  }

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* ==================================================
            BACK
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          disabled={
            verifying ||
            rejecting
          }
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck size={25} />
            </div>

            <div className="min-w-0">

              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Safety Verification
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Verify the donation before completing
                the delivery process.
              </p>

              <p className="mt-2 text-xs font-medium text-slate-400">
                Donation ID:{" "}

                <span className="text-slate-600">
                  {donationId}
                </span>
              </p>

            </div>

          </div>

        </div>

        {/* ==================================================
            DONATION + DRIVER INFORMATION
        ================================================== */}

        {donation && (
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* DONATION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Utensils size={20} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Donation Details
                  </h2>

                  <p className="text-xs text-slate-500">
                    Food information
                  </p>

                </div>

              </div>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">
                    Food
                  </span>

                  <span className="text-right font-semibold text-slate-900">
                    {donation.foodName ||
                      "N/A"}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">
                    Food Type
                  </span>

                  <span className="text-right font-semibold text-slate-900">
                    {donation.foodType ||
                      "N/A"}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">
                    Quantity
                  </span>

                  <span className="text-right font-semibold text-slate-900">
                    {donation.quantity ??
                      "N/A"}{" "}
                    KG
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">
                    Estimated Meals
                  </span>

                  <span className="text-right font-semibold text-slate-900">
                    {donation.estimatedMeals ??
                      "N/A"}
                  </span>

                </div>

                <div className="flex justify-between gap-4">

                  <span className="text-slate-500">
                    Pickup Address
                  </span>

                  <span className="max-w-[220px] text-right font-semibold text-slate-900">
                    {donation.pickupAddress ||
                      donation.address ||
                      "N/A"}
                  </span>

                </div>

              </div>

            </div>

            {/* DRIVER */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UserRound size={20} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Delivery Driver
                  </h2>

                  <p className="text-xs text-slate-500">
                    Assigned driver information
                  </p>

                </div>

              </div>

              <div className="space-y-3 text-sm">

                <div className="flex items-center justify-between gap-4">

                  <span className="flex items-center gap-2 text-slate-500">
                    <UserRound size={15} />
                    Name
                  </span>

                  <span className="font-semibold text-slate-900">
                    {donation.deliveryMan
                      ?.name ||
                      "N/A"}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-4">

                  <span className="flex items-center gap-2 text-slate-500">
                    <Phone size={15} />
                    Phone
                  </span>

                  <span className="font-semibold text-slate-900">
                    {donation.deliveryMan
                      ?.phone ||
                      "N/A"}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-4">

                  <span className="flex items-center gap-2 text-slate-500">
                    <Car size={15} />
                    Vehicle
                  </span>

                  <span className="font-semibold text-slate-900">
                    {donation.deliveryMan
                      ?.vehicleNumber ||
                      "N/A"}
                  </span>

                </div>

                <div className="flex items-start justify-between gap-4">

                  <span className="flex items-center gap-2 text-slate-500">
                    <MapPin size={15} />
                    Status
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {donation.status ||
                      donation.pipelineStatus ||
                      "N/A"}
                  </span>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* ==================================================
            SAFETY CHECKS
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-900">
              Safety Checklist
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Confirm every condition before verifying
              this donation.
            </p>

          </div>

          <div className="space-y-3">

            {checkItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const checked =
                  checks[item.key];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      handleCheckChange(
                        item.key
                      )
                    }
                    disabled={
                      verifying ||
                      rejecting
                    }
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                      checked
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        checked
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </p>

                    </div>

                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        checked
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {checked && (
                        <CheckCircle2
                          size={17}
                        />
                      )}
                    </div>

                  </button>
                );
              }
            )}

          </div>

          {/* ==================================================
              CHECK STATUS
          ================================================== */}

          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${
              allChecked
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {allChecked
              ? "All safety checks passed. The donation is ready for verification."
              : "Please complete all four safety checks."}
          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {/* ================================================
                REJECT
            ================================================= */}

            <button
              type="button"
              onClick={handleReject}
              disabled={
                verifying ||
                rejecting
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rejecting ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />

                  Rejecting...
                </>
              ) : (
                "Reject Donation"
              )}
            </button>

            {/* ================================================
                VERIFY
            ================================================= */}

            <button
              type="button"
              onClick={handleVerify}
              disabled={
                verifying ||
                rejecting ||
                !allChecked
              }
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <CheckCircle2
                    size={19}
                  />

                  Verify Donation
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SafetyVerification;