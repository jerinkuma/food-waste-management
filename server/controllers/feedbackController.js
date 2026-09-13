const Feedback = require('../models/Feedback');
const Ngo = require('../models/Ngo');
const jwt = require('jsonwebtoken');

// টোকেন থেকে User ID বের করার অভ্যন্তরীণ হেলপার
const getUserIdFromReq = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    return decoded.id || decoded.userId;
  } catch (err) {
    return null;
  }
};

// ১. নতুন ফিডব্যাক জমা দেওয়া
exports.createFeedback = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized / Token missing' });

    const ngo = await Ngo.findOne({ user: userId });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    const { donationId, donorId, rating, comment } = req.body;

    const newFeedback = new Feedback({
      donation: donationId,
      ngo: ngo._id,
      donor: donorId,
      rating,
      comment,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

// ২. NGO-এর নিজস্ব সব ফিডব্যাক ফেচ করা
exports.getNgoFeedbacks = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized / Token missing' });

    const ngo = await Ngo.findOne({ user: userId });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    const feedbacks = await Feedback.find({ ngo: ngo._id })
      .populate('donation')
      .populate('donor', 'fullName email');

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
  }
};