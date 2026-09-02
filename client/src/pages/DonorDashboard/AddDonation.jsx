import { useState } from "react";

import DashboardLayout from "../../components/DonorDashboard/DashboardLayout";

import FoodInformation from "../../components/DonorDashboard/AddDonation/FoodInformation";
import FoodCondition from "../../components/DonorDashboard/AddDonation/StorageCondition";
import PickupInformation from "../../components/DonorDashboard/AddDonation/PickupInformation";
import SafetyDeclaration from "../../components/DonorDashboard/AddDonation/SafetyDeclaration";
import DonationPreview from "../../components/DonorDashboard/AddDonation/DonationPreview";
import ActionButtons from "../../components/DonorDashboard/AddDonation/ActionButtons";
import DonationByCard from "../../components/DonorDashboard/AddDonation/DonationByCard";

const initialDonationData = {
  foodName: "",
  foodType: "",
  quantity: "",
  estimatedMeals: 0,
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
  const [donationData, setDonationData] = useState(
    initialDonationData
  );

  const updateDonationData = (field, value) => {
    setDonationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cancel করলে সব form data reset হবে
  const resetDonationForm = () => {
    setDonationData({
      ...initialDonationData,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6 lg:space-y-8">

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

      </div>
    </DashboardLayout>
  );
};

export default AddDonation;