const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    // =====================================
    // DONOR
    // =====================================

    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================
    // FOOD INFORMATION
    // =====================================

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    foodType: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    estimatedMeals: {
      type: Number,
      required: true,
    },

    cookingTime: {
      type: String,
      required: true,
    },

    bestBefore: {
      type: Date,
      required: true,
    },

    condition: {
      type: String,
      enum: ["Fresh", "Hot", "Cold", "Packed"],
      required: true,
    },

    foodCategory: {
      type: String,
      enum: ["Vegetarian", "Non-Vegetarian"],
      required: true,
    },

    // =====================================
    // PICKUP INFORMATION
    // =====================================

    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    pickupTime: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    pickupDuration: {
      type: String,
      required: true,
    },

    specialInstructions: {
      type: String,
      trim: true,
      default: "",
    },

    // =====================================
    // SAFETY
    // =====================================

    safetyConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },

    // =====================================
    // DONATION ID & QR CODE
    // =====================================

    donationId: {
      type: String,
      unique: true,
      required: true,
    },

    qrCode: {
      type: String,
      default: "",
    },

    // =====================================
    // DONATION STATUS
    // =====================================

    status: {
      type: String,
      enum: [
        "Published",
        "Waiting for NGO Acceptance",
        "NGO Requested",
        "Delivery Man Assigned",
        "Driver Arriving",
        "Food Verification",
        "Food Picked Up",
        "Delivered",
        "Completed",
        "Rejected",
      ],
      default: "Waiting for NGO Acceptance",
    },

    // =====================================
    // NGO REQUEST
    // =====================================

    ngoRequest: {
      requested: {
        type: Boolean,
        default: false,
      },

      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ngo",
        default: null,
      },

      requestedAt: {
        type: Date,
        default: null,
      },

      acceptedAt: {
        type: Date,
        default: null,
      },
    },

    // =====================================
    // ASSIGNED DELIVERY MAN
    // =====================================

    deliveryMan: {
      name: {
        type: String,
        default: "",
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      vehicleNumber: {
        type: String,
        default: "",
        trim: true,
      },

      assignedAt: {
        type: Date,
        default: null,
      },
    },

    // =====================================
    // LIVE LOCATION
    // =====================================

    liveLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      lastUpdated: {
        type: Date,
        default: null,
      },
    },

    // =====================================
    // FOOD VERIFICATION
    // =====================================

    verification: {
      scannedAt: {
        type: Date,
        default: null,
      },

      checks: {
        type: [Boolean],
        default: [],
      },

      approved: {
        type: Boolean,
        default: false,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },

      rejectionReason: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Donation",
  donationSchema
);