const TrustScore = require('../models/TrustScore');
const Ngo = require('../models/Ngo');
const jwt = require('jsonwebtoken');

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

// NGO-এর Trust Score তথ্য এবং ব্যাজ ফেচ করা
exports.getNgoTrustScore = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized / Token missing' });

    const ngo = await Ngo.findOne({ user: userId });
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    let trustScore = await TrustScore.findOne({ ngo: ngo._id });

    // যদি ট্রাস্ট স্কোর এখনো তৈরি না হয়ে থাকে, তবে প্রথমবার ১০০ ডিফল্ট স্কোর নিয়ে ক্রিয়েট করবে
    if (!trustScore) {
      trustScore = await TrustScore.create({
        ngo: ngo._id,
        score: 100,
        completedDonationsCount: 0,
        badges: ['New Member'],
        history: [{ reason: 'Account Registration Bonus', pointsChanged: 100 }],
      });
    }

    res.status(200).json(trustScore);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Trust Score', error: error.message });
  }
};