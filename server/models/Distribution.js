const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema({
  ngoId: { type: String, required: false },
  restaurantId: { type: String, required: false }, // ObjectId এর বদলে String
  donationId: { type: String, required: false },   // ObjectId এর বদলে String
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imageUrls: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Distribution', distributionSchema);