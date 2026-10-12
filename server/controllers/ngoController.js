const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation");
const jwt = require("jsonwebtoken");

const getNgoProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    // Find NGO belonging to the logged-in user
    const ngo = await Ngo.findOne({ user: userId }).populate(
      "user",
      "name fullName email role"
    );

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found for this account",
      });
    }

    console.log("FETCH NGO DETAILS:", {
      mongoId: ngo._id.toString(),
      userId: ngo.user?._id?.toString(),
      organizationId: ngo.organizationId,
    });

    return res.status(200).json({
      success: true,
      ngo,
    });

  } catch (error) {
    console.error("Get NGO Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching NGO profile",
      error: error.message,
    });
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
