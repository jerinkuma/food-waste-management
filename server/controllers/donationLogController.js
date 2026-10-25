const DonationLog = require('../models/DonationLog');

exports.getDonationLogs = async (req, res) => {
  try {
    const { donor, foodType, logistics, location, search } = req.query;
    let query = {};

    // ১. ডোনর ফিল্টার
    if (donor && donor !== 'ALL' && donor !== 'All Donors') {
      query.donorName = donor;
    }

    // ২. ফুড টাইপ ফিল্টার
    if (foodType && foodType !== 'ALL' && foodType !== 'All Types') {
      query.$or = [
        { foodType: { $regex: foodType, $options: 'i' } },
        { foodCategory: { $regex: foodType, $options: 'i' } }
      ];
    }

    // ৩. লজিস্টিকস ফিল্টার
    if (logistics && logistics !== 'ALL' && logistics !== 'FoodPanda & Self') {
      query.logistics = logistics;
    }

    // ৪. লোকেশন ফিল্টার
    if (location && location !== 'ALL' && location !== 'All Locations') {
      query.pickupAddress = { $regex: location, $options: 'i' };
    }

    // ৫. সার্চ বক্স ফিল্টার (Donation ID, Donor Name বা Food Category দিয়ে সার্চ)
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { donationId: searchRegex },
        { donorName: searchRegex },
        { foodCategory: searchRegex },
        { foodType: searchRegex }
      ];
    }

    // ডেটাবেস থেকে সর্টিং করে ডেটা আনা
    const logs = await DonationLog.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error("Error in getDonationLogs:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};