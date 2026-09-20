const mongoose = require('mongoose');

const pendingFeedbackSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // e.g., 'DH1005'
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  donorName: { type: String, required: true },
  food: { type: String, required: true },
  deliveredTime: { type: String, required: true },
  status: { type: String, enum: ['Delivered', 'Reviewed'], default: 'Delivered' }
}, { timestamps: true });

module.exports = mongoose.model('PendingFeedback', pendingFeedbackSchema);