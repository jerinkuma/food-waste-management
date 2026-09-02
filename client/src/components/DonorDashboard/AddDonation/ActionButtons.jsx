
import { X, QrCode, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ActionButtons = ({
  donationData,
  resetDonationForm,
}) => {
  const navigate = useNavigate();

  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  // Cancel
  const handleCancel = () => {
  resetDonationForm();
};

  // Publish Donation
  const handlePublish = async () => {
    setError("");

    // Safety declaration check
    if (!donationData.safetyConfirmed) {
      setError(
        "Please confirm the safety declaration before publishing."
      );
      return;
    }

    // Get logged-in user
    let user;

    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
      console.error("User data error:", error);
    }

    if (!user?.id) {
      setError(
        "User information not found. Please login again."
      );
      return;
    }

    // Required fields
    const requiredFields = [
      ["foodName", "Food Name"],
      ["foodType", "Food Type"],
      ["quantity", "Quantity"],
      ["estimatedMeals", "Estimated Meals"],
      ["cookingTime", "Cooking Time"],
      ["bestBefore", "Best Before"],
      ["condition", "Food Condition"],
      ["foodCategory", "Food Category"],
      ["pickupAddress", "Pickup Address"],
      ["pickupDate", "Pickup Date"],
      ["pickupTime", "Pickup Time"],
      ["contactNumber", "Contact Number"],
      ["pickupDuration", "Pickup Duration"],
    ];

    const missingField = requiredFields.find(
      ([field]) =>
        donationData[field] === "" ||
        donationData[field] === null ||
        donationData[field] === undefined
    );

    if (missingField) {
      setError(
        `Please provide ${missingField[1]} before publishing.`
      );
      return;
    }

    // Quantity validation
    if (Number(donationData.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      setPublishing(true);

      const response = await fetch(
        "http://localhost:5000/api/donations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            donor: user.id,

            foodName: donationData.foodName,
            foodType: donationData.foodType,

            quantity: Number(donationData.quantity),
            estimatedMeals: Number(
              donationData.estimatedMeals
            ),

            cookingTime: donationData.cookingTime,
            bestBefore: donationData.bestBefore,

            condition: donationData.condition,
            foodCategory: donationData.foodCategory,

            pickupAddress: donationData.pickupAddress,
            pickupDate: donationData.pickupDate,
            pickupTime: donationData.pickupTime,

            contactNumber: donationData.contactNumber,
            pickupDuration: donationData.pickupDuration,

            specialInstructions:
              donationData.specialInstructions || "",

            safetyConfirmed:
              donationData.safetyConfirmed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to publish donation."
        );
      }

      // Store the latest published donation
      localStorage.setItem(
        "lastDonation",
        JSON.stringify(data.donation)
      );

      // Go to success page with actual backend data
      navigate("/restaurant/donation-success", {
        state: {
          donation: data.donation,
        },
      });
    } catch (error) {
      console.error("Publish donation error:", error);

      setError(
        error.message ||
          "Something went wrong while publishing the donation."
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

      {/* Error Message */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

        {/* Cancel */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={publishing}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={19} />
          Cancel
        </button>

        {/* Publish Donation */}
        <button
          type="button"
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {publishing ? (
            <>
              <Loader2
                size={19}
                className="animate-spin"
              />
              Publishing...
            </>
          ) : (
            <>
              <QrCode size={19} />
              Publish Donation
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default ActionButtons;

