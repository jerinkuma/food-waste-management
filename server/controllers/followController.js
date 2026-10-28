const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const Follow = require("../models/Follow");
const Donation = require("../models/Donation");

// =====================================
// FOLLOW A PARTNER
// =====================================
const followPartner = async (req, res) => {
  try {
    const { followerId, followerRole, followingId, followingRole } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ success: false, message: "Follower and Following IDs are required." });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId
    });

    if (existingFollow) {
      return res.status(400).json({ success: false, message: "Already following this partner." });
    }

    const newFollow = new Follow({
      follower: followerId,
      followerRole: followerRole || 'ngo',
      following: followingId,
      followingRole: followingRole || 'donor'
    });

    await newFollow.save();

    return res.status(200).json({ success: true, message: "Successfully followed partner." });
  } catch (error) {
    console.error("Follow Partner Error:", error);
    return res.status(500).json({ success: false, message: "Failed to follow partner.", error: error.message });
  }
};

// =====================================
// UNFOLLOW A PARTNER
// =====================================
const unfollowPartner = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({ success: false, message: "Follower and Following IDs are required." });
    }

    await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId
    });

    return res.status(200).json({ success: true, message: "Successfully unfollowed partner." });
  } catch (error) {
    console.error("Unfollow Partner Error:", error);
    return res.status(500).json({ success: false, message: "Failed to unfollow partner.", error: error.message });
  }
};

// =====================================
// GET FOLLOWING LIST
// =====================================
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const followingList = await Follow.find({ follower: userId })
      .populate("following", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, following: followingList });
  } catch (error) {
    console.error("Get Following Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch following list.", error: error.message });
  }
};

// =====================================
// GET FOLLOWERS LIST
// =====================================
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const followersList = await Follow.find({ following: userId })
      .populate("follower", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, followers: followersList });
  } catch (error) {
    console.error("Get Followers Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch followers list.", error: error.message });
  }
};

// =====================================
// GET SUGGESTIONS
// =====================================
const getSuggestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    // Determine target role to suggest (if user is ngo, suggest donors/restaurants and vice versa)
    const targetRole = role === 'ngo' ? 'donor' : 'ngo';

    // Find users already followed
    const followingRecords = await Follow.find({ follower: userId }).select("following");
    const followingIds = followingRecords.map(f => f.following);
    followingIds.push(userId); // Exclude self

    const suggestions = await User.find({
      _id: { $nin: followingIds },
      role: targetRole
    }).select("name email role");

    return res.status(200).json({ success: true, suggestions });
  } catch (error) {
    console.error("Get Suggestions Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch suggestions.", error: error.message });
  }
};

// =====================================
// GET PARTNER DETAILS, LIVE INVENTORY, HISTORY & RATINGS
// GET /api/partners/details/:restaurantUserId
// =====================================
const getPartnerDetails = async (req, res) => {
  try {
    const { restaurantUserId } = req.params;

    const restaurantUser = await User.findById(restaurantUserId).select("name email role");
    const restaurantProfile = await Restaurant.findOne({ user: restaurantUserId });

    if (!restaurantUser) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    // ১. লাইভ বা এভেলেবল ডোনেশনগুলো
    const liveDonations = await Donation.find({
      donor: restaurantUserId,
      status: "Waiting for NGO Acceptance",
    }).sort({ createdAt: -1 });

    // ২. অতীতের সফলভাবে সম্পন্ন হওয়া ডোনেশন হিস্ট্রি (Completed)
    const pastDonations = await Donation.find({
      donor: restaurantUserId,
      status: "Completed",
    }).sort({ updatedAt: -1 }).limit(10);

    // ৩. নিরাপদভাবে রেটিং হ্যান্ডেল করা (মডেল না থাকলেও ক্র্যাশ করবে না)
    let averageRating = 0;
    let totalRatings = 0;
    let ratingsList = [];
    
    try {
      const Rating = require("../models/Rating");
      ratingsList = await Rating.find({ targetUser: restaurantUserId }).sort({ createdAt: -1 });
      if (ratingsList.length > 0) {
        const sum = ratingsList.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        averageRating = Number((sum / ratingsList.length).toFixed(1));
        totalRatings = ratingsList.length;
      }
    } catch (err) {
      console.log("Rating model not found or skipped.");
    }

    return res.status(200).json({
      success: true,
      partner: {
        id: restaurantUser._id,
        name: restaurantProfile?.organizationName || restaurantUser.name,
        email: restaurantUser.email,
        address: restaurantProfile?.address || "Chattogram",
        phone: restaurantProfile?.phone || "N/A",
        followerCount: restaurantProfile?.followerCount || 0,
        averageRating,
        totalRatings,
      },
      liveDonations,
      pastDonations,
      ratings: ratingsList,
    });
  } catch (error) {
    console.error("Get Partner Details Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch partner details.", error: error.message });
  }
};

module.exports = {
  followPartner,
  unfollowPartner,
  getFollowing,
  getFollowers,
  getSuggestions,
  getPartnerDetails,
};