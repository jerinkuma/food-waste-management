const mongoose = require('mongoose');

const donationLogSchema = new mongoose.Schema({
  donationId: { type: String, required: true, unique: true }, // e.g. DH1005
  donorName: { type: String, required: true },
  trustScore: { type: Number, default: 5.0 },
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  logistics: { type: String, enum: ['FoodPanda', 'By Self'], required: true },
  status: { type: String, enum: ['Delivered', 'Picked Up'], default: 'Delivered' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  location: { type: String, required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DonationLog', donationLogSchema);