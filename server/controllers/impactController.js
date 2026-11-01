const Donation = require("../models/Donation");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");

// =====================================
// GET HOMEPAGE IMPACT STATISTICS
// =====================================
const getImpactStats = async (req, res) => {
  try {
    const [
      totalDonations,
      successfulDonations,
      totalRestaurants,
      totalNgos,
    ] = await Promise.all([
      // All donations
      Donation.countDocuments(),

      // Successfully completed donations
      Donation.countDocuments({
        $or: [
          { pipelineStatus: "Completed" },
          { status: { $in: ["Completed", "completed"] } },
        ],
      }),

      // Total restaurant partners
      Restaurant.countDocuments(),

      // Total NGO partners
      Ngo.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalDonations,
        successfulDonations,
        totalRestaurants,
        totalNgos,
      },
    });
  } catch (error) {
    console.error("Impact Statistics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load impact statistics",
    });
  }
};

module.exports = {
  getImpactStats,
};
