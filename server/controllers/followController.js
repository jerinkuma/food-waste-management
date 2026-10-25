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
const getSuggestedPartners = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; // role of the requesting user

    const alreadyFollowing = await Follow.find({ follower: userId }).distinct("following");
    const excludeIds = [...alreadyFollowing, userId];

    let suggestions = [];

    if (role === "ngo") {
      const restaurants = await Restaurant.find({ user: { $nin: excludeIds } }).populate(
        "user",
        "name email role"
      );
      suggestions = restaurants.map((r) => ({
        userId: r.user._id,
        name: r.user.name,
        role: "donor",
        address: r.address,
        profileImage: r.profileImage,
        followerCount: r.followerCount,
      }));
    } else {
      const ngos = await Ngo.find({ user: { $nin: excludeIds } }).populate("user", "name email role");
      suggestions = ngos.map((n) => ({
        userId: n.user._id,
        name: n.user.name,
        role: "ngo",
        address: n.address,
        organizationId: n.organizationId,
        followerCount: n.followerCount,
      }));
    }

    return res.status(200).json({ success: true, count: suggestions.length, suggestions });
  } catch (error) {
    console.error("Get suggested partners error:", error);
    return res.status(500).json({ success: false, message: "Failed to load suggestions.", error: error.message });
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