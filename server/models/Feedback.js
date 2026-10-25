const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    // Relationship Links
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
    },
    donationId: {
      type: String,
      required: true
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ngo",
    },
    // The restaurant (User with role "donor") this feedback is about
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    donorName: {
      type: String,
      required: true
    },

    // =====================================
    // DUAL-DESTINATION ROUTING & STATUS
    // =====================================
    routedTo: {
      admin: { type: Boolean, default: true },
      restaurant: { type: Boolean, default: false },
    },
    adminRead: { type: Boolean, default: false },
    restaurantRead: { type: Boolean, default: false },

    // Status management: Pending / Awaiting Response / Approved / Declined
    status: {
      type: String,
      enum: ["Pending", "Awaiting Response", "Approved", "Declined", "Resolved"],
      default: "Awaiting Response"
    },

    restaurantResponse: {
      message: { type: String, default: "" },
      respondedAt: { type: Date, default: null },
    },

    // Feedback Content & Categorization
    category: {
      type: String,
      required: true
    },
    tags: [{
      type: String
    }],
    priority: {
      type: String,
      enum: ["Low", "Normal", "High / Urgent"],
      default: "Normal"
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      trim: true,
    },

    // Metadata
    submittedBy: {
      type: String,
      default: "NGO"
    },
    date: {
      type: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);