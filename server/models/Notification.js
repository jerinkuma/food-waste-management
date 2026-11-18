
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // =====================================
    // NOTIFICATION RECIPIENT
    // =====================================

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================
    // NOTIFICATION TYPE
    // =====================================

    type: {
      type: String,
      required: true,
      enum: [
        "NEW_DONATION",
        "PRIORITY_DONATION",
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
        "FRESHNESS_ALERT",
        "SYSTEM",
        "ADMIN_STATUS",
        "ADMIN_FEEDBACK",
      ],
      default: "SYSTEM",
    },

    // =====================================
    // NOTIFICATION TITLE
    // =====================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================
    // NOTIFICATION MESSAGE
    // =====================================

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================
    // RELATED DONATION
    // =====================================

    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      default: null,
    },

    // =====================================
    // RELATED FEEDBACK
    // =====================================

    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      default: null,
    },

    // =====================================
    // ADDITIONAL DATA
    // =====================================

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // =====================================
    // READ STATUS
    // =====================================

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

// =====================================
// EXPORT NOTIFICATION MODEL
// =====================================

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
