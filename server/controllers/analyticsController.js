const Donation = require("../models/Donation");
const Ngo = require("../models/Ngo");
const jwt = require("jsonwebtoken");

const getAdvancedAnalytics = async (req, res) => {
  try {
    const { year = "All", timeRange = "Monthly", searchRestaurant = "" } = req.query;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const userIdStr = String(decoded.id || decoded.userId || decoded._id || "");
    const ngoDoc = await Ngo.findOne({ user: userIdStr }).lean();
    const ngoIdStr = ngoDoc ? String(ngoDoc._id) : "";

    const allLogs = await Donation.find({})
      .populate('donor', 'name restaurantName businessName email')
      .lean();

    const myLogs = allLogs.filter((d) => {
      const isCompleted = String(d.status || '').toLowerCase() === 'completed' || String(d.pipelineStatus || '').toLowerCase() === 'completed';

      const requestedBy = String(d.ngoRequest?.requestedBy || "");
      const historyMatches = Array.isArray(d.statusHistory) && d.statusHistory.some((h) => {
        const changedBy = String(h.changedBy || "");
        return (userIdStr && changedBy === userIdStr) || (ngoIdStr && changedBy === ngoIdStr);
      });
      const directNgoId = String(d.ngoId?._id || d.ngoId || d.ngo?._id || d.ngo || "");

      const isRequestedByMe = (userIdStr && requestedBy === userIdStr) || (ngoIdStr && requestedBy === ngoIdStr);
      const isDirectMatch = (userIdStr && directNgoId === userIdStr) || (ngoIdStr && directNgoId === ngoIdStr);

      return isCompleted && (isRequestedByMe || historyMatches || isDirectMatch);
    });

    let totalFoodSavedKg = 0;
    let filteredDonationsCount = 0;
    const restaurantMap = {};
    const restaurantMealsMap = {};
    const timelineMap = {};
    const foodItemMap = {};

    const searchKeyword = searchRestaurant.trim().toLowerCase();

    myLogs.forEach((item) => {
      const restName = 
        item.donor?.restaurantName || 
        item.donor?.businessName || 
        item.donor?.name || 
        item.donorName || 
        "Partner Restaurant";

      if (searchKeyword !== "" && !restName.toLowerCase().includes(searchKeyword)) {
        return; 
      }

      if (year && year !== "All" && item.createdAt) {
        const itemYear = new Date(item.createdAt).getFullYear().toString();
        if (itemYear !== year) return;
      }

      let qtyNum = Number(item.quantity) || parseFloat(String(item.quantity || "0").replace(/[^0-9.]/g, "")) || 0;
      let mealsNum = Number(item.estimatedMeals) || (qtyNum > 0 ? Math.round(qtyNum * 4) : 0);

      if (!isNaN(qtyNum) && qtyNum > 0) {
        totalFoodSavedKg += qtyNum;
        filteredDonationsCount += 1;

        restaurantMap[restName] = (restaurantMap[restName] || 0) + qtyNum;
        restaurantMealsMap[restName] = (restaurantMealsMap[restName] || 0) + mealsNum;

        const dateValue = item.createdAt || item.pickupDate;
        if (dateValue) {
          const dateObj = new Date(dateValue);
          if (!isNaN(dateObj.getTime())) {
            let key = "";
            if (timeRange === "Daily") {
              key = dateObj.toISOString().split('T')[0];
            } else if (timeRange === "Yearly") {
              key = dateObj.getFullYear().toString();
            } else {
              key = dateObj.toLocaleString("en-US", { month: "short", year: "numeric" });
            }
            timelineMap[key] = (timelineMap[key] || 0) + qtyNum;
          }
        }

        const foodName = item.foodName || item.foodType || "General Food";
        foodItemMap[foodName] = (foodItemMap[foodName] || 0) + qtyNum;
      }
    });

    const restaurantImpactData = Object.keys(restaurantMap).map((name) => ({
      name,
      SavedKg: restaurantMap[name],
      MealsDistributed: restaurantMealsMap[name],
    })).sort((a, b) => b.SavedKg - a.SavedKg);

    const timelineTrend = Object.keys(timelineMap).map((period) => ({
      period,
      savedKg: timelineMap[period],
    }));

    const foodCategories = Object.keys(foodItemMap).map((name) => ({
      name,
      value: foodItemMap[name],
    })).sort((a, b) => b.value - a.value);

    return res.status(200).json({
      success: true,
      totalDonationsCount: filteredDonationsCount,
      totalFoodSavedKg,
      restaurantImpactData,
      timelineTrend,
      foodCategories,
    });

  } catch (error) {
    console.error("Advanced Analytics Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

module.exports = { getAdvancedAnalytics };