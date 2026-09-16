const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation");

const getNgoProfile = async (req, res) => {
  try {
    // যেহেতু মিডলওয়্যার নেই, তাই সরাসরি ডাটাবেজ থেকে প্রথম এনজিওটি নিয়ে নেব (অথবা ডামি ডেটা)
    let ngo = await Ngo.findOne().populate("user", "name email role");
    
    if (!ngo) {
      // যদি ডাটাবেজে কোনো এনজিও না থাকে, তবে একটি ডামি রেসপন্স দেবো যাতে সাইট ক্র্যাশ না করে
      return res.status(200).json({
        success: true,
        ngo: {
          name: "Shifat NGO Portal",
          email: "shifat@example.com",
          role: "ngo",
          trustScore: 4.8
        }
      });
    }

    res.status(200).json({ success: true, ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getNgoStats = async (req, res) => {
  try {
    // মিডলওয়্যার ছাড়া সব ডোনেশন ফেচ বা ডিফল্ট স্ট্যাটাস রিটার্ন করব
    const donations = await Donation.find();
    const completedDonations = donations.filter((d) => d.pipelineStatus === "Completed");

    const totalClaimed = donations.length;
    const mealsDistributed = completedDonations.reduce((sum, d) => sum + (Number(d.estimatedMeals) || 0), 0);
    const wasteInKg = completedDonations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
    const foodWasteSaved = wasteInKg >= 1000 ? `${(wasteInKg / 1000).toFixed(1)} Tons` : `${wasteInKg.toFixed(1)} Kg`;

    res.status(200).json({
      success: true,
      stats: {
        totalClaimed: totalClaimed || 4,
        todayClaimed: 2,
        mealsDistributed: mealsDistributed || 35,
        todayMeals: 15,
        trustScore: 4.8,
        reviewCount: 12,
        foodWasteSaved: foodWasteSaved || "12.5 Kg",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getNgoProfile,
  getNgoStats,
};
