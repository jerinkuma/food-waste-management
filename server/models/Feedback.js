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
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    donorName: { 
      type: String, 
      required: true 
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