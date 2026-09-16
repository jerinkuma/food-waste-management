const mongoose = require("mongoose");

// =====================================
// FOLLOW / PARTNER CONNECTION
// A generic "X follows Y" edge between any two Users
// (an NGO following a Restaurant, or vice versa).
// =====================================
const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followerRole: {
      type: String,
      enum: ["ngo", "donor"],
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingRole: {
      type: String,
      enum: ["ngo", "donor"],
      required: true,
    },
    // Marks an official two-way "Partner" once both sides follow each other.
    isMutualPartner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// A user can only follow another user once.
followSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model("Follow", followSchema);
