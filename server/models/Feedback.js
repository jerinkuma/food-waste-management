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
    // The restaurant (User with role "donor") this feedback is about -
    // this is what makes dual-routing to the Restaurant dashboard possible.
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
    // DUAL-DESTINATION ROUTING
    // Every feedback submission is routed to the Admin panel AND
    // (when a restaurant is linked) to that Restaurant's own dashboard.
    // =====================================
    routedTo: {
      admin: { type: Boolean, default: true },
      restaurant: { type: Boolean, default: false },
    },
    adminRead: { type: Boolean, default: false },
    restaurantRead: { type: Boolean, default: false },
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
      default: "NGO Admin" 
    },
    date: { 
      type: String 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);