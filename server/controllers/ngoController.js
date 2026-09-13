const Ngo = require("../models/Ngo");
const DonationRequest = require('../models/DonationRequest');

const getNgoProfile = async (req, res) => {
  try {
    const ngo = await Ngo.findOne({ user: req.user.id }).populate("user", "name email role");
    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO profile not found" });
    }
    res.status(200).json({ success: true, ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getNgoStats = async (req, res) => {
  try {
    // সেফটি চেক: req.user বা req.user.id না থাকলেও সার্ভার ক্র্যাশ করবে না
    const userId = req.user && req.user.id ? req.user.id : null;
    
    let ngo = null;
    if (userId) {
      ngo = await Ngo.findOne({ user: userId });
    } else {
      // যদি ইউজার আইডি না পাওয়া যায়, তবে ডাটাবেস থেকে প্রথম যে এনজিও পাবে সেটি নিয়ে নেবে
      ngo = await Ngo.findOne();
    }

    // কালেকশন (DonationRequest) থেকে ডাইনামিক কাউন্ট হিসাব করা হচ্ছে
    const totalClaimed = await DonationRequest.countDocuments({ status: "accepted" });
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayClaimed = await DonationRequest.countDocuments({
      status: "accepted",
      updatedAt: { $gte: startOfToday }
    });

    const mealsDistributed = totalClaimed * 20;
    const todayMeals = todayClaimed * 20;
    
    const wasteInKg = mealsDistributed * 0.4;
    const foodWasteSaved = wasteInKg >= 1000 
      ? `${(wasteInKg / 1000).toFixed(1)} Tons` 
      : `${wasteInKg.toFixed(1)} Kg`;

    const reviewCount = ngo && ngo.reviews ? ngo.reviews.length : 0;
    const trustScore = ngo && ngo.trustScore ? ngo.trustScore : 4.8;

    res.status(200).json({
      success: true,
      stats: {
        totalClaimed,
        todayClaimed,
        mealsDistributed,
        todayMeals,
        trustScore,
        reviewCount,
        foodWasteSaved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { 
  getNgoProfile, 
  getNgoStats 
};