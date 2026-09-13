const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: String, default: 'NGO Rep' },
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: 'No written review provided.' },
  type: { type: String, enum: ['positive', 'negative'], required: true },
  createdAt: { type: Date, default: Date.now }
});

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  trustScore: { type: Number, default: 0 },
  totalDonations: { type: Number, default: 0 },
  isFollowed: { type: Boolean, default: false },
  tags: [{ type: String }],
  recentImages: [{ type: String }],
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);