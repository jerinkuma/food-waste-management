const Donation = require("../models/Donation");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const QRCode = require("qrcode");
const { getIO, rooms } = require("../utils/socket");
const { createNotification } = require("../utils/notificationUtils");
const {
  haversineKm,
  resolveDonationLocation,
} = require("../utils/geo");


// ======================================================
// HELPER: GET CURRENT NGO PROFILE
// ======================================================
const getCurrentNgo = async (userId) => {
  if (!userId) return null;

  return await Ngo.findOne({
    user: userId,
  });
};

// ======================================================
// CREATE DONATION
// ======================================================
const createDonation = async (req, res) => {
  try {
    const {
      donor,

      // Food information
      foodName,
      foodType,
      quantity,
      estimatedMeals,
      cookingTime,
      bestBefore,

      // Food condition/category
      condition,
      foodCondition,
      foodCategory,
      storageCondition,

      // Pickup information
      pickupAddress,
      address,
      pickupDate,
      pickupTime,
      contactNumber,
      pickupDuration,

      // Location
      latitude,
      longitude,

      // Additional information
      specialInstructions,

      // Safety
      safetyConfirmed,
      safetyDeclaration,
    } = req.body;

    // ==================================================
    // DONOR VALIDATION
    // ==================================================
    if (!donor) {
      return res.status(400).json({
        success: false,
        message: "Donor is required.",
      });
    }

    const donorUser = await User.findById(donor);

    if (!donorUser) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }

    if (donorUser.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donor can create donation.",
      });
    }

    // ==================================================
    // REQUIRED FIELD VALIDATION
    // ==================================================
    if (!foodName || !foodType) {
      return res.status(400).json({
        success: false,
        message:
          "Food name and food type are required.",
      });
    }

    if (
      quantity === undefined ||
      quantity === null ||
      quantity === "" ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0.",
      });
    }

    if (
      estimatedMeals === undefined ||
      estimatedMeals === null ||
      estimatedMeals === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Estimated meals are required.",
      });
    }

    if (!condition && !foodCondition) {
      return res.status(400).json({
        success: false,
        message: "Food condition is required.",
      });
    }

    if (!foodCategory) {
      return res.status(400).json({
        success: false,
        message: "Food category is required.",
      });
    }

    if (!pickupAddress && !address) {
      return res.status(400).json({
        success: false,
        message: "Pickup address is required.",
      });
    }

    if (!pickupDate) {
      return res.status(400).json({
        success: false,
        message: "Pickup date is required.",
      });
    }

    if (!pickupTime) {
      return res.status(400).json({
        success: false,
        message: "Pickup time is required.",
      });
    }

    if (!contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required.",
      });
    }

    if (!pickupDuration) {
      return res.status(400).json({
        success: false,
        message: "Pickup duration is required.",
      });
    }

    // ==================================================
    // SAFETY DECLARATION
    // ==================================================
    const finalSafetyDeclaration =
      safetyDeclaration !== undefined
        ? safetyDeclaration
        : Boolean(safetyConfirmed);

    if (!finalSafetyDeclaration) {
      return res.status(400).json({
        success: false,
        message:
          "Safety declaration must be confirmed.",
      });
    }

    // ==================================================
    // NORMALIZE VALUES
    // ==================================================
    const finalCondition =
      condition || foodCondition;

    const finalPickupAddress =
      pickupAddress || address;

    const finalQuantity = Number(quantity);

    const finalEstimatedMeals =
      Number(estimatedMeals);

    if (
      Number.isNaN(finalQuantity) ||
      finalQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity.",
      });
    }

    if (
      Number.isNaN(finalEstimatedMeals) ||
      finalEstimatedMeals < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid estimated meals.",
      });
    }

    // ==================================================
    // GENERATE DONATION ID
    // ==================================================
    const donationId = `FL-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // ==================================================
    // GENERATE QR CODE
    // ==================================================
    const qrCode = await QRCode.toDataURL(
      donationId
    );

    // ==================================================
    // CREATE DONATION
    // ==================================================
    const donation = await Donation.create({
      donationId,

      donor,

      // -----------------------------------------------
      // FOOD INFORMATION
      // -----------------------------------------------
      foodName,
      foodType,
      quantity: finalQuantity,
      estimatedMeals: finalEstimatedMeals,
      cookingTime,
      bestBefore,

      // -----------------------------------------------
      // FOOD CONDITION / CATEGORY
      // -----------------------------------------------
      condition: finalCondition,
      foodCondition: finalCondition,
      foodCategory,
      storageCondition,

      // -----------------------------------------------
      // PICKUP INFORMATION
      // -----------------------------------------------
      pickupAddress: finalPickupAddress,
      address: finalPickupAddress,

      pickupDate,
      pickupTime,
      contactNumber,
      pickupDuration,

      specialInstructions:
        specialInstructions || "",

      // -----------------------------------------------
      // LOCATION
      // -----------------------------------------------
      latitude:
        latitude !== undefined &&
          latitude !== ""
          ? Number(latitude)
          : undefined,

      longitude:
        longitude !== undefined &&
          longitude !== ""
          ? Number(longitude)
          : undefined,

      // -----------------------------------------------
      // SAFETY
      // -----------------------------------------------
      safetyDeclaration:
        Boolean(finalSafetyDeclaration),

      safetyConfirmed:
        Boolean(finalSafetyDeclaration),

      // -----------------------------------------------
      // NGO REQUEST
      // -----------------------------------------------
      ngoRequest: {
        requested: false,
        requestedBy: null,
        requestedAt: null,
        acceptedAt: null,
      },

      // -----------------------------------------------
      // DELIVERY MAN
      // -----------------------------------------------
      deliveryMan: {
        name: "",
        phone: "",
        vehicleNumber: "",
        assignedAt: null,
      },

      // -----------------------------------------------
      // VERIFICATION
      //
      // IMPORTANT:
      // Donation model expects checks as Boolean array.
      // So NEVER use {} here.
      // -----------------------------------------------
      verification: {
        scannedAt: null,
        checks: [],
        approved: false,
        verifiedAt: null,
        rejectionReason: "",
      },

      // -----------------------------------------------
      // QR CODE
      // -----------------------------------------------
      qrCode,

      // -----------------------------------------------
      // STATUS
      // -----------------------------------------------
      status:
        "Waiting for NGO Acceptance",

      pipelineStatus: "Pending",

      // -----------------------------------------------
      // STATUS HISTORY
      // -----------------------------------------------
      statusHistory: [
        {
          status: "Pending",
          changedAt: new Date(),
          changedBy: donor,
          note:
            "Donation created and waiting for NGO acceptance.",
        },
      ],
    });

    // ==================================================
    // NOTIFY ALL NGOs
    // ==================================================
    getIO()
      .to(rooms.ngos())
      .emit("donation:new", donation);

    // ==================================================
    // NOTIFY ADMINS
    // ==================================================
    getIO()
      .to(rooms.admins())
      .emit("donation:new", donation);
// ==================================================
    // 🔥 প্রায়োরিটি নোটিফিকেশন সিস্টেম (অটো ট্রিগার)
    // ==================================================
    try {
      const Follow = require("../models/Follow");
      // ডোনরকে যারা ফলো করে তাদের খুঁজে বের করা
      const followers = await Follow.find({ followingId: donor });
      
      if (followers && followers.length > 0) {
        followers.forEach(async (f) => {
          const ngoUser = f.followerId; 
          if (ngoUser) {
            await createNotification({
              recipient: ngoUser.toString(),
              type: "PRIORITY_DONATION",
              title: "🔥 Alert: Followed Restaurant Posted!",
              message: `Your partner restaurant posted a new donation: "${foodName || 'Food'}"`,
              donation: donation._id,
              data: {
                role: "ngo",
                donationId: donation.donationId,
                action: "view-donation",
              },
            });

            getIO()
              .to(rooms.ngo(ngoUser.toString()))
              .emit("donation:priority-new", donation);
          }
        });
      }
    } catch (notifErr) {
      console.error("Priority notification error:", notifErr);
    }
    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(201).json({
      success: true,
      message:
        "Donation created successfully.",
      donation,
    });
  } catch (error) {
    console.error(
      "Create Donation Error:",
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

// ======================================================
// GET DONATION BY ID
// ======================================================
const getDonationById = async (
  req,
  res
) => {
  try {
    const donation =
      await Donation.findById(
        req.params.id
      )
        .populate(
          "donor",
          "name email role"
        )
        .populate({
          path:
            "ngoRequest.requestedBy",
          select:
            "organizationId phone address user",
          populate: {
            path: "user",
            select:
              "name email",
          },
        });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message:
          "Donation not found.",
      });
    }

    return res.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error(
      "Get Donation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch donation.",
      error: error.message,
    });
  }
};

// ======================================================
// GET DONATION BY CUSTOM DONATION ID
// ======================================================
const getDonationByDonationId = async (
  req,
  res
) => {
  try {
    const donation =
      await Donation.findOne({
        donationId:
          req.params.donationId,
      })
        .populate(
          "donor",
          "name email role"
        )
        .populate({
          path:
            "ngoRequest.requestedBy",
          select:
            "organizationId phone address user",
          populate: {
            path: "user",
            select:
              "name email",
          },
        });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message:
          "Donation not found.",
      });
    }

    return res.json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error(
      "Get Donation By Donation ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch donation.",
      error: error.message,
    });
  }
};

// ======================================================
// VERIFY DONATION
// ======================================================
const verifyDonation = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ==========================================
    // CURRENT NGO
    // ==========================================
    const ngo = await getCurrentNgo(req.user._id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    // ==========================================
    // FIND DONATION
    // Supports MongoDB _id and Custom donationId
    // ==========================================

    let donation = await Donation.findOne({
      donationId: id,
    });

    // Backward compatibility:
    // If the received ID is a MongoDB ObjectId,
    // search using _id.
    if (
      !donation &&
      /^[0-9a-fA-F]{24}$/.test(id)
    ) {
      donation = await Donation.findById(id);
    }

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }
    // ==========================================
    // OWNERSHIP CHECK
    // ==========================================
    const requestedBy =
      donation.ngoRequest?.requestedBy;

    if (
      !requestedBy ||
      requestedBy.toString() !==
      ngo._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to verify this donation.",
      });
    }

    // ==========================================
    // STATUS CHECK
    // ==========================================
    if (
      donation.status !==
      "Delivery Man Assigned"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery man must be assigned before verification.",
      });
    }

    // ==========================================
    // DELIVERY MAN CHECK
    // ==========================================
    if (
      !donation.deliveryMan?.name ||
      !donation.deliveryMan?.phone ||
      !donation.deliveryMan?.vehicleNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery man information is incomplete.",
      });
    }

    // ==========================================
    // REQUEST BODY
    // ==========================================
    const body = req.body || {};

    const approved =
      body.approved !== undefined
        ? body.approved
        : undefined;

    const checks = body.checks || {};

    const rejectionReason =
      body.rejectionReason || "";

    // ==========================================
    // NORMALIZE CHECKS
    // ==========================================
    //
    // New frontend:
    // foodCondition
    // packaging
    // temperature
    // expiry
    //
    // Old frontend compatibility:
    // foodQuality
    // hygiene
    //
    // ==========================================

    let foodCondition = false;
    let packaging = false;
    let temperature = false;
    let expiry = false;

    if (Array.isArray(checks)) {
      foodCondition = Boolean(checks[0]);
      packaging = Boolean(checks[1]);
      temperature = Boolean(checks[2]);
      expiry = Boolean(checks[3]);
    } else if (
      checks &&
      typeof checks === "object"
    ) {
      foodCondition = Boolean(
        checks.foodCondition ??
        checks.foodConditionCheck ??
        checks.foodQuality ??
        checks.condition
      );

      packaging = Boolean(
        checks.packaging ??
        checks.packagingCheck ??
        checks.package
      );

      temperature = Boolean(
        checks.temperature ??
        checks.temperatureCheck ??
        checks.temp
      );

      expiry = Boolean(
        checks.expiry ??
        checks.expiryCheck ??
        checks.expiration ??
        checks.freshness
      );

      // Old frontend compatibility
      if (
        checks.foodQuality !== undefined &&
        checks.foodCondition === undefined
      ) {
        foodCondition = Boolean(
          checks.foodQuality
        );
      }

      if (
        checks.hygiene !== undefined &&
        checks.expiry === undefined
      ) {
        expiry = Boolean(
          checks.hygiene
        );
      }
    }

    // ==========================================
    // DIRECT BODY FALLBACK
    // ==========================================

    if (!foodCondition) {
      foodCondition = Boolean(
        body.foodCondition ??
        body.foodConditionCheck ??
        body.foodQuality
      );
    }

    if (!packaging) {
      packaging = Boolean(
        body.packaging ??
        body.packagingCheck
      );
    }

    if (!temperature) {
      temperature = Boolean(
        body.temperature ??
        body.temperatureCheck
      );
    }

    if (!expiry) {
      expiry = Boolean(
        body.expiry ??
        body.expiryCheck ??
        body.hygiene
      );
    }

    // ==========================================
    // FINAL CHECK VALUES
    // ==========================================

    const normalizedChecks = {
      foodCondition,
      packaging,
      temperature,
      expiry,
    };

    const allChecksPassed =
      foodCondition &&
      packaging &&
      temperature &&
      expiry;

    // ==========================================
    // APPROVED VALUE
    // ==========================================

    const finalApproved =
      approved !== undefined
        ? Boolean(approved)
        : allChecksPassed;

    // ==========================================
    // ARRAY FOR DATABASE
    // ==========================================

    const checksArray = [
      foodCondition,
      packaging,
      temperature,
      expiry,
    ];

    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
      "========== DONATION VERIFICATION =========="
    );

    console.log(
      "Donation ID:",
      donation._id.toString()
    );

    console.log(
      "Approved:",
      finalApproved
    );

    console.log(
      "Normalized Checks:",
      normalizedChecks
    );

    console.log(
      "All Checks Passed:",
      allChecksPassed
    );

    console.log(
      "==========================================="
    );

    // ==========================================
    // REJECT
    // ==========================================

    if (!finalApproved) {
      donation.verification = {
        scannedAt: new Date(),
        checks: checksArray,
        approved: false,
        verifiedAt: new Date(),
        rejectionReason:
          rejectionReason ||
          "Food failed the safety verification.",
      };

      donation.pipelineStatus = "Rejected";
      donation.status = "Rejected";

      donation.statusHistory.push({
        status: "Rejected",
        changedAt: new Date(),
        changedBy: req.user._id,
        note:
          rejectionReason ||
          "Food failed the safety verification.",
      });

      await donation.save();

      // Notify donor
      if (donation.donor) {
        getIO()
          .to(
            rooms.restaurant(
              donation.donor.toString()
            )
          )
          .emit(
            "donation:updated",
            donation
          );
      }

      // Notify NGO
      getIO()
        .to(
          rooms.ngo(
            req.user._id.toString()
          )
        )
        .emit(
          "donation:updated",
          donation
        );

      // Notify admin
      getIO()
        .to(rooms.admins())
        .emit(
          "donation:updated",
          donation
        );

      return res.json({
        success: true,
        message:
          "Donation verification rejected.",
        donation,
      });
    }

    // ==========================================
    // SAFETY CHECKS FAILED
    // ==========================================
    //
    // Important:
    // approved=true কিন্তু ৪টা check complete না হলে
    // ভুল করে Rejected করা হবে না।
    //
    // Instead frontend/backend কে clear error দেওয়া হবে.
    //
    // ==========================================

    if (!allChecksPassed) {
      return res.status(400).json({
        success: false,
        message:
          "All four safety checks must be completed before verification.",
        checks: normalizedChecks,
      });
    }

    // ==========================================
    // SUCCESSFUL VERIFICATION
    // ==========================================

    donation.verification = {
      scannedAt: new Date(),
      checks: checksArray,
      approved: true,
      verifiedAt: new Date(),
      rejectionReason: "",
    };

    // ==========================================
    // VERIFICATION = COMPLETED
    // ==========================================

    donation.pipelineStatus = "Completed";
    donation.status = "Completed";

    donation.statusHistory.push({
      status: "Completed",
      changedAt: new Date(),
      changedBy: req.user._id,
      note: `Donation verified and completed by ${ngo.organizationId
        }.`,
    });

    await donation.save();

    // ==========================================
    // GET UPDATED DONATION
    // ==========================================

    const updated =
      await Donation.findById(donation._id)
        .populate(
          "donor",
          "name email role"
        )
        .populate({
          path:
            "ngoRequest.requestedBy",
          select:
            "organizationId phone address user",
          populate: {
            path: "user",
            select: "name email",
          },
        });

    // ==========================================
    // DONOR NOTIFICATION
    // ==========================================

    if (updated.donor?._id) {
      getIO()
        .to(
          rooms.restaurant(
            updated.donor._id.toString()
          )
        )
        .emit(
          "donation:updated",
          updated
        );
    }

    // ==========================================
    // NGO NOTIFICATION
    // ==========================================

    getIO()
      .to(
        rooms.ngo(
          req.user._id.toString()
        )
      )
      .emit(
        "donation:updated",
        updated
      );

    // ==========================================
    // ADMIN NOTIFICATION
    // ==========================================

    getIO()
      .to(rooms.admins())
      .emit(
        "donation:updated",
        updated
      );

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.json({
      success: true,
      message:
        "Donation verified successfully and marked as Completed.",
      donation: updated,
    });
  } catch (error) {
    console.error(
      "Verify Donation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while verifying donation.",
      error: error.message,
    });
  }
};

// ======================================================
// REJECT DONATION
// ======================================================
const rejectDonation = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const ngo =
      await getCurrentNgo(
        req.user._id
      );

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message:
          "NGO profile not found.",
      });
    }

    const donation =
      await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message:
          "Donation not found.",
      });
    }

    const requestedBy =
      donation.ngoRequest
        ?.requestedBy;

    if (
      !requestedBy ||
      requestedBy.toString() !==
        ngo._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to reject this donation.",
      });
    }

    const rejectionReason =
      req.body?.rejectionReason ||
      "Donation rejected by NGO.";

    donation.pipelineStatus =
      "Rejected";

    donation.status =
      "Rejected";

    donation.verification = {
      ...(donation.verification || {}),
      approved: false,
      rejectionReason,
    };

    donation.statusHistory.push({
      status: "Rejected",
      changedAt: new Date(),
      changedBy:
        req.user._id,
      note: rejectionReason,
    });

    await donation.save();

    // =====================================
    // CREATE DONOR NOTIFICATION
    // =====================================
    if (donation.donor) {
      await createNotification({
        recipient:
          donation.donor.toString(),

        type:
          "DONATION_REJECTED",

        title:
          "Donation Rejected",

        message:
          `Your donation "${donation.foodName}" has been rejected by an NGO.`,

        donation:
          donation._id,

        data: {
          role: "donor",
          donationId:
            donation.donationId,
          action:
            "view-donation",
        },
      });
    }

    // =====================================
    // REAL-TIME DONATION UPDATE - DONOR
    // =====================================
    if (donation.donor) {
      getIO()
        .to(
          rooms.restaurant(
            donation.donor.toString()
          )
        )
        .emit(
          "donation:updated",
          donation
        );
    }

    // =====================================
    // REAL-TIME DONATION UPDATE - NGO
    // =====================================
    getIO()
      .to(
        rooms.ngo(
          req.user._id.toString()
        )
      )
      .emit(
        "donation:updated",
        donation
      );

    // =====================================
    // REAL-TIME DONATION UPDATE - ADMINS
    // =====================================
    getIO()
      .to(rooms.admins())
      .emit(
        "donation:updated",
        donation
      );

    return res.json({
      success: true,
      message:
        "Donation rejected successfully.",
      donation,
    });
  } catch (error) {
    console.error(
      "Reject Donation Error:",
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
//
//======================================================
// GET DONOR DONATIONS
// ======================================================
const getDonorDonations = async (
  req,
  res
) => {
  try {
    const { donorId } =
      req.params;

    if (!donorId) {
      return res.status(400).json({
        success: false,
        message:
          "Donor ID is required.",
      });
    }

    const donations =
      await Donation.find({
        donor: donorId,
      })
        .populate(
          "donor",
          "name email role"
        )
        .populate({
          path:
            "ngoRequest.requestedBy",
          select:
            "organizationId phone address user",
          populate: {
            path: "user",
            select:
              "name email",
          },
        })
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error(
      "Get Donor Donations Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch donor donations.",
      error: error.message,
    });
  }
};

// ======================================================
// GET DONOR DASHBOARD
// ======================================================
const getDonorDashboard = async (
  req,
  res
) => {
  try {
    const { donorId } =
      req.params;

    if (!donorId) {
      return res.status(400).json({
        success: false,
        message:
          "Donor ID is required.",
      });
    }

    const donations =
      await Donation.find({
        donor: donorId,
      })
        .populate({
          path:
            "ngoRequest.requestedBy",
          select:
            "organizationId phone address organizationName user",
          populate: {
            path: "user",
            select:
              "name email",
          },
        })
        .sort({
          createdAt: -1,
        });

    // ==================================================
    // BASIC COUNTS
    // ==================================================

    const total =
      donations.length;

    const pending =
      donations.filter(
        (donation) =>
          donation.pipelineStatus ===
          "Pending"
      ).length;

    const accepted =
      donations.filter(
        (donation) =>
          donation.pipelineStatus ===
          "Accepted"
      ).length;

    const outForDelivery =
      donations.filter(
        (donation) =>
          donation.pipelineStatus ===
          "Out for Delivery"
      ).length;

    const completed =
      donations.filter(
        (donation) =>
          donation.pipelineStatus ===
          "Completed"
      ).length;

    const rejected =
      donations.filter(
        (donation) =>
          donation.pipelineStatus ===
          "Rejected"
      ).length;

    // ==================================================
    // COMPLETED DONATIONS
    //
    // Environmental impact, meals served,
    // food waste diverted and categories
    // are calculated ONLY from completed donations.
    // ==================================================

    const completedDonationList =
      donations.filter(
        (donation) =>
          donation.pipelineStatus ===
          "Completed"
      );

    // ==================================================
    // MEALS SERVED
    // ==================================================

    const mealsServed =
      completedDonationList.reduce(
        (totalMeals, donation) => {
          const meals =
            Number(
              donation.estimatedMeals
            );

          if (
            !Number.isNaN(meals) &&
            meals >= 0
          ) {
            return (
              totalMeals + meals
            );
          }

          return (
            totalMeals +
            Math.floor(
              (Number(
                donation.quantity
              ) || 0) * 4
            )
          );
        },
        0
      );

    // ==================================================
    // FOOD WASTE DIVERTED
    // ==================================================

    const foodWasteDiverted =
      completedDonationList.reduce(
        (totalQuantity, donation) =>
          totalQuantity +
          (Number(
            donation.quantity
          ) || 0),
        0
      );

    // ==================================================
    // TODAY'S DONATIONS
    // ==================================================

    const today =
      new Date();

    const startOfDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

    const endOfDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );

    const todayDonations =
      donations.filter(
        (donation) => {
          const createdAt =
            new Date(
              donation.createdAt
            );

          return (
            createdAt >=
            startOfDay &&
            createdAt <
            endOfDay
          );
        }
      ).length;

    // ==================================================
    // ACTIVE DONATIONS
    //
    // Completed and Rejected donations are NOT active.
    // ==================================================

    const activeDonations =
      donations.filter(
        (donation) =>
          ![
            "Completed",
            "Rejected",
          ].includes(
            donation.pipelineStatus
          )
      ).length;

    // ==================================================
    // RECENT DONATIONS
    // ==================================================

    const recentDonations =
      donations
        .slice(0, 5)
        .map((donation) => ({
          _id:
            donation._id,

          donationId:
            donation.donationId,

          foodName:
            donation.foodName,

          foodType:
            donation.foodType,

          foodCategory:
            donation.foodCategory,

          quantity:
            donation.quantity,

          estimatedMeals:
            donation.estimatedMeals,

          status:
            donation.status,

          pipelineStatus:
            donation.pipelineStatus,

          createdAt:
            donation.createdAt,

          ngoRequest:
            donation.ngoRequest,

          deliveryMan:
            donation.deliveryMan,
        }));

    // ==================================================
    // PICKUP TRACKER
    //
    // IMPORTANT:
    // COMPLETED donations are immediately removed
    // from the pickup tracker.
    // ==================================================

    const pickupDonations =
      donations.filter(
        (donation) => {
          const pipelineStatus =
            donation.pipelineStatus;

          const status =
            donation.status;

          return (
            [
              "Accepted",
              "Out for Delivery",
            ].includes(
              pipelineStatus
            ) ||
            [
              "Delivery Man Assigned",
              "Food Picked Up",
            ].includes(status)
          );
        }
      );

    // ==================================================
    // NGO PARTNERS
    //
    // Every NGO that has requested at least
    // one donation from this donor.
    //
    // Same NGO is grouped together and all
    // donation request history is stored
    // inside history[].
    // ==================================================

    const ngoMap =
      new Map();

    donations.forEach(
      (donation) => {
        const ngo =
          donation.ngoRequest
            ?.requestedBy;

        // Donation without an NGO request
        // is not an NGO partner.
        if (!ngo?._id) {
          return;
        }

        const ngoId =
          ngo._id.toString();

        // ----------------------------------------------
        // CREATE NGO ENTRY
        // ----------------------------------------------

        if (!ngoMap.has(ngoId)) {
          ngoMap.set(ngoId, {
            id: ngo._id,

            _id: ngo._id,

            // NGO NAME
            name:
              ngo.user?.name ||
              ngo.organizationName ||
              ngo.organizationId ||
              "NGO Partner",

            organizationName:
              ngo.organizationName ||
              "",

            organizationId:
              ngo.organizationId ||
              "",

            phone:
              ngo.phone || "",

            address:
              ngo.address || "",

            status: "Active",

            // Statistics
            requestCount: 0,

            meals: 0,

            quantity: 0,

            completed: 0,

            // Last request date
            lastRequest: null,

            // Complete history
            history: [],
          });
        }

        const partner =
          ngoMap.get(ngoId);

        // ----------------------------------------------
        // REQUEST COUNT
        // ----------------------------------------------

        partner.requestCount +=
          1;

        // ----------------------------------------------
        // QUANTITY
        // ----------------------------------------------

        // Quantity, meals and completed count
        // are updated only after the donation
        // is actually completed.
        if (
          donation.pipelineStatus ===
          "Completed"
        ) {
          partner.quantity +=
            Number(
              donation.quantity
            ) || 0;

          // ----------------------------------------------
          // MEALS
          // ----------------------------------------------

          const estimatedMeals =
            Number(
              donation.estimatedMeals
            );

          if (
            !Number.isNaN(
              estimatedMeals
            ) &&
            estimatedMeals >= 0
          ) {
            partner.meals +=
              estimatedMeals;
          } else {
            partner.meals +=
              Math.floor(
                (Number(
                  donation.quantity
                ) || 0) * 4
              );
          }

          partner.completed +=
            1;
        }

        // ----------------------------------------------
        // LAST REQUEST
        //
        // ngoRequest.requestedAt is preferred.
        // createdAt is fallback.
        // ----------------------------------------------

        const requestDate =
          donation.ngoRequest
            ?.requestedAt ||
          donation.createdAt;

        if (
          !partner.lastRequest ||
          new Date(
            requestDate
          ) >
          new Date(
            partner.lastRequest
          )
        ) {
          partner.lastRequest =
            requestDate;
        }

        // ----------------------------------------------
        // DONATION REQUEST HISTORY
        // ----------------------------------------------

        partner.history.push({
          _id:
            donation._id,

          donationId:
            donation.donationId,

          foodName:
            donation.foodName ||
            "Food Donation",

          foodType:
            donation.foodType ||
            "",

          foodCategory:
            donation.foodCategory ||
            "",

          quantity:
            Number(
              donation.quantity
            ) || 0,

          estimatedMeals:
            Number(
              donation.estimatedMeals
            ) || 0,

          status:
            donation.status ||
            "",

          pipelineStatus:
            donation.pipelineStatus ||
            "",

          requestedAt:
            donation.ngoRequest
              ?.requestedAt ||
            null,

          acceptedAt:
            donation.ngoRequest
              ?.acceptedAt ||
            null,

          createdAt:
            donation.createdAt,

          completedAt:
            donation.pipelineStatus ===
              "Completed"
              ? donation.updatedAt
              : null,
        });
      }
    );

    // ==================================================
    // SORT NGO HISTORY
    // Newest request first
    // ==================================================

    const ngoPartners =
      Array.from(
        ngoMap.values()
      ).map((partner) => {
        partner.history.sort(
          (a, b) => {
            const dateA =
              new Date(
                a.requestedAt ||
                a.createdAt
              );

            const dateB =
              new Date(
                b.requestedAt ||
                b.createdAt
              );

            return (
              dateB - dateA
            );
          }
        );

        return partner;
      });

    // ==================================================
    // FOOD CATEGORIES
    //
    // Use foodCategory primarily.
    // Fallback to foodType.
    // Only completed donations are counted.
    // ==================================================

    const categoryMap =
      new Map();

    completedDonationList.forEach(
      (donation) => {
        const category =
          (
            donation.foodCategory ||
            donation.foodType ||
            "Other"
          ).trim();

        if (
          !categoryMap.has(
            category
          )
        ) {
          categoryMap.set(
            category,
            {
              name: category,

              count: 0,

              meals: 0,

              quantity: 0,
            }
          );
        }

        const categoryData =
          categoryMap.get(
            category
          );

        // Total donations
        categoryData.count +=
          1;

        // Total quantity
        categoryData.quantity +=
          Number(
            donation.quantity
          ) || 0;

        // Total meals
        const estimatedMeals =
          Number(
            donation.estimatedMeals
          );

        if (
          !Number.isNaN(
            estimatedMeals
          ) &&
          estimatedMeals >= 0
        ) {
          categoryData.meals +=
            estimatedMeals;
        } else {
          categoryData.meals +=
            Math.floor(
              (Number(
                donation.quantity
              ) || 0) * 4
            );
        }
      }
    );

    // ==================================================
    // TOTAL CATEGORY MEALS
    // ==================================================

    const totalCategoryMeals =
      Array.from(
        categoryMap.values()
      ).reduce(
        (total, category) =>
          total +
          category.meals,
        0
      );

    // ==================================================
    // FINAL CATEGORY DATA
    // ==================================================

    const categories =
      Array.from(
        categoryMap.values()
      )
        .map((category) => {
          const percent =
            totalCategoryMeals >
              0
              ? (
                (category.meals /
                  totalCategoryMeals) *
                100
              ).toFixed(1)
              : 0;

          return {
            name:
              category.name,

            count:
              category.count,

            meals:
              category.meals,

            quantity:
              Number(
                category.quantity.toFixed(
                  2
                )
              ),

            percent:
              Number(percent),
          };
        })
        .sort(
          (a, b) =>
            b.meals - a.meals
        )
        .slice(0, 5);
    // ==================================================
    // ENVIRONMENTAL IMPACT
    //
    // Based on COMPLETED donations.
    // ==================================================

    const carbonPrevented =
      Number(
        (
          foodWasteDiverted *
          2.5
        ).toFixed(2)
      );

    const treesEquivalent =
      Number(
        (
          carbonPrevented /
          21
        ).toFixed(2)
      );

    const waterSaved =
      Number(
        (
          foodWasteDiverted *
          1000
        ).toFixed(2)
      );

    // ==================================================
    // ANNUAL GOAL
    //
    // Goal is based on 1000 KG.
    // Progress = completed food waste / 1000 KG.
    // Maximum 100%.
    // ==================================================

    const annualTargetKg = 1000;

    const annualGoal =
      Math.min(
        Math.max(
          (
            foodWasteDiverted /
            annualTargetKg
          ) *
          100,
          0
        ),
        100
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.json({
      success: true,

      dashboard: {
        // ----------------------------------------------
        // BASIC STATS
        // ----------------------------------------------

        totalDonations:
          total,

        todayDonations:
          todayDonations,

        mealsServed:
          mealsServed,

        foodWasteDiverted:
          Number(
            foodWasteDiverted.toFixed(
              2
            )
          ),

        activeDonations:
          activeDonations,

        pendingDonations:
          pending,

        acceptedDonations:
          accepted,

        outForDelivery:
          outForDelivery,

        completedDonations:
          completed,

        rejectedDonations:
          rejected,

        // ----------------------------------------------
        // ENVIRONMENTAL IMPACT
        // ----------------------------------------------

        carbonPrevented:
          carbonPrevented,

        treesEquivalent:
          treesEquivalent,

        waterSaved:
          waterSaved,

        annualGoal:
          Number(
            annualGoal.toFixed(1)
          ),

        // ----------------------------------------------
        // RECENT DONATIONS
        // ----------------------------------------------

        recentDonations:
          recentDonations,

        // ----------------------------------------------
        // PICKUP TRACKER
        // ----------------------------------------------

        pickupDonations:
          pickupDonations,

        // ----------------------------------------------
        // NGO PARTNERS
        // ----------------------------------------------

        ngoPartners:
          ngoPartners,

        // ----------------------------------------------
        // TOP FOOD CATEGORIES
        // ----------------------------------------------

        categories:
          categories,

        // ----------------------------------------------
        // STATS OBJECT
        // ----------------------------------------------

        stats: {
          total,
          pending,
          accepted,
          outForDelivery,
          completed,
          rejected,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get Donor Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch dashboard.",

      error: error.message,
    });
  }
};

// ======================================================
// LIST AVAILABLE DONATIONS
// ======================================================
const listAvailableDonations = async (
  req,
  res
) => {
  try {
    const {
      latitude,
      longitude,
    } = req.query;

    const donations =
      await Donation.find({
        pipelineStatus:
          "Pending",
      })
        .populate(
          "donor",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    const result = [];

    for (const donation of donations) {
      const item =
        donation.toObject();

      try {
        const restaurant =
          await Restaurant.findOne({
            user:
              donation.donor?._id,
          });

        if (restaurant) {
          item.restaurant =
            restaurant;
        }
      } catch (
      restaurantError
      ) {
        console.error(
          "Restaurant profile error:",
          restaurantError
        );
      }

      try {
        const location =
          await resolveDonationLocation(
            donation
          );

        if (location) {
          item.location =
            location;

          if (
            latitude !==
            undefined &&
            longitude !==
            undefined &&
            location.latitude !==
            undefined &&
            location.longitude !==
            undefined
          ) {
            item.distance =
              haversineKm(
                Number(
                  latitude
                ),
                Number(
                  longitude
                ),
                Number(
                  location.latitude
                ),
                Number(
                  location.longitude
                )
              );
          }
        }
      } catch (
      locationError
      ) {
        console.error(
          "Donation location error:",
          locationError
        );
      }

      result.push(item);
    }

    if (
      latitude !==
      undefined &&
      longitude !==
      undefined
    ) {
      result.sort(
        (a, b) => {
          if (
            a.distance == null
          )
            return 1;

          if (
            b.distance == null
          )
            return -1;

          return (
            a.distance -
            b.distance
          );
        }
      );
    }

    return res.json({
      success: true,
      donations: result,
    });
  } catch (error) {
    console.error(
      "List Available Donations Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch available donations.",
      error: error.message,
    });
  }
};

// ======================================================
// ACCEPT DONATION
// ======================================================
const acceptDonation = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const donation = await Donation.findById(id)
      .populate("donor", "name email role");

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    if (donation.pipelineStatus !== "Pending") {
      return res.status(409).json({
        success: false,
        message: `This donation is already ${
          donation.pipelineStatus || ""
        } and can no longer be accepted.`,
      });
    }

    const ngo = await getCurrentNgo(req.user._id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    console.log("ACCEPT NGO DETAILS:", {
      mongoId: ngo._id?.toString(),
      userId: ngo.user?.toString(),
      organizationId: ngo.organizationId,
    });

    const now = new Date();

    donation.pipelineStatus = "Accepted";
    donation.status = "NGO Requested";

    donation.ngoRequest = {
      requested: true,
      requestedBy: ngo._id,
      requestedAt: now,
      acceptedAt: now,
    };

    donation.statusHistory.push({
      status: "Accepted",
      changedAt: now,
      changedBy: req.user._id,
      note: `Accepted by ${ngo.organizationId}`,
    });

    await donation.save();

    // =========================================
    // PERSISTENT NOTIFICATION TO DONOR
    // =========================================

    // Donor is populated, so use its actual MongoDB _id.
    const donorId =
      donation.donor?._id || donation.donor;

    if (donorId) {
      const createdNotification =
        await createNotification({
          recipient: donorId.toString(),
          type: "DONATION_ACCEPTED",
          title: "Donation Accepted",
          message: `Your donation "${donation.foodName}" has been accepted by an NGO.`,
          donation: donation._id,
          data: {
            role: "donor",
            donationId: donation.donationId,
            action: "view-donation",
          },
        });

      if (createdNotification) {
        console.log(
          "DONOR NOTIFICATION SAVED:",
          createdNotification._id?.toString()
        );
      } else {
        console.error(
          "DONOR NOTIFICATION FAILED:",
          {
            donorId: donorId.toString(),
            donationId: donation._id.toString(),
          }
        );
      }
    } else {
      console.error(
        "DONOR NOTIFICATION SKIPPED: donor ID missing.",
        donation._id.toString()
      );
    }

    // =========================================
    // GET UPDATED DONATION
    // =========================================

    const updated = await Donation.findById(id)
      .populate("donor", "name email role")
      .populate({
        path: "ngoRequest.requestedBy",
        select: "organizationId phone address user",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    // =========================================
    // REAL-TIME UPDATE TO DONOR
    // =========================================

    if (updated?.donor?._id) {
      getIO()
        .to(
          rooms.restaurant(
            updated.donor._id.toString()
          )
        )
        .emit("donation:updated", updated);
    }

    // =========================================
    // REAL-TIME UPDATE TO ALL NGOs
    // =========================================

    getIO()
      .to(rooms.ngos())
      .emit("donation:updated", updated);

    // =========================================
    // REAL-TIME UPDATE TO CURRENT NGO
    // =========================================

    getIO()
      .to(
        rooms.ngo(
          req.user._id.toString()
        )
      )
      .emit("donation:updated", updated);

    // =========================================
    // REAL-TIME UPDATE TO ADMINS
    // =========================================

    getIO()
      .to(rooms.admins())
      .emit("donation:updated", updated);

    return res.status(200).json({
      success: true,
      message: "Donation accepted successfully.",
      donation: updated,
    });
  } catch (error) {
    console.error(
      "Accept Donation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to accept donation.",
      error: error.message,
    });
  }
};

// ======================================================
// PIPELINE ORDER
// ======================================================
const PIPELINE_ORDER = [
  "Pending",
  "Accepted",
  "Out for Delivery",
  "Completed",
];

// ======================================================
// UPDATE DONATION STATUS
// ======================================================
const updateDonationStatus = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const {
      status: nextStatus,
    } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Out for Delivery",
      "Rejected",
    ];

    if (
      !allowedStatuses.includes(
        nextStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid donation status.",
      });
    }

    // Completed is handled automatically
    // after successful verification.
    if (
      nextStatus ===
      "Completed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Donation is completed automatically after successful verification. No manual completion is required.",
      });
    }

    const donation =
      await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message:
          "Donation not found.",
      });
    }

    const currentIndex =
      PIPELINE_ORDER.indexOf(
        donation.pipelineStatus
      );

    const nextIndex =
      PIPELINE_ORDER.indexOf(
        nextStatus
      );

    // Rejected is handled separately.
    if (
      nextStatus !==
      "Rejected"
    ) {
      if (
        nextIndex === -1 ||
        (
          currentIndex !== -1 &&
          nextIndex <
          currentIndex
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Donation status cannot move backwards.",
        });
      }
    }

    donation.pipelineStatus =
      nextStatus;

    donation.status =
      nextStatus;

    donation.statusHistory.push({
      status:
        nextStatus,
      changedAt:
        new Date(),
      changedBy:
        req.user._id,
      note:
        `Donation status changed to ${nextStatus}.`,
    });

    await donation.save();

    const updated =
      await Donation.findById(id)
        .populate(
          "donor",
          "name email role"
        )
        .populate({
          path:
            "ngoRequest.requestedBy",
          select:
            "organizationId phone address user",
          populate: {
            path: "user",
            select:
              "name email",
          },
        });

    if (updated.donor?._id) {
      getIO()
        .to(
          rooms.restaurant(
            updated.donor._id.toString()
          )
        )
        .emit(
          "donation:updated",
          updated
        );
    }

    if (
      updated.ngoRequest
        ?.requestedBy
    ) {
      getIO()
        .to(
          rooms.ngo(
            updated.ngoRequest
              .requestedBy
              ._id
              .toString()
          )
        )
        .emit(
          "donation:updated",
          updated
        );
    }

    getIO()
      .to(rooms.admins())
      .emit(
        "donation:updated",
        updated
      );

    return res.status(200).json({
      success: true,
      message:
        "Donation status updated successfully.",
      donation: updated,
    });
  } catch (error) {
    console.error(
      "Update Donation Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update donation status.",
      error: error.message,
    });
  }
};

// ======================================================
// GET NGO DONATIONS
// ======================================================
const getNgoDonations = async (
  req,
  res
) => {
  try {
    const { ngoId } =
      req.params;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        message:
          "NGO ID is required.",
      });
    }

    let ngo = null;

    try {
      ngo =
        await Ngo.findById(
          ngoId
        );
    } catch (error) {
      // Invalid MongoDB ObjectId.
      // Ignore and try user ID below.
    }

    if (!ngo) {
      ngo =
        await Ngo.findOne({
          user: ngoId,
        });
    }

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message:
          "NGO profile not found.",
      });
    }

    console.log("FETCH NGO DETAILS:", {
      mongoId: ngo._id?.toString(),
      userId: ngo.user?.toString(),
      organizationId: ngo.organizationId,
    });

    const matchingDonation = await Donation.findOne({
      "ngoRequest.requestedBy": ngo._id,
    }).select("_id donationId ngoRequest pipelineStatus status");

    console.log("MATCHING DONATION:", matchingDonation);

    const donations =
      await Donation.find({
        "ngoRequest.requestedBy":
          ngo._id,
      })
        .populate(
          "donor",
          "name email role"
        )
        .populate({
          path:
            "ngoRequest.requestedBy",
          select:
            "organizationId phone address user",
          populate: {
            path: "user",
            select:
              "name email",
          },
        })
        .sort({
          createdAt: -1,
        });

    // ==================================================
    // ACTIVE DONATIONS
    //
    // Completed and Rejected donations are archived.
    // ==================================================

    const active =
      donations.filter(
        (donation) =>
          ![
            "Completed",
            "Rejected",
          ].includes(
            donation.pipelineStatus
          )
      );

    // ==================================================
    // ARCHIVED DONATIONS
    // ==================================================

    const archived =
      donations.filter(
        (donation) =>
          [
            "Completed",
            "Rejected",
          ].includes(
            donation.pipelineStatus
          )
      );

    console.log(
      `NGO Donations Loaded | NGO: ${ngo.organizationId ||
      ngo._id
      } | Total: ${donations.length
      } | Active: ${active.length
      }`
    );

    return res.status(200).json({
      success: true,

      ngoId:
        ngo._id,

      userId:
        ngo.user,

      donations,

      active,

      archived,
    });
  } catch (error) {
    console.error(
      "Get NGO Donations Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch NGO donations.",
      error: error.message,
    });
  }
};

// ======================================================
// ASSIGN DELIVERY DRIVER
// ======================================================

const assignDeliveryDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      vehicleNumber,
    } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // -----------------------------------------------
    // CURRENT NGO
    // -----------------------------------------------

    const ngo = await getCurrentNgo(req.user._id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!name || !phone || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Driver name, phone and vehicle number are required.",
      });
    }

    // -----------------------------------------------
    // NGO ID DEBUG
    // -----------------------------------------------

    console.log("NGO ID DEBUG:", {
      mongoNgoId: ngo._id.toString(),
      organizationId: ngo.organizationId,
      userId: ngo.user?.toString(),
    });

    // -----------------------------------------------
    // FIND DONATION
    // -----------------------------------------------

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    // -----------------------------------------------
    // ONLY ACCEPTED DONATIONS
    // CAN HAVE A DRIVER ASSIGNED
    // -----------------------------------------------

    if (donation.pipelineStatus !== "Accepted") {
      return res.status(400).json({
        success: false,
        message:
          "Driver can only be assigned to an accepted donation.",
      });
    }

    // -----------------------------------------------
    // NGO OWNERSHIP
    // -----------------------------------------------

    const requestedBy =
      donation.ngoRequest?.requestedBy;

    if (
      !requestedBy ||
      requestedBy.toString() !== ngo._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to assign a driver for this donation.",
      });
    }

    // -----------------------------------------------
    // ASSIGN DRIVER
    // -----------------------------------------------

    donation.deliveryMan = {
      name,
      phone,
      vehicleNumber,
      assignedAt: new Date(),
    };

    donation.status = "Delivery Man Assigned";

    donation.statusHistory.push({
      status: "Delivery Man Assigned",
      changedAt: new Date(),
      changedBy: req.user._id,
      note: `Delivery driver ${name} assigned.`,
    });

    await donation.save();

    // -----------------------------------------------
    // FETCH UPDATED DONATION
    // -----------------------------------------------

    const updated = await Donation.findById(id)
      .populate("donor", "name email role")
      .populate({
        path: "ngoRequest.requestedBy",
        select: "organizationId phone address user",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    // -----------------------------------------------
    // REAL-TIME UPDATE
    // -----------------------------------------------

    if (updated.donor?._id) {
      getIO()
        .to(
          rooms.restaurant(
            updated.donor._id.toString()
          )
        )
        .emit("donation:updated", updated);
    }

    getIO()
      .to(
        rooms.ngo(req.user._id.toString())
      )
      .emit("donation:updated", updated);

    getIO()
      .to(rooms.admins())
      .emit("donation:updated", updated);

    return res.status(200).json({
      success: true,
      message:
        "Delivery driver assigned successfully.",
      donation: updated,
    });

  } catch (error) {
    console.error(
      "Assign Delivery Driver Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to assign delivery driver.",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
  createDonation,

  getDonationById,
  getDonationByDonationId,

  verifyDonation,
  rejectDonation,

  getDonorDonations,
  getDonorDashboard,

  listAvailableDonations,
  acceptDonation,

  updateDonationStatus,

  getNgoDonations,
  assignDeliveryDriver,
};