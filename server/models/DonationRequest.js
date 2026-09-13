const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema(
  {
    requestId: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => "REQ-" + Math.floor(1000 + Math.random() * 9000)
    },
    donor: { 
      type: String, 
      required: true 
    },
    foodType: { 
      type: String, 
      required: true 
    },
    address: { 
      type: String, 
      required: true 
    },
    coords: { 
      type: [Number], // [latitude, longitude] অথবা [longitude, latitude]
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "accepted", "rejected", "completed", "In Transit", "Picked Up", "Driver Assigned", "Archived"],
      default: "pending" 
    },
    logistics: { 
      type: String, 
      enum: ["FoodPanda Tracking", "By Self Option", "Third-party Delivery"],
      default: "By Self Option" 
    },
    estimatedArrival: { 
      type: String, 
      default: "15 mins" 
    },
    message: { 
      type: String, 
      trim: true 
    },
    timeAgo: { 
      type: String, 
      default: 'Recent' 
    }
  }, 
  { timestamps: true }
);

module.exports = mongoose.models.DonationRequest || mongoose.model('DonationRequest', donationRequestSchema, 'DonationRequest');