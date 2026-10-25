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

    const userIdStr = String(decoded.id || decoded.userId || decoded._id || "");

    // ১. প্রফাইল থেকে এনজিওর আসল ObjectId সংগ্রহ
    const ngoDoc = await Ngo.findOne({ user: userIdStr }).lean();
    const ngoIdStr = ngoDoc ? String(ngoDoc._id) : "";

    // ২. ডাটাবেজ থেকে সমস্ত ডোনেশন আনা
    const allLogs = await DonationLog.find({}).lean();

    // ৩. আসল ফিল্ড ম্যাচিং: (ngoRequest.requestedBy অথবা statusHistory.changedBy)
    const myLogs = allLogs.filter((d) => {
      const requestedBy = String(d.ngoRequest?.requestedBy || "");

      // statusHistory-র ভেতর এনজিওর আইডি আছে কিনা চেক
      const historyMatches = Array.isArray(d.statusHistory) && d.statusHistory.some((h) => {
        const changedBy = String(h.changedBy || "");
        return (userIdStr && changedBy === userIdStr) || (ngoIdStr && changedBy === ngoIdStr);
      });

      // ngoId বা ngo ফিল্ড যদি ভবিষ্যতে থাকে
      const directNgoId = String(d.ngoId?._id || d.ngoId || d.ngo?._id || d.ngo || "");

      const isRequestedByMe = (userIdStr && requestedBy === userIdStr) || (ngoIdStr && requestedBy === ngoIdStr);
      const isDirectMatch = (userIdStr && directNgoId === userIdStr) || (ngoIdStr && directNgoId === ngoIdStr);

      return isRequestedByMe || historyMatches || isDirectMatch;
    });

    // ৪. গাণিতিক হিসাব (Summation)
    const totalClaimed = myLogs.length;

    // আজকের ক্লেইম
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayClaimed = myLogs.filter((d) => {
      const dDate = new Date(d.createdAt || d.pickupDate);
      return dDate >= today;
    }).length;

    let mealsDistributed = 0;
    let wasteInKg = 0;

    myLogs.forEach((d) => {
      const estMeals = Number(d.estimatedMeals) || 0;
      let qtyNum = Number(d.quantity) || parseFloat(String(d.quantity || "0").replace(/[^0-9.]/g, "")) || 0;

      if (estMeals > 0) {
        mealsDistributed += estMeals;
      } else if (qtyNum > 0) {
        mealsDistributed += Math.round(qtyNum * 4);
      }

      if (qtyNum > 0) {
        wasteInKg += qtyNum;
      }
    });

    const foodWasteSaved =
      wasteInKg >= 1000
        ? `${(wasteInKg / 1000).toFixed(1)} Tons`
        : `${wasteInKg.toFixed(1)} Kg`;

    return res.status(200).json({
      success: true,
      stats: {
        totalClaimed: totalClaimed,
        todayClaimed: todayClaimed,
        mealsDistributed: mealsDistributed,
        todayMeals: 0,
        trustScore: 0.0,
        reviewCount: 0,
        foodWasteSaved: foodWasteSaved,
      },
    });
  } catch (error) {
    console.error("Get NGO Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getNgoProfile,
  getNgoStats,
};