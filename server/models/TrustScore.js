const mongoose = require("mongoose");

const trustScoreSchema = new mongoose.Schema(
  {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ngo",
      required: true,
      unique: true,
    },
    score: {
      type: Number,
      default: 100, // প্রাতিষ্ঠানিক প্রারম্ভিক স্কোর
    },
    completedDonationsCount: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: String, // উদাহরণ: "Top Collector", "Verified NGO"
      },
    ],
    history: [
      {
        reason: String,
        pointsChanged: Number,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrustScore", trustScoreSchema);