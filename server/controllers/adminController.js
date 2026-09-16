const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation");
const Feedback = require("../models/Feedback");
const { getIO, rooms } = require("../utils/socket");

// =====================================
// GET ALL USERS (merged Restaurant + NGO + plain User profiles)
// Replaces the previously hardcoded fetchUsers() mock array.
// =====================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const restaurants = await Restaurant.find();
    const ngos = await Ngo.find();

    const restaurantByUser = new Map(restaurants.map((r) => [r.user.toString(), r]));
    const ngoByUser = new Map(ngos.map((n) => [n.user.toString(), n]));

    const merged = users.map((u) => {
      const base = {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        status: u.status || "Active",
      };

      const r = restaurantByUser.get(u._id.toString());
      if (r) {
        return { ...base, location: r.address, phone: r.phone, followerCount: r.followerCount, followingCount: r.followingCount };
      }

      const n = ngoByUser.get(u._id.toString());
      if (n) {
        return { ...base, location: n.address, phone: n.phone, organizationId: n.organizationId, followerCount: n.followerCount, followingCount: n.followingCount };
      }

      return base;
    });

    return res.status(200).json({ success: true, count: merged.length, users: merged });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ success: false, message: "Failed to load users.", error: error.message });
  }
};

// =====================================
// UPDATE A USER'S STATUS (Active / Suspended / Verified / Pending)
// Wires up the Admin "Suspend / Verify" buttons.
// =====================================
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    getIO().to(rooms.admins()).emit("user:updated", user);

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update user.", error: error.message });
  }
};

// =====================================
// GET ALL DONATIONS (ADMIN VIEW)
// Replaces the hardcoded fetchDonations() mock array.
// =====================================
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donor", "name email")
      .populate("ngoRequest.requestedBy", "organizationId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: donations.length, donations });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load donations.", error: error.message });
  }
};

// =====================================
// DASHBOARD OVERVIEW STATS
// Replaces the hardcoded fetchDashboardStats() mock object.
// =====================================
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalDonations, pendingDonations, feedbackCount, deliveredDonations] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Donation.countDocuments({ pipelineStatus: "Pending" }),
      Feedback.countDocuments(),
      Donation.find({ pipelineStatus: "Completed" }),
    ]);

    const availableFoodKg = deliveredDonations.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

    const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(6).populate("donor", "name");
    const recentActivities = recentDonations.map((d) => ({
      id: d._id,
      text: `🍽️ ${d.donor?.name || "A restaurant"} posted ${d.quantity}kg of ${d.foodName}`,
      time: d.createdAt,
    }));

    return res.status(200).json({
      success: true,
      totalUsers,
      totalDonations,
      pendingDonations,
      availableFood: `${availableFoodKg} kg`,
      feedbackCount,
      recentActivities,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load dashboard stats.", error: error.message });
  }
};

module.exports = { getAllUsers, updateUserStatus, getAllDonations, getDashboardStats };
