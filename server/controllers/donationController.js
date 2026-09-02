
const Donation = require("../models/Donation");
const User = require("../models/User");

// CREATE DONATION
const createDonation = async (req, res) => {
  try {
    const {
      donor,
      foodName,
      foodType,
      quantity,
      estimatedMeals,
      cookingTime,
      bestBefore,
      condition,
      foodCategory,
      pickupAddress,
      pickupDate,
      pickupTime,
      contactNumber,
      pickupDuration,
      specialInstructions,
      safetyConfirmed,
    } = req.body;

    // Required fields check
    if (
      !donor ||
      !foodName ||
      !foodType ||
      !quantity ||
      !estimatedMeals ||
      !cookingTime ||
      !bestBefore ||
      !condition ||
      !foodCategory ||
      !pickupAddress ||
      !pickupDate ||
      !pickupTime ||
      !contactNumber ||
      !pickupDuration ||
      safetyConfirmed !== true
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required information and confirm the safety declaration.",
      });
    }

    // Check donor exists
    const donorUser = await User.findById(donor);

    if (!donorUser) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }

    // Check donor role
    if (donorUser.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donor restaurants can create donations.",
      });
    }

 
// GET DONATION BY DONATION ID
const getDonationByDonationId = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await Donation.findOne({
      donationId,
    }).populate("donor", "name email role");

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error(
      "Get donation by donation ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load donation.",
      error: error.message,
    });
  }
};


// SAFETY VERIFICATION
const verifyDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, checks } = req.body;

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    // Check all safety items
    if (
      approved !== true ||
      !Array.isArray(checks) ||
      checks.length !== 4 ||
      !checks.every(Boolean)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All safety checks must be confirmed before accepting the donation.",
      });
    }

    // Update donation status
    donation.status = "NGO Accepted";

    await donation.save();

    return res.status(200).json({
      success: true,
      message: "Donation safety verified successfully.",
      donation,
    });
  } catch (error) {
    console.error(
      "Donation verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify donation.",
      error: error.message,
    });
  }
};



// REJECT DONATION
const rejectDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    donation.status = "Rejected";

    await donation.save();

    return res.status(200).json({
      success: true,
      message: "Donation rejected successfully.",
      donation,
    });
  } catch (error) {
    console.error(
      "Reject donation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reject donation.",
      error: error.message,
    });
  }
};




module.exports = {
  createDonation,
  getDonationById,
  getDonationByDonationId,
  verifyDonation,
  ejectDonation,
};



