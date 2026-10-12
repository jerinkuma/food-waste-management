const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // যে User notification পাবে
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Notification-এর ধরন
    type: {
      type: String,
      required: true,
      enum: [
        "NEW_DONATION",
        "DONATION_REQUEST",
        "DONATION_ACCEPTED",
        "DONATION_REJECTED",
        "DRIVER_ASSIGNED",
        "PICKUP_STARTED",
        "PICKUP_COMPLETED",
        "DONATION_COMPLETED",
        "RATING_RECEIVED",
        "FEEDBACK_RECEIVED",
        "FEEDBACK_RESPONSE",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },

    // ছোট title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification-এর বিস্তারিত message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // কোন donation-এর সাথে notification related
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      default: null,
    },

    // কোন feedback-এর সাথে related
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      default: null,
    },

    // Frontend-এ navigation করার জন্য অতিরিক্ত data
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Notification পড়া হয়েছে কিনা
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);