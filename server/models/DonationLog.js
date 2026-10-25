const mongoose = require('mongoose');

const donationLogSchema = new mongoose.Schema({
  donationId: { type: String, required: true },
  donorName: { type: String, required: true },
  foodName: { type: String },         // ফুড নেম
  foodType: { type: String },         // ফুড টাইপ (যেমন: Vegetarian/Non-Vegetarian)
  foodCategory: { type: String },
  quantity: { type: String },         // কোয়ান্টিটি
  estimatedMeals: { type: Number },
  pickupDate: { type: Date },         // পিকআপ ডেট
  pickupTime: { type: String },       // পিকআপ টাইম
  pickupAddress: { type: String },
  location: { type: String },
  logistics: { type: String },        // লজিস্টিকস (যেমন: FoodPanda, By Self)
  status: { type: String, default: 'Delivered' }, // স্ট্যাটাস (Delivered / Completed)
  rating: { type: Number, default: 5 },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// সরাসরি 'donations' কালেকশনের সাথে বাইন্ড করা হলো
module.exports = mongoose.model('DonationLog', donationLogSchema, 'donations');