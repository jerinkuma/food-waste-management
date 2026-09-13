const DonationLog = require('../models/DonationLog');

// ১. Fetch History Logs with Safe Filtering & Search
exports.getDonationLogs = async (req, res) => {
  try {
    const { donor, foodType, logistics, location, search } = req.query;
    let query = {};

    // donor ফিল্টার
    if (donor && donor !== 'ALL' && donor !== 'All Donors') {
      query.donorName = donor;
    }

    // foodType ফিল্টার
    if (foodType && foodType !== 'ALL' && foodType !== 'All Types') {
      query.foodType = { $regex: foodType, $options: 'i' };
    }

    // logistics ফিল্টার
    if (logistics && logistics !== 'ALL' && logistics !== 'FoodPanda & Self') {
      query.logistics = logistics;
    }

    // location ফিল্টার
    if (location && location !== 'ALL' && location !== 'All Locations') {
      query.location = location;
    }

    // search ফিল্টার (যদি সার্চবক্স ফাকা না থাকে)
    if (search && search.trim() !== '') {
      query.$or = [
        { donationId: { $regex: search.trim(), $options: 'i' } },
        { donorName: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // ডাটাবেস থেকে সব ডাটা রিট্রিভ করা
    const logs = await DonationLog.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};