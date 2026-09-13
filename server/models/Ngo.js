const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    maximumCapacity: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    // SETTINGS FIELD EMBEDDED HERE
    settings: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
      notifications: {
        emailAlerts: { type: Boolean, default: true },
        smsAlerts: { type: Boolean, default: false },
      },
      preferredLanguage: {
        type: String,
        default: "en",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ngo", ngoSchema);
