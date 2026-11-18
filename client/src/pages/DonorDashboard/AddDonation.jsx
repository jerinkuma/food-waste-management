
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import FoodInformation from "../../components/DonorDashboard/AddDonation/FoodInformation";
import FoodCondition from "../../components/DonorDashboard/AddDonation/StorageCondition";
import PickupInformation from "../../components/DonorDashboard/AddDonation/PickupInformation";
import SafetyDeclaration from "../../components/DonorDashboard/AddDonation/SafetyDeclaration";
import DonationPreview from "../../components/DonorDashboard/AddDonation/DonationPreview";
import ActionButtons from "../../components/DonorDashboard/AddDonation/ActionButtons";
import DonationByCard from "../../components/DonorDashboard/AddDonation/DonationByCard";

import { fetchDonationForRedonation } from "../../services/api";

const initialDonationData = {
  foodName: "",
  foodType: "",
  quantity: "",
  cookingTime: "",
  bestBefore: "",

  condition: "",
  foodCategory: "",

  pickupAddress: "",
  pickupDate: "",
  pickupTime: "",
  contactNumber: "",
  pickupDuration: "15 Minutes",
  specialInstructions: "",

  safetyConfirmed: false,
};

const AddDonation = () => {
  const [searchParams] = useSearchParams();

  const redonateId = searchParams.get("redonate");

  const [donationData, setDonationData] = useState(
    initialDonationData
  );

  const [loadingPreviousDonation, setLoadingPreviousDonation] =
    useState(false);

  const [loadError, setLoadError] = useState("");

  // =====================================
  // LOAD PREVIOUS DONATION FOR RE-DONATION
  // =====================================

  useEffect(() => {
    let cancelled = false;

    const loadPreviousDonation = async () => {
      if (!redonateId) {
        setDonationData({ ...initialDonationData });
        setLoadError("");
        return;
      }

      try {
        setLoadingPreviousDonation(true);
        setLoadError("");

        const previousDonation =
          await fetchDonationForRedonation(redonateId);

        if (cancelled) return;

        if (!previousDonation) {
          throw new Error("Previous donation not found.");
        }

        // Reuse food information and selected pickup details.
        // New expiry and pickup schedule must be entered.
        setDonationData({
          ...initialDonationData,

          foodName: previousDonation.foodName || "",
          foodType: previousDonation.foodType || "",
          quantity:
            previousDonation.quantity != null
              ? String(previousDonation.quantity)
              : "",
          cookingTime: previousDonation.cookingTime || "",

          condition: previousDonation.condition || "",
          foodCategory: previousDonation.foodCategory || "",

          pickupAddress: previousDonation.pickupAddress || "",
          contactNumber: previousDonation.contactNumber || "",
          pickupDuration:
            previousDonation.pickupDuration || "15 Minutes",

          specialInstructions:
            previousDonation.specialInstructions || "",

          // These must be entered again.
          bestBefore: "",
          pickupDate: "",
          pickupTime: "",

          // Donor must confirm safety again.
          safetyConfirmed: false,
        });
      } catch (error) {
        console.error("Re-donation loading error:", error);

        if (!cancelled) {
          setLoadError(
            error.response?.data?.message ||
              error.message ||
              "Failed to load previous donation."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPreviousDonation(false);
        }
      }
    };

    loadPreviousDonation();

    return () => {
      cancelled = true;
    };
  }, [redonateId]);

  // =====================================
  // UPDATE FORM DATA
  // =====================================

  const updateDonationData = (field, value) => {
    setDonationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================
  // RESET FORM
  // =====================================

  const resetDonationForm = () => {
    setDonationData({
      ...initialDonationData,
    });

    setLoadError("");
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6 lg:space-y-8">

        {redonateId && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-bold text-green-800">
              Re-donate Previous Food
            </h2>

            <p className="mt-1 text-sm text-green-700">
              Previous food information has been loaded.
              Please review the details and provide a new
              pickup schedule and expiry time.
            </p>
          </div>
        )}

        {loadingPreviousDonation && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />

            <p className="mt-4 font-medium text-gray-600">
              Loading previous donation...
            </p>
          </div>
        )}

        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              Unable to load previous donation
            </p>

            <p className="mt-1 text-sm text-red-600">
              {loadError}
            </p>
          </div>
        )}

        {!loadingPreviousDonation && !loadError && (
          <>
            <DonationByCard />

            <FoodInformation
              donationData={donationData}
              updateDonationData={updateDonationData}
            />

            <FoodCondition
              donationData={donationData}
              updateDonationData={updateDonationData}
            />

            <PickupInformation
              donationData={donationData}
              updateDonationData={updateDonationData}
            />

            <SafetyDeclaration
              donationData={donationData}
              updateDonationData={updateDonationData}
            />

            <DonationPreview
              donationData={donationData}
            />

            <ActionButtons
              donationData={donationData}
              resetDonationForm={resetDonationForm}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddDonation;
