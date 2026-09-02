const Donation = require("../models/Donation");
const User = require("../models/User");
const QRCode = require("qrcode");


// =====================================
// CREATE DONATION
// =====================================

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


    // =====================================
    // REQUIRED FIELDS CHECK
    // =====================================

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


    // =====================================
    // QUANTITY VALIDATION
    // =====================================

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0.",
      });
    }


    // =====================================
    // ESTIMATED MEALS VALIDATION
    // =====================================

    if (Number(estimatedMeals) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Estimated meals must be greater than 0.",
      });
    }


    // =====================================
    // CHECK DONOR EXISTS
    // =====================================

    const donorUser = await User.findById(donor);

    if (!donorUser) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }


    // =====================================
    // CHECK DONOR ROLE
    // =====================================

    if (donorUser.role !== "donor") {
      return res.status(403).json({
        success: false,
        message:
          "Only donor restaurants can create donations.",
      });
    }


    // =====================================
    // GENERATE UNIQUE DONATION ID
    // =====================================

    const donationId = `FD-${new Date().getFullYear()}-${Date.now()
      .toString()
      .slice(-6)}`;


    // =====================================
    // CREATE QR CODE
    // =====================================

    /*
      QR code-এর ভিতরে donationId থাকবে।

      Example:
      FD-2026-123456

      Delivery man QR scan করলে এই ID ব্যবহার
      করে পরে donation information পাওয়া যাবে।
    */

    const qrCode = await QRCode.toDataURL(donationId);


    // =====================================
    // CREATE DONATION
    // =====================================

    const donation = await Donation.create({
      donor,

      foodName,

      foodType,

      quantity: Number(quantity),

      estimatedMeals: Number(estimatedMeals),

      cookingTime,

      bestBefore,

      condition,

      foodCategory,

      pickupAddress,

      pickupDate,

      pickupTime,

      contactNumber,

      pickupDuration,

      specialInstructions:
        specialInstructions || "",

      safetyConfirmed,

      donationId,

      qrCode,

      // Initial NGO request state
      ngoRequest: {
        requested: false,
        requestedBy: null,
        requestedAt: null,
        acceptedAt: null,
      },

      // Initial delivery man state
      deliveryMan: {
        name: "",
        phone: "",
        vehicleNumber: "",
        assignedAt: null,
      },

      // Initial live location state
      liveLocation: {
        latitude: null,
        longitude: null,
        lastUpdated: null,
      },

      // Initial verification state
      verification: {
        scannedAt: null,
        checks: [],
        approved: false,
        verifiedAt: null,
        rejectionReason: "",
      },

      // Initial status
      status: "Waiting for NGO Acceptance",
    });


    // =====================================
    // SUCCESS RESPONSE
    // =====================================

    return res.status(201).json({
      success: true,

      message:
        "Donation published successfully with QR code.",

      donation,
    });

  } catch (error) {
    console.error(
      "Create donation error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create donation.",

      error: error.message,
    });
  }
};



// =====================================
// GET DONATION BY MONGODB ID
// =====================================

const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;


    const donation = await Donation.findById(id)
      .populate(
        "donor",
        "name email role"
      )
      .populate(
        "ngoRequest.requestedBy",
        "organizationId phone address"
      );


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
      "Get donation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load donation.",
      error: error.message,
    });
  }
};



// =====================================
// GET DONATION BY DONATION ID
// =====================================

const getDonationByDonationId = async (
  req,
  res
) => {
  try {
    const { donationId } = req.params;


    const donation = await Donation.findOne({
      donationId,
    })
      .populate(
        "donor",
        "name email role"
      )
      .populate(
        "ngoRequest.requestedBy",
        "organizationId phone address"
      );


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
      message:
        "Failed to load donation.",

      error: error.message,
    });
  }
};



// =====================================
// SAFETY VERIFICATION / ACCEPT DONATION
// =====================================
//
// NOTE:
// এই function এখনো existing verification route-এর
// জন্য রাখা হয়েছে।
// পরের step-এ এটাকে Delivery Man-এর QR scan +
// food verification flow অনুযায়ী update করব.
//

const verifyDonation = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      approved,
      checks,
    } = req.body;


    const donation =
      await Donation.findById(id);


    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }


    // =====================================
    // ALL SAFETY CHECKS
    // =====================================

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


    // =====================================
    // UPDATE VERIFICATION
    // =====================================

    donation.verification = {
      scannedAt:
        donation.verification?.scannedAt ||
        new Date(),

      checks,

      approved: true,

      verifiedAt: new Date(),

      rejectionReason: "",
    };


    // =====================================
    // UPDATE STATUS
    // =====================================

    donation.status =
      "Food Picked Up";


    await donation.save();


    return res.status(200).json({
      success: true,

      message:
        "Donation safety verified successfully.",

      donation,
    });

  } catch (error) {
    console.error(
      "Donation verification error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to verify donation.",

      error: error.message,
    });
  }
};



// =====================================
// REJECT DONATION
// =====================================

const rejectDonation = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      rejectionReason = "",
    } = req.body;


    const donation =
      await Donation.findById(id);


    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }


    // =====================================
    // UPDATE VERIFICATION
    // =====================================

    donation.verification = {
      scannedAt:
        donation.verification?.scannedAt ||
        null,

      checks:
        donation.verification?.checks ||
        [],

      approved: false,

      verifiedAt: new Date(),

      rejectionReason,
    };


    // =====================================
    // UPDATE STATUS
    // =====================================

    donation.status =
      "Rejected";


    await donation.save();


    return res.status(200).json({
      success: true,

      message:
        "Donation rejected successfully.",

      donation,
    });

  } catch (error) {
    console.error(
      "Reject donation error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to reject donation.",

      error: error.message,
    });
  }
};



// =====================================
// GET ALL DONATIONS OF A DONOR
// =====================================

const getDonorDonations = async (
  req,
  res
) => {
  try {
    const { donorId } = req.params;


    const donations =
      await Donation.find({
        donor: donorId,
      })
        .populate(
          "ngoRequest.requestedBy",
          "organizationId phone address"
        )
        .sort({
          createdAt: -1,
        });


    return res.status(200).json({
      success: true,
      donations,
    });

  } catch (error) {
    console.error(
      "Get donor donations error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to load donation history.",

      error: error.message,
    });
  }
};



// =====================================
// GET DONOR DASHBOARD DATA
// =====================================

const getDonorDashboard = async (
  req,
  res
) => {
  try {
    const { donorId } = req.params;


    // =====================================
    // CHECK DONOR
    // =====================================

    const donor =
      await User.findById(donorId);


    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }


    if (donor.role !== "donor") {
      return res.status(403).json({
        success: false,

        message:
          "Only donor restaurants can access dashboard.",
      });
    }


    // =====================================
    // GET ALL DONATIONS
    // =====================================

    const donations =
      await Donation.find({
        donor: donorId,
      })
        .populate(
          "ngoRequest.requestedBy",
          "organizationId phone address"
        )
        .sort({
          createdAt: -1,
        });


    // =====================================
    // BASIC STATISTICS
    // =====================================

    const totalDonations =
      donations.length;


    const mealsServed =
      donations.reduce(
        (total, donation) =>
          total +
          Number(
            donation.estimatedMeals || 0
          ),
        0
      );


    // =====================================
    // TOTAL FOOD QUANTITY
    // =====================================

    const totalQuantity =
      donations.reduce(
        (total, donation) =>
          total +
          Number(
            donation.quantity || 0
          ),
        0
      );


    // =====================================
    // TODAY'S DONATIONS
    // =====================================

    const today =
      new Date();


    const startOfDay =
      new Date(today);

    startOfDay.setHours(
      0,
      0,
      0,
      0
    );


    const endOfDay =
      new Date(today);

    endOfDay.setHours(
      23,
      59,
      59,
      999
    );


    const todayDonations =
      donations.filter(
        (donation) =>
          donation.createdAt >=
            startOfDay &&
          donation.createdAt <=
            endOfDay
      );


    // =====================================
    // ACTIVE DONATIONS
    // =====================================

    const activeStatuses = [
      "Published",
      "Waiting for NGO Acceptance",
      "NGO Requested",
      "Delivery Man Assigned",
      "Driver Arriving",
      "Food Verification",
      "Food Picked Up",
      "Delivered",
    ];


    const activeDonations =
      donations.filter(
        (donation) =>
          activeStatuses.includes(
            donation.status
          )
      );


    // =====================================
    // FRESHNESS ALERT
    // =====================================

    const now =
      new Date();


    const alertDonations =
      activeDonations
        .filter(
          (donation) =>
            new Date(
              donation.bestBefore
            ) > now
        )
        .sort(
          (a, b) =>
            new Date(
              a.bestBefore
            ) -
            new Date(
              b.bestBefore
            )
        );


    const freshnessAlert =
      alertDonations.length > 0
        ? alertDonations[0]
        : null;


    // =====================================
    // ENVIRONMENTAL / IMPACT DATA
    // =====================================

    // Actual quantity from database
    const foodWasteDiverted =
      totalQuantity;


    // Estimated water saved
    const waterSaved =
      mealsServed * 2.6;


    // =====================================
    // ANNUAL GOAL
    // =====================================

    const annualTarget =
      500;


    const annualGoal =
      Math.min(
        Math.round(
          (totalDonations /
            annualTarget) *
            100
        ),
        100
      );


    // =====================================
    // CATEGORY DATA
    // =====================================

    const categoryMap = {};


    donations.forEach(
      (donation) => {
        const category =
          donation.foodType ||
          "Other";


        if (
          !categoryMap[category]
        ) {
          categoryMap[category] = {
            name: category,
            meals: 0,
            donations: 0,
          };
        }


        categoryMap[category]
          .meals +=
          Number(
            donation.estimatedMeals ||
              0
          );


        categoryMap[category]
          .donations += 1;
      }
    );


    const categories =
      Object.values(
        categoryMap
      )
        .sort(
          (a, b) =>
            b.meals - a.meals
        )
        .slice(0, 5);


    const maxCategoryMeals =
      categories.length > 0
        ? Math.max(
            ...categories.map(
              (item) =>
                item.meals
            )
          )
        : 0;


    const formattedCategories =
      categories.map(
        (item) => ({
          ...item,

          percent:
            maxCategoryMeals > 0
              ? Math.round(
                  (item.meals /
                    maxCategoryMeals) *
                    100
                )
              : 0,
        })
      );


    // =====================================
    // RECENT DONATIONS
    // =====================================

    const recentDonations =
      donations.slice(0, 5);


    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      success: true,

      dashboard: {
        totalDonations,

        mealsServed,

        todayDonations:
          todayDonations.length,

        activeDonations:
          activeDonations.length,

        // Actual database quantity
        foodWasteDiverted:
          Number(
            foodWasteDiverted.toFixed(
              2
            )
          ),

        // Estimated value
        waterSaved:
          Number(
            waterSaved.toFixed(0)
          ),

        annualGoal,

        annualTarget,

        freshnessAlert,

        categories:
          formattedCategories,

        recentDonations,
      },
    });

  } catch (error) {
    console.error(
      "Get donor dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to load donor dashboard.",

      error: error.message,
    });
  }
};



// =====================================
// EXPORT
// =====================================

module.exports = {
  createDonation,
  getDonationById,
  getDonationByDonationId,
  verifyDonation,
  rejectDonation,
  getDonorDonations,
  getDonorDashboard,
};