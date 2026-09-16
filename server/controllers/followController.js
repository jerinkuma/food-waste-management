const Follow = require("../models/Follow");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const { getIO, rooms } = require("../utils/socket");

// =====================================
// helper: bump the denormalized counters on Restaurant/Ngo
// =====================================
async function bumpCounts(userId, role, field, delta) {
  const Model = role === "ngo" ? Ngo : Restaurant;
  await Model.updateOne({ user: userId }, { $inc: { [field]: delta } });
}

// =====================================
// FOLLOW A PARTNER
// =====================================
const followUser = async (req, res) => {
  try {
    const { followerId, followerRole, followingId, followingRole } = req.body;

    if (!followerId || !followingId || followerId === followingId) {
      return res.status(400).json({ success: false, message: "Invalid follow request." });
    }

    const existing = await Follow.findOne({ follower: followerId, following: followingId });
    if (existing) {
      return res.status(409).json({ success: false, message: "Already following this partner." });
    }

    const reverse = await Follow.findOne({ follower: followingId, following: followerId });

    const follow = await Follow.create({
      follower: followerId,
      followerRole,
      following: followingId,
      followingRole,
      isMutualPartner: !!reverse,
    });

    if (reverse) {
      reverse.isMutualPartner = true;
      await reverse.save();
    }

    await bumpCounts(followerId, followerRole, "followingCount", 1);
    await bumpCounts(followingId, followingRole, "followerCount", 1);

    // Notify the followed party in real time (like an Instagram follow notification)
    const targetRoom = followingRole === "ngo" ? rooms.ngo(followingId) : rooms.restaurant(followingId);
    getIO().to(targetRoom).emit("follow:new", {
      followerId,
      followerRole,
      isMutualPartner: follow.isMutualPartner,
    });

    return res.status(201).json({ success: true, message: reverse ? "You're now official partners!" : "Followed.", follow });
  } catch (error) {
    console.error("Follow user error:", error);
    return res.status(500).json({ success: false, message: "Failed to follow.", error: error.message });
  }
};

// =====================================
// UNFOLLOW A PARTNER
// =====================================
const unfollowUser = async (req, res) => {
  try {
    const { followerId, followerRole, followingId, followingRole } = req.body;

    const removed = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
    if (!removed) {
      return res.status(404).json({ success: false, message: "Not following this partner." });
    }

    // Break mutual partner status on the reverse edge, if any
    await Follow.updateOne({ follower: followingId, following: followerId }, { isMutualPartner: false });

    await bumpCounts(followerId, followerRole, "followingCount", -1);
    await bumpCounts(followingId, followingRole, "followerCount", -1);

    const targetRoom = followingRole === "ngo" ? rooms.ngo(followingId) : rooms.restaurant(followingId);
    getIO().to(targetRoom).emit("follow:removed", { followerId });

    return res.status(200).json({ success: true, message: "Unfollowed." });
  } catch (error) {
    console.error("Unfollow user error:", error);
    return res.status(500).json({ success: false, message: "Failed to unfollow.", error: error.message });
  }
};

// =====================================
// GET WHO A USER FOLLOWS (their partner list)
// =====================================
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await Follow.find({ follower: userId }).populate("following", "name email role");
    return res.status(200).json({ success: true, count: following.length, following });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load following list.", error: error.message });
  }
};

// =====================================
// GET A USER'S FOLLOWERS
// =====================================
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await Follow.find({ following: userId }).populate("follower", "name email role");
    return res.status(200).json({ success: true, count: followers.length, followers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load followers list.", error: error.message });
  }
};

// =====================================
// SUGGESTED PARTNERS (opposite role, not yet followed)
// GET /api/follow/suggestions/:userId?role=ngo|donor
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
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getSuggestedPartners,
};
