const Donation = require("../models/Donation");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const QRCode = require("qrcode");
const { getIO, rooms } = require("../utils/socket");
const { createNotification } = require("../utils/notificationUtils");


const Feedback = require("../models/Feedback");


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
// NGO NAME HELPER
// ======================================================
const getNgoDisplayName = (ngo) => {
  return (
    ngo?.organizationName ||
    ngo?.user?.name ||
    ngo?.organizationId ||
    "NGO"
  );
};

// ======================================================
// NOTIFY DONOR ABOUT NGO ACTION
// ======================================================
const notifyDonorAboutNgoAction = async ({
  donation,
  ngo,
  type,
  actionMessage,
}) => {
  try {
    if (!donation?.donor || !ngo) return;

    const ngoName = getNgoDisplayName(ngo);

    await createNotification({
      recipient: donation.donor.toString(),
      type,
      title: ngoName,
      message: `${actionMessage}: ${donation.foodName || "your donation"}.`,
      donation: donation._id,
      data: {
        role: "donor",
        donationId: donation.donationId,
        donationObjectId: donation._id,
        ngoId: ngo._id,
        action: "view-donation",
      },
    });
  } catch (error) {
    console.error("Donor NGO action notification error:", error);
  }
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
        message: "Food name and food type are required.",
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
        message: "Safety declaration must be confirmed.",
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

    if (
      Number.isNaN(finalQuantity) ||
      finalQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity.",
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

      // FOOD INFORMATION
      foodName,
      foodType,
      quantity: finalQuantity,
      cookingTime,
      bestBefore,

      // FOOD CONDITION / CATEGORY
      condition: finalCondition,
      foodCondition: finalCondition,
      foodCategory,
      storageCondition,

      // PICKUP INFORMATION
      pickupAddress: finalPickupAddress,
      address: finalPickupAddress,

      pickupDate,
      pickupTime,
      contactNumber,
      pickupDuration,

      specialInstructions:
        specialInstructions || "",

      // LOCATION
      latitude:
        latitude !== undefined && latitude !== ""
          ? Number(latitude)
          : undefined,

      longitude:
        longitude !== undefined && longitude !== ""
          ? Number(longitude)
          : undefined,

      // SAFETY
      safetyDeclaration:
        Boolean(finalSafetyDeclaration),

      safetyConfirmed:
        Boolean(finalSafetyDeclaration),

      // NGO REQUEST
      ngoRequest: {
        requested: false,
        requestedBy: null,
        requestedAt: null,
        acceptedAt: null,
      },

      // DELIVERY MAN
      deliveryMan: {
        name: "",
        phone: "",
        vehicleNumber: "",
        assignedAt: null,
      },

      // VERIFICATION
      verification: {
        scannedAt: null,
        checks: [],
        approved: false,
        verifiedAt: null,
        rejectionReason: "",
      },

      // QR CODE
      qrCode,

      // STATUS
      status: "Waiting for NGO Acceptance",
      pipelineStatus: "Pending",

      // STATUS HISTORY
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
    
    // ==================================================
    // NOTIFY ADMINS (Immediate)
    // ==================================================
    getIO()
      .to(rooms.admins())
      .emit("donation:new", donation);

    // ==================================================
    // PRIORITY NOTIFICATION SYSTEM (Instant for Followers ONLY)
    // ==================================================
    try {
      const Follow = require("../models/Follow");

      // এখানে followingId এর বদলে সঠিক ফিল্ড 'following' ব্যবহার করা হলো
      const followers = await Follow.find({
        following: donor, 
      });

      if (followers && followers.length > 0) {
        followers.forEach(async (f) => {
          // এখানে followerId এর বদলে সঠিক ফিল্ড 'follower' ব্যবহার করা হলো
          const ngoUser = f.follower;

          if (ngoUser) {
            await createNotification({
              recipient: ngoUser.toString(),
              type: "PRIORITY_DONATION",
              title: "🔥 Alert: Followed Restaurant Posted!",
              message: `Your partner restaurant posted a new donation: "${foodName || "Food"}"`,
              donation: donation._id,
              data: {
                role: "ngo",
                donationId: donation.donationId,
                action: "view-donation",
              },
            });

            // শুধু ফলোয়ার এনজিওদের কাছে ইনস্ট্যান্ট সকেট পাঠানো
            getIO()
              .to(rooms.ngo(ngoUser.toString()))
              .emit("donation:priority-new", donation);
          }
        });
      }
    } catch (notifErr) {
      console.error(
        "Priority notification error:",
        notifErr
      );
    }

    // ==================================================
    // 5-MINUTES DELAYED PUBLIC BROADCAST TO ALL NGOS (setTimeout)
    // ==================================================
    // ৫ মিনিট (৩০০০০০ মিলি সেকেন্ড) পর সব এনজিওর পাবলিক লিস্টে যাবে
    setTimeout(() => {
      try {
        const io = getIO();
        if (io) {
          io.to(rooms.ngos()).emit("donation:new", donation);
        }
      } catch (delayErr) {
        console.error("Delayed public broadcast error:", delayErr);
      }
    }, 300000);

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(201).json({
      success: true,
      message: "Donation created successfully.",
      donation,
    });
  } catch (error) {
    console.error("Create Donation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create donation.",
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
    // ======================================================
// CREATE DONATION (Updated with Auto-Geocoding Support)
// ======================================================

const createDonation = async (req, res) => {
  try {
    const {
      donor,

      // Food information
      foodName,
      foodType,
      quantity,
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
        message: "Food name and food type are required.",
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
        message: "Safety declaration must be confirmed.",
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

    if (
      Number.isNaN(finalQuantity) ||
      finalQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity.",
      });
    }

    // ==================================================
    // RESOLVE LOCATION (AUTO GEOCODING FOR MAP PINS)
    // ==================================================
    let finalLat = latitude !== undefined && latitude !== "" ? Number(latitude) : undefined;
    let finalLng = longitude !== undefined && longitude !== "" ? Number(longitude) : undefined;

    let resolvedLocationObj = null;

    if (finalLat && finalLng && !Number.isNaN(finalLat) && !Number.isNaN(finalLng)) {
      resolvedLocationObj = { lat: finalLat, lng: finalLng };
    } else if (resolveDonationLocation) {
      // যদি ইউটিলিটি ফাংশন থাকে তা দিয়ে ট্রাই করবে
      try {
        const geoResult = await resolveDonationLocation(finalPickupAddress);
        if (geoResult && geoResult.lat && geoResult.lng) {
          resolvedLocationObj = { lat: Number(geoResult.lat), lng: Number(geoResult.lng) };
        }
      } catch (err) {
        console.error("Geo utility error:", err);
      }
    }

    // যদি এখনও কোঅর্ডিনেট না পাওয়া যায়, তবে Nominatim API ব্যবহার করে অটো জেনারেট করবে
    if (!resolvedLocationObj && finalPickupAddress) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalPickupAddress)}`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          resolvedLocationObj = {
            lat: parseFloat(geoData[0].lat),
            lng: parseFloat(geoData[0].lon)
          };
        }
      } catch (geoError) {
        console.error("Nominatim auto-geocoding error:", geoError);
      }
    }

    // ফলব্যাক হিসেবে ডিফল্ট চট্টগ্রাম কোঅর্ডিনেট (সদরঘাট এলাকা) সেট করা যেতে পারে যাতে ম্যাপে পিন মিসিং না হয়
    if (!resolvedLocationObj) {
      resolvedLocationObj = { lat: 22.3317, lng: 91.8315 };
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

      // FOOD INFORMATION
      foodName,
      foodType,
      quantity: finalQuantity,
      cookingTime,
      bestBefore,

      // FOOD CONDITION / CATEGORY
      condition: finalCondition,
      foodCondition: finalCondition,
      foodCategory,
      storageCondition,

      // PICKUP INFORMATION
      pickupAddress: finalPickupAddress,
      address: finalPickupAddress,

      pickupDate,
      pickupTime,
      contactNumber,
      pickupDuration,

      specialInstructions:
        specialInstructions || "",

      // LOCATION & RESOLVED LOCATION FOR MAP PINS
      latitude: resolvedLocationObj.lat,
      longitude: resolvedLocationObj.lng,
      resolvedLocation: resolvedLocationObj,

      // SAFETY
      safetyDeclaration:
        Boolean(finalSafetyDeclaration),

      safetyConfirmed:
        Boolean(finalSafetyDeclaration),

      // NGO REQUEST
      ngoRequest: {
        requested: false,
        requestedBy: null,
        requestedAt: null,
        acceptedAt: null,
      },

      // DELIVERY MAN
      deliveryMan: {
        name: "",
        phone: "",
        vehicleNumber: "",
        assignedAt: null,
      },

      // VERIFICATION
      verification: {
        scannedAt: null,
        checks: [],
        approved: false,
        verifiedAt: null,
        rejectionReason: "",
      },

      // QR CODE
      qrCode,

      // STATUS
      status: "Waiting for NGO Acceptance",
      pipelineStatus: "Pending",

      // STATUS HISTORY
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
    // NOTIFY ADMINS (Immediate)
    // ==================================================
    getIO()
      .to(rooms.admins())
      .emit("donation:new", donation);

    // ==================================================
    // PRIORITY NOTIFICATION SYSTEM (Instant for Followers ONLY)
    // ==================================================
    try {
      const Follow = require("../models/Follow");

      const followers = await Follow.find({
        following: donor, 
      });

      if (followers && followers.length > 0) {
        followers.forEach(async (f) => {
          const ngoUser = f.follower;

          if (ngoUser) {
            await createNotification({
              recipient: ngoUser.toString(),
              type: "PRIORITY_DONATION",
              title: "🔥 Alert: Followed Restaurant Posted!",
              message: `Your partner restaurant posted a new donation: "${foodName || "Food"}"`,
              donation: donation._id,
              data: {
                role: "ngo",
                donationId: donation.donationId,
                action: "view-donation",
              },
            });

            // শুধু ফলোয়ার এনজিওদের কাছে ইনস্ট্যান্ট সকেট পাঠানো
            getIO()
              .to(rooms.ngo(ngoUser.toString()))
              .emit("donation:priority-new", donation);
          }
        });
      }
    } catch (notifErr) {
      console.error(
        "Priority notification error:",
        notifErr
      );
    }

    // ==================================================
    // 5-MINUTES DELAYED PUBLIC BROADCAST TO ALL NGOS (setTimeout)
    // ==================================================
    // ৫ মিনিট (৩০০০০০ মিলি সেকেন্ড) পর সব এনজিওর পাবলিক লিস্টে যাবে
    setTimeout(() => {
      try {
        const io = getIO();
        if (io) {
          io.to(rooms.ngos()).emit("donation:new", donation);
        }
      } catch (delayErr) {
        console.error("Delayed public broadcast error:", delayErr);
      }
    }, 300000);

    // ==================================================
    // RESPONSE
    // ==================================================
    return res.status(201).json({
      success: true,
      message: "Donation created successfully.",
      donation,
    });
  } catch (error) {
    console.error("Create Donation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create donation.",
      error: error.message,
    });
  }
};
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
// NGO WITHDRAW / REJECT OWN REQUEST
// ======================================================
const rejectDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const ngo = await getCurrentNgo(req.user._id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    if (
      donation.selectedNgo &&
      donation.selectedNgo.toString() === ngo._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected NGO cannot withdraw after donor acceptance.",
      });
    }

    const request = donation.ngoRequests.find(
      (item) =>
        item.requestedBy.toString() === ngo._id.toString() &&
        item.status === "Pending"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Your pending request was not found.",
      });
    }

    request.status = "Rejected";
    request.respondedAt = new Date();

    await donation.save();

    const updated = await Donation.findById(id)
      .populate({
        path: "ngoRequests.requestedBy",
        select: "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    getIO()
      .to(rooms.restaurant(donation.donor.toString()))
      .emit("donation:updated", updated);

    getIO()
      .to(rooms.ngos())
      .emit("donation:updated", updated);

    return res.json({
      success: true,
      message: "Your donation request has been withdrawn.",
      donation: updated,
    });
  } catch (error) {
    console.error("Reject NGO Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to withdraw request.",
      error: error.message,
    });
  }
};

// ======================================================
// DONOR DECLINES AN NGO REQUEST
// ======================================================
const declineNgoRequest = async (req, res) => {
  try {
    const { id, ngoId } = req.params;
    const donorId = req.user.id;

    const donation = await Donation.findOne({
      _id: id,
      donor: donorId,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or unauthorized",
      });
    }

    if (
      donation.pipelineStatus !== "Pending" ||
      donation.selectedNgo
    ) {
      return res.status(400).json({
        success: false,
        message: "NGO requests can no longer be declined",
      });
    }

    const ngoRequest = donation.ngoRequests.find(
      (request) =>
        request.requestedBy.toString() === ngoId &&
        request.status === "Pending"
    );

    if (!ngoRequest) {
      return res.status(404).json({
        success: false,
        message: "Pending NGO request not found",
      });
    }

    ngoRequest.status = "Rejected";
    ngoRequest.respondedAt = new Date();

    await donation.save();

    const updatedDonation = await Donation.findById(id)
      .populate({
        path: "ngoRequests.requestedBy",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("donor", "name email");

    const io = getIO();

    // Notify the donor
    io.to(rooms.restaurant(donorId)).emit(
      "donation:updated",
      updatedDonation
    );

    // Notify the declined NGO
    const declinedNgo = await Ngo.findById(ngoId).select("user");

    if (declinedNgo?.user) {
      io.to(rooms.ngo(declinedNgo.user.toString())).emit(
        "donation:updated",
        updatedDonation
      );
    }

    // Update all NGO dashboards
    io.to(rooms.ngos()).emit(
      "donation:updated",
      updatedDonation
    );

    return res.status(200).json({
      success: true,
      message: "NGO request declined successfully",
      donation: updatedDonation,
    });
  } catch (error) {
    console.error("Decline NGO Request Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to decline NGO request",
      error: error.message,
    });
  }
};
//
//======================================================
// GET DONOR DONATIONS
// ======================================================
const getDonorDonations = async (req, res) => {
  try {
    const { donorId } = req.params;

    if (!donorId) {
      return res.status(400).json({
        success: false,
        message: "Donor ID is required.",
      });
    }

    const donations = await Donation.find({
      donor: donorId,
    })
      // Donor information
      .populate(
        "donor",
        "name email role"
      )

      // NGO selected/accepted by donor (legacy field)
      .populate({
        path: "ngoRequest.requestedBy",
        select:
          "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })

      // All NGOs that requested the donation
      .populate({
        path: "ngoRequests.requestedBy",
        select:
          "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })

      // NGO finally selected by donor
      .populate({
        path: "selectedNgo",
        select:
          "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })

      // Latest donations first
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
      message: "Failed to fetch donor donations.",
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
    const { donorId } = req.params;

    if (!donorId) {
      return res.status(400).json({
        success: false,
        message: "Donor ID is required.",
      });
    }

    const donations = await Donation.find({
      donor: donorId,
    })
      .populate({
        path: "ngoRequest.requestedBy",
        select: "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "ngoRequests.requestedBy",
        select: "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "selectedNgo",
        select: "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({
        createdAt: -1,
      });

    // ==================================================
    // NGO RATING AVERAGE
    // ONLY Donation.rating.score
    // ==================================================

    const ratedDonations = donations.filter(
      (donation) => {
        const score = Number(
          donation.rating?.score
        );

        return (
          donation.rating?.score !== null &&
          donation.rating?.score !== undefined &&
          Number.isFinite(score) &&
          score >= 1 &&
          score <= 5
        );
      }
    );

    const ratingCount = ratedDonations.length;

    const ratingAverage =
      ratingCount > 0
        ? Number(
          (
            ratedDonations.reduce(
              (totalRating, donation) =>
                totalRating +
                Number(donation.rating.score),
              0
            ) / ratingCount
          ).toFixed(1)
        )
        : 0;

    // ==================================================
    // RATINGS BY NGO
    // ==================================================

    const ratingsByNgo = ratedDonations
      .map((donation) => {
        const ngo =
          donation.ngoRequest?.requestedBy;

        if (!ngo?._id) {
          return null;
        }

        return {
          _id: donation._id,

          ngoId: ngo._id,

          ngoName:
            ngo.organizationName ||
            ngo.user?.name ||
            ngo.organizationId ||
            "NGO",

          donationId:
            donation.donationId ||
            donation._id.toString(),

          foodName:
            donation.foodName || "",

          score:
            Number(donation.rating.score),

          comment:
            donation.rating.comment || "",

          ratedAt:
            donation.rating.ratedAt || null,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b.ratedAt || 0) -
          new Date(a.ratedAt || 0)
      );

    // ==================================================
    // NGO FEEDBACK
    // ==================================================

    const feedbackDocuments = await Feedback.find({
      $or: [
        { donor: donorId },
        { restaurant: donorId },
      ],
    })
      .populate({
        path: "ngo",
        select:
          "organizationName organizationId user",
        populate: {
          path: "user",
          select: "name",
        },
      })
      .populate({
        path: "donation",
        select: "donationId foodName",
      })
      .sort({
        createdAt: -1,
      });

    const feedbackByNgo = feedbackDocuments.map(
      (feedback) => {
        const ngo = feedback.ngo;

        return {
          _id: feedback._id,

          ngoName:
            ngo?.organizationName ||
            ngo?.user?.name ||
            ngo?.organizationId ||
            "NGO",

          donationId:
            feedback.donation?.donationId ||
            feedback.donationId ||
            "",

          foodName:
            feedback.donation?.foodName || "",

          category:
            feedback.category || "",

          priority:
            feedback.priority || "",

          // Keep empty message empty.
          message:
            feedback.message || "",

          status:
            feedback.status || "",

          submittedAt:
            feedback.createdAt || null,
        };
      }
    );

    // ==================================================
    // BASIC COUNTS
    // ==================================================

    const total = donations.length;

    const pending = donations.filter(
      (donation) =>
        donation.pipelineStatus === "Pending"
    ).length;

    const accepted = donations.filter(
      (donation) =>
        donation.pipelineStatus === "Accepted"
    ).length;

    const outForDelivery = donations.filter(
      (donation) =>
        donation.pipelineStatus === "Out for Delivery"
    ).length;

    const completed = donations.filter(
      (donation) =>
        donation.pipelineStatus === "Completed"
    ).length;

    const rejected = donations.filter(
      (donation) =>
        donation.pipelineStatus === "Rejected"
    ).length;

    // ==================================================
    // COMPLETED DONATIONS
    // ==================================================

    const completedDonationList = donations.filter(
      (donation) =>
        donation.pipelineStatus === "Completed"
    );

    // ==================================================
    // MEALS SERVED
    // ==================================================

    const mealsServed = completedDonationList.reduce(
      (totalMeals, donation) => {
        const meals = Number(
          donation.estimatedMeals
        );

        if (
          !Number.isNaN(meals) &&
          meals >= 0
        ) {
          return totalMeals + meals;
        }

        return (
          totalMeals +
          Math.floor(
            (Number(donation.quantity) || 0) * 4
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
          (Number(donation.quantity) || 0),
        0
      );

    // ==================================================
    // TODAY'S DONATIONS
    // ==================================================

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const todayDonations = donations.filter(
      (donation) => {
        const createdAt = new Date(
          donation.createdAt
        );

        return (
          createdAt >= startOfDay &&
          createdAt < endOfDay
        );
      }
    ).length;

    // ==================================================
    // ACTIVE DONATIONS
    // ==================================================

    // ==================================================
    // ACTIVE DONATIONS
    // ==================================================

    const activeCheckTime = new Date();

    const activeDonations = donations.filter((donation) => {
      const bestBefore = donation.bestBefore
        ? new Date(donation.bestBefore)
        : null;

      // Exclude expired or invalid donations
      if (
        !bestBefore ||
        Number.isNaN(bestBefore.getTime()) ||
        bestBefore <= activeCheckTime
      ) {
        return false;
      }

      // Count only active statuses
      return [
        "Pending",
        "Accepted",
        "Out for Delivery",
      ].includes(donation.pipelineStatus);
    }).length;
    // ==================================================
    // RECENT DONATIONS
    // ==================================================

    const recentDonations = donations
      .slice(0, 5)
      .map((donation) => ({
        _id: donation._id,
        donationId: donation.donationId,
        foodName: donation.foodName,
        foodType: donation.foodType,
        foodCategory: donation.foodCategory,
        quantity: donation.quantity,
        estimatedMeals: donation.estimatedMeals,
        status: donation.status,
        pipelineStatus: donation.pipelineStatus,
        createdAt: donation.createdAt,

        // NGO request information
        ngoRequest: donation.ngoRequest,
        ngoRequests: donation.ngoRequests,
        selectedNgo: donation.selectedNgo,

        deliveryMan: donation.deliveryMan,
      }));

    // ==================================================
    // PICKUP TRACKER
    // ==================================================

    const now = new Date();

    const pickupDonations = donations.filter(
      (donation) => {
        const bestBefore = donation.bestBefore
          ? new Date(donation.bestBefore)
          : null;

        // Expired donations Pickup Tracker-এ দেখাবে না
        if (
          !bestBefore ||
          Number.isNaN(bestBefore.getTime()) ||
          bestBefore <= now
        ) {
          return false;
        }

        const pipelineStatus = donation.pipelineStatus;
        const status = donation.status;

        // NGO request আছে, কিন্তু donor এখনো select করেনি
        const hasPendingNgoRequests =
          pipelineStatus === "Pending" &&
          !donation.selectedNgo &&
          Array.isArray(donation.ngoRequests) &&
          donation.ngoRequests.some(
            (request) => request.status === "Pending"
          );

        // আগের active pickup functionality
        const isActivePickup =
          [
            "Accepted",
            "Out for Delivery",
          ].includes(pipelineStatus) ||
          [
            "Delivery Man Assigned",
            "Food Picked Up",
          ].includes(status);

        return (
          hasPendingNgoRequests ||
          isActivePickup
        );
      }
    );

    // ==================================================
    // NGO PARTNERS
    // ==================================================

    const ngoMap = new Map();

    donations.forEach((donation) => {
      const ngo =
        donation.ngoRequest?.requestedBy;

      if (!ngo?._id) {
        return;
      }

      const ngoId = ngo._id.toString();

      if (!ngoMap.has(ngoId)) {
        ngoMap.set(ngoId, {
          id: ngo._id,
          _id: ngo._id,

          name:
            ngo.user?.name ||
            ngo.organizationName ||
            ngo.organizationId ||
            "NGO Partner",

          organizationName:
            ngo.organizationName || "",

          organizationId:
            ngo.organizationId || "",

          phone: ngo.phone || "",
          address: ngo.address || "",
          status: "Active",

          requestCount: 0,
          meals: 0,
          quantity: 0,
          completed: 0,

          lastRequest: null,

          history: [],
        });
      }

      const partner = ngoMap.get(ngoId);

      partner.requestCount += 1;

      if (
        donation.pipelineStatus === "Completed"
      ) {
        partner.quantity +=
          Number(donation.quantity) || 0;

        const estimatedMeals = Number(
          donation.estimatedMeals
        );

        if (
          !Number.isNaN(estimatedMeals) &&
          estimatedMeals >= 0
        ) {
          partner.meals += estimatedMeals;
        } else {
          partner.meals +=
            Math.floor(
              (Number(donation.quantity) || 0) * 4
            );
        }

        partner.completed += 1;
      }

      const requestDate =
        donation.ngoRequest?.requestedAt ||
        donation.createdAt;

      if (
        !partner.lastRequest ||
        new Date(requestDate) >
        new Date(partner.lastRequest)
      ) {
        partner.lastRequest = requestDate;
      }

      partner.history.push({
        _id: donation._id,
        donationId: donation.donationId,

        foodName:
          donation.foodName || "Food Donation",

        foodType:
          donation.foodType || "",

        foodCategory:
          donation.foodCategory || "",

        quantity:
          Number(donation.quantity) || 0,

        estimatedMeals:
          Number(donation.estimatedMeals) || 0,

        status:
          donation.status || "",

        pipelineStatus:
          donation.pipelineStatus || "",

        requestedAt:
          donation.ngoRequest?.requestedAt || null,

        acceptedAt:
          donation.ngoRequest?.acceptedAt || null,

        createdAt: donation.createdAt,

        completedAt:
          donation.pipelineStatus === "Completed"
            ? donation.updatedAt
            : null,
      });
    });

    // ==================================================
    // SORT NGO HISTORY
    // ==================================================

    const ngoPartners = Array.from(
      ngoMap.values()
    ).map((partner) => {
      partner.history.sort((a, b) => {
        const dateA = new Date(
          a.requestedAt || a.createdAt
        );

        const dateB = new Date(
          b.requestedAt || b.createdAt
        );

        return dateB - dateA;
      });

      return partner;
    });

    // ==================================================
    // FOOD CATEGORIES
    // ==================================================

    const categoryMap = new Map();

    completedDonationList.forEach((donation) => {
      const category = (
        donation.foodCategory ||
        donation.foodType ||
        "Other"
      ).trim();

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          name: category,
          count: 0,
          meals: 0,
          quantity: 0,
        });
      }

      const categoryData =
        categoryMap.get(category);

      categoryData.count += 1;

      categoryData.quantity +=
        Number(donation.quantity) || 0;

      const estimatedMeals = Number(
        donation.estimatedMeals
      );

      if (
        !Number.isNaN(estimatedMeals) &&
        estimatedMeals >= 0
      ) {
        categoryData.meals += estimatedMeals;
      } else {
        categoryData.meals +=
          Math.floor(
            (Number(donation.quantity) || 0) * 4
          );
      }
    });

    // ==================================================
    // TOTAL CATEGORY MEALS
    // ==================================================

    const totalCategoryMeals = Array.from(
      categoryMap.values()
    ).reduce(
      (total, category) =>
        total + category.meals,
      0
    );

    // ==================================================
    // FINAL CATEGORY DATA
    // ==================================================

    const categories = Array.from(
      categoryMap.values()
    )
      .map((category) => {
        const percent =
          totalCategoryMeals > 0
            ? (
              (category.meals /
                totalCategoryMeals) *
              100
            ).toFixed(1)
            : 0;

        return {
          name: category.name,
          count: category.count,
          meals: category.meals,

          quantity: Number(
            category.quantity.toFixed(2)
          ),

          percent: Number(percent),
        };
      })
      .sort(
        (a, b) => b.meals - a.meals
      )
      .slice(0, 5);

    // ==================================================
    // ENVIRONMENTAL IMPACT
    // ==================================================

    const carbonPrevented = Number(
      (
        foodWasteDiverted * 2.5
      ).toFixed(2)
    );

    const treesEquivalent = Number(
      (
        carbonPrevented / 21
      ).toFixed(2)
    );

    const waterSaved = Number(
      (
        foodWasteDiverted * 1000
      ).toFixed(2)
    );

    // ==================================================
    // ANNUAL GOAL
    // ==================================================

    const annualTargetKg = 1000;

    const annualGoal = Math.min(
      Math.max(
        (
          foodWasteDiverted /
          annualTargetKg
        ) * 100,
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
        // BASIC STATS

        totalDonations: total,

        todayDonations: todayDonations,

        mealsServed: mealsServed,

        foodWasteDiverted: Number(
          foodWasteDiverted.toFixed(2)
        ),

        activeDonations: activeDonations,

        pendingDonations: pending,

        acceptedDonations: accepted,

        outForDelivery: outForDelivery,

        completedDonations: completed,

        rejectedDonations: rejected,

        // NGO RATING

        ratingAverage: ratingAverage,

        ratingCount: ratingCount,

        ratingsByNgo: ratingsByNgo,

        // NGO FEEDBACK

        feedbackByNgo: feedbackByNgo,

        // ENVIRONMENTAL IMPACT

        carbonPrevented: carbonPrevented,

        treesEquivalent: treesEquivalent,

        waterSaved: waterSaved,

        annualGoal: Number(
          annualGoal.toFixed(1)
        ),

        // RECENT DONATIONS

        recentDonations: recentDonations,

        // PICKUP TRACKER

        pickupDonations: pickupDonations,

        // NGO PARTNERS

        ngoPartners: ngoPartners,

        // TOP FOOD CATEGORIES

        categories: categories,

        // STATS OBJECT

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
      message: "Failed to fetch dashboard.",
      error: error.message,
    });
  }
};
// ======================================================
// LIST AVAILABLE DONATIONS (FULLY DYNAMIC WITH ROAD FACTOR)
// ======================================================

const listAvailableDonations = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Current time
    const now = new Date();

    // Fetch only non-expired pending donations
    const donations = await Donation.find({
      pipelineStatus: "Pending",
      $or: [
        { bestBefore: { $gt: now } },
        { bestBefore: { $exists: false } },
        { bestBefore: null },
      ],
    })
      .populate("donor", "name email role businessName restaurantName")
      .sort({
        createdAt: -1,
      });

    const result = [];

    for (let index = 0; index < donations.length; index++) {
      const donation = donations[index];
      const item = donation.toObject();

      try {
        const restaurant = await Restaurant.findOne({
          user: donation.donor?._id,
        });

        if (restaurant) {
          item.restaurant = restaurant;
        }
      } catch (restaurantError) {
        console.error(
          "Restaurant profile error:",
          restaurantError
        );
      }

      // ======================================================
      // LOCATION & GEOCODING RESOLUTION (WITH FALLBACK)
      // ======================================================
      let locLat = donation.latitude || donation.resolvedLocation?.lat;
      let locLng = donation.longitude || donation.resolvedLocation?.lng;

      // যদি ব্যাকএন্ড ইউটিলিটি দিয়ে লোকেশন রিজলভ করতে চায়
      if ((!locLat || !locLng) && typeof resolveDonationLocation === "function") {
        try {
          const location = await resolveDonationLocation(donation);
          if (location && location.latitude && location.longitude) {
            locLat = location.latitude;
            locLng = location.longitude;
          }
        } catch (locationError) {
          console.error("Donation location resolution error:", locationError);
        }
      }

      // যদি ডাটাবেজে একেবারেই কোঅর্ডিনেট না থাকে, তবে চিটাগাং শহরের বিভিন্ন পয়েন্টে ডাইনামিক পিন বসাবে
      if (!locLat || !locLng || isNaN(locLat) || isNaN(locLng)) {
        locLat = 22.3567 + (index * 0.008); 
        locLng = 91.8197 + (index * 0.008);
      }

      // ম্যাপ ও ফ্রন্টএন্ডের জন্য প্রপার্টি সিঙ্ক করা
      item.latitude = Number(locLat);
      item.longitude = Number(locLng);
      item.resolvedLocation = { lat: Number(locLat), lng: Number(locLng) };
      item.location = { latitude: Number(locLat), longitude: Number(locLng) };

      // ======================================================
      // EXACT DISTANCE CALCULATION (WITH ROAD FACTOR)
      // ======================================================
      const userLat = latitude !== undefined && latitude !== "" && Number(latitude) !== 0 ? Number(latitude) : 22.3569;
      const userLng = longitude !== undefined && longitude !== "" && Number(longitude) !== 0 ? Number(longitude) : 91.7832;

      let calculatedDist = 1.0;

      // সরাসরি ফর্মুলা এবং রোড ফ্যাক্টর (1.35) প্রয়োগ করা হলো যাতে গুগল ম্যাপের ড্রাইভিং দূরত্বের কাছাকাছি আসে
      const R = 6371; // Earth radius in KM
      const dLat = (Number(locLat) - userLat) * (Math.PI / 180);
      const dLon = (Number(locLng) - userLng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLat * (Math.PI / 180)) *
          Math.cos(Number(locLat) * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      calculatedDist = Number((R * c * 1.35).toFixed(1));

      // সর্বনিম্ন লিমিট চেক
      if (calculatedDist === undefined || calculatedDist === null || calculatedDist <= 0.1) {
        calculatedDist = 0.8;
      }

      item.distance = calculatedDist;
      item.distanceKm = calculatedDist; // Front-end compatibility

      result.push(item);
    }

    // ইউজارهای লোকেশন অনুযায়ী নিকটতম দূরত্বে সর্ট করা
    if (latitude !== undefined && longitude !== undefined) {
      result.sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
    }

    return res.json({
      success: true,
      donations: result,
    });
  } catch (error) {
    console.error("List Available Donations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available donations.",
      error: error.message,
    });
  }
};
// ======================================================
// ACCEPT DONATION
// ======================================================
// ======================================================
// NGO REQUEST DONATION
// ======================================================
// ======================================================
// NGO REQUEST DONATION
// ======================================================
const acceptDonation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const ngo = await getCurrentNgo(req.user._id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    if (donation.pipelineStatus !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "This donation is no longer available.",
      });
    }

    if (donation.bestBefore <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This donation has expired.",
      });
    }

    if (
      donation.selectedNgo &&
      donation.selectedNgo.toString() !== ngo._id.toString()
    ) {
      return res.status(409).json({
        success: false,
        message: "This donation has already been selected by the donor.",
      });
    }

    const alreadyRequested = donation.ngoRequests.some(
      (request) =>
        request.requestedBy.toString() === ngo._id.toString()
    );

    if (alreadyRequested) {
      return res.status(409).json({
        success: false,
        message: "You have already requested this donation.",
      });
    }

    donation.ngoRequests.push({
      requestedBy: ngo._id,
      status: "Pending",
      requestedAt: new Date(),
    });

    await donation.save();

    // Notify donor with actual NGO name
    const ngoName =
      ngo.organizationName ||
      ngo.organizationId ||
      "NGO";

    await createNotification({
      recipient: donation.donor.toString(),
      type: "DONATION_REQUEST",
      title: ngoName,
      message: `Requested your donation: ${donation.foodName}.`,
      donation: donation._id,
      data: {
        role: "donor",
        donationId: donation.donationId,
        donationObjectId: donation._id,
        ngoId: ngo._id,
        action: "view-donation",
      },
    });

    const updated = await Donation.findById(id)
      .populate("donor", "name email role")
      .populate({
        path: "ngoRequests.requestedBy",
        select: "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    // Update donor dashboard
    getIO()
      .to(rooms.restaurant(donation.donor.toString()))
      .emit("donation:updated", updated);

    // Update all NGO dashboards
    getIO()
      .to(rooms.ngos())
      .emit("donation:updated", updated);

    getIO()
      .to(rooms.admins())
      .emit("donation:updated", updated);

    return res.status(200).json({
      success: true,
      message: "Donation request submitted successfully. Waiting for donor approval.",
      donation: updated,
    });
  } catch (error) {
    console.error("NGO Request Donation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to request donation.",
      error: error.message,
    });
  }
};


// ======================================================
// DONOR SELECT NGO FOR DONATION
// ======================================================
const selectNgoForDonation = async (req, res) => {
  try {
    const { id, ngoId } = req.params;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Find donation belonging to this donor
    const donation = await Donation.findOne({
      _id: id,
      donor: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found or unauthorized.",
      });
    }

    if (donation.pipelineStatus !== "Pending") {
      return res.status(409).json({
        success: false,
        message: "This donation can no longer be selected.",
      });
    }

    if (donation.bestBefore <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This donation has expired.",
      });
    }

    if (donation.selectedNgo) {
      return res.status(409).json({
        success: false,
        message: "An NGO has already been selected.",
      });
    }

    const selectedRequest = donation.ngoRequests.find(
      (request) =>
        request.requestedBy.toString() === ngoId &&
        request.status === "Pending"
    );

    if (!selectedRequest) {
      return res.status(404).json({
        success: false,
        message: "This NGO has not requested this donation.",
      });
    }

    // Lock the donation so another request cannot be selected
    const lockedDonation = await Donation.findOneAndUpdate(
      {
        _id: id,
        donor: req.user._id,
        pipelineStatus: "Pending",
        selectedNgo: null,
      },
      {
        $set: {
          selectedNgo: ngoId,
        },
      },
      {
        new: true,
      }
    );

    if (!lockedDonation) {
      return res.status(409).json({
        success: false,
        message: "Another NGO has already been selected.",
      });
    }

    const now = new Date();

    // Selected NGO request becomes Accepted
    lockedDonation.ngoRequests.forEach((request) => {
      request.status =
        request.requestedBy.toString() === ngoId
          ? "Accepted"
          : "Rejected";

      request.respondedAt = now;
    });

    // Keep old field compatible with existing functions
    lockedDonation.ngoRequest = {
      requested: true,
      requestedBy: ngoId,
      requestedAt: selectedRequest.requestedAt,
      acceptedAt: now,
    };

    lockedDonation.pipelineStatus = "Accepted";
    lockedDonation.status = "NGO Requested";

    lockedDonation.statusHistory.push({
      status: "Accepted",
      changedAt: now,
      changedBy: req.user._id,
      note: "Donor selected an NGO for this donation.",
    });

    await lockedDonation.save();

    // Populate NGO requests
    const updated = await Donation.findById(id)
      .populate("donor", "name email role")
      .populate({
        path: "ngoRequests.requestedBy",
        select: "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "ngoRequest.requestedBy",
        select: "organizationId phone address organizationName user",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    // Notify every NGO that requested
    for (const request of updated.ngoRequests) {
      const requestedNgo = request.requestedBy;

      if (!requestedNgo) continue;

      const ngoUserId = requestedNgo.user?._id;

      if (!ngoUserId) continue;

      const isSelected =
        requestedNgo._id.toString() === ngoId;

      await createNotification({
        recipient: ngoUserId.toString(),
        type: isSelected ? "DONATION_ACCEPTED" : "DONATION_REJECTED",
        title: isSelected
          ? "Your Donation Request Was Selected"
          : "Donation Request Not Selected",
        message: isSelected
          ? `The donor selected your organization for "${updated.foodName}". You can now assign a driver.`
          : `The donor selected another NGO for "${updated.foodName}".`,
        donation: updated._id,
        data: {
          role: "ngo",
          donationId: updated.donationId,
          action: "view-donation",
        },
      });

      getIO()
        .to(rooms.ngo(ngoUserId.toString()))
        .emit("donation:updated", updated);
    }

    // Notify donor dashboard
    getIO()
      .to(rooms.restaurant(req.user._id.toString()))
      .emit("donation:updated", updated);

    getIO()
      .to(rooms.ngos())
      .emit("donation:updated", updated);

    getIO()
      .to(rooms.admins())
      .emit("donation:updated", updated);

    return res.status(200).json({
      success: true,
      message: "NGO selected successfully. Other NGO requests were rejected.",
      donation: updated,
    });
  } catch (error) {
    console.error("Select NGO Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to select NGO.",
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
    // Hide expired donations regardless of NGO request.
    // Completed and Rejected donations are also excluded.
    // ==================================================

    const now = new Date();

    const active = donations.filter((donation) => {
      // 1. Hide Completed and Rejected donations
      if (
        ["Completed", "Rejected"].includes(
          donation.pipelineStatus
        )
      ) {
        return false;
      }

      // 2. Check Best Before time
      if (donation.bestBefore) {
        const bestBefore = new Date(donation.bestBefore);

        if (
          !Number.isNaN(bestBefore.getTime()) &&
          bestBefore <= now
        ) {
          return false;
        }
      }

      // 3. Keep only non-expired donations
      return true;
    });
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
    const { name, phone, vehicleNumber } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // CURRENT NGO
    const ngo = await getCurrentNgo(req.user._id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    // VALIDATION
    if (!name || !phone || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Driver name, phone and vehicle number are required.",
      });
    }

    // NGO ID DEBUG
    console.log("NGO ID DEBUG:", {
      mongoNgoId: ngo._id.toString(),
      organizationId: ngo.organizationId,
      userId: ngo.user?.toString(),
    });

    // FIND DONATION
    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    // ONLY ACCEPTED DONATIONS
    if (donation.pipelineStatus !== "Accepted") {
      return res.status(400).json({
        success: false,
        message:
          "Driver can only be assigned to an accepted donation.",
      });
    }

    // DONOR-SELECTED NGO CHECK
    const selectedNgoId = donation.selectedNgo;

    if (
      !selectedNgoId ||
      selectedNgoId.toString() !== ngo._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the donor-selected NGO can assign a delivery driver.",
      });
    }

    // ADDITIONAL NGO OWNERSHIP CHECK
    const requestedBy = donation.ngoRequest?.requestedBy;

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

    // ASSIGN DRIVER
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

    // FETCH UPDATED DONATION
    const updated = await Donation.findById(id)
      .populate("donor", "name email role")
      .populate({
        path: "ngoRequest.requestedBy",
        select: "organizationId phone address user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "selectedNgo",
        select: "organizationId phone address user",
        populate: {
          path: "user",
          select: "name email",
        },
      });

    // REAL-TIME UPDATE TO DONOR
    if (updated.donor?._id) {
      getIO()
        .to(
          rooms.restaurant(updated.donor._id.toString())
        )
        .emit("donation:updated", updated);
    }

    // REAL-TIME UPDATE TO SELECTED NGO
    getIO()
      .to(rooms.ngo(req.user._id.toString()))
      .emit("donation:updated", updated);

    // REAL-TIME UPDATE TO ADMINS
    getIO()
      .to(rooms.admins())
      .emit("donation:updated", updated);

    return res.status(200).json({
      success: true,
      message: "Delivery driver assigned successfully.",
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
  declineNgoRequest,
  getDonorDonations,
  getDonorDashboard,
  listAvailableDonations,
  acceptDonation,
  selectNgoForDonation,
  updateDonationStatus,
  getNgoDonations,
  assignDeliveryDriver,
};