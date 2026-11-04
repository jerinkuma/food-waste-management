const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification"); // 👉 নোটিফিকেশন মডেল ইমপোর্ট করা হলো
const { getIO, rooms } = require("../utils/socket");

// =====================================
// GET ALL USERS (merged Restaurant + NGO + plain User profiles)
// =====================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "donor" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((user) => user._id);

    const restaurants = await Restaurant.find({
      user: { $in: userIds },
    }).lean();

    const restaurantByUser = new Map(
      restaurants.map((restaurant) => [
        String(restaurant.user),
        restaurant,
      ])
    );

    const donors = users.map((user) => {
      const restaurant = restaurantByUser.get(String(user._id));

      return {
        id: String(user._id),
        name: user.name || "N/A",
        email: user.email || "N/A",
        role: user.role,
        status: user.isBlocked ? "Blocked" : (user.status || "Active"),
        isBlocked: user.isBlocked || false,
        createdAt: user.createdAt || null,
        location: restaurant?.address || "Not provided",
        phone: restaurant?.phone || "Not provided",
        tradeLicense: restaurant?.tradeLicense || "Not provided",
      };
    });

    return res.status(200).json({
      success: true,
      count: donors.length,
      users: donors,
    });
  } catch (error) {
    console.error("Get all donors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load donor information.",
    });
  }
};

// =====================================
// GET ALL NGOS
// =====================================
const getAllNgos = async (req, res) => {
  try {
    const ngos = await Ngo.find()
      .populate("user", "name email role status isBlocked createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formattedNgos = ngos.map((ngo) => {
      const user =
        ngo.user && typeof ngo.user === "object"
          ? ngo.user
          : {};

      return {
        id: String(ngo._id),
        userId: user._id ? String(user._id) : null,
        name: user.name || ngo.name || "N/A",
        email: user.email || ngo.email || "N/A",
        role: user.role || "ngo",
        status: user.isBlocked ? "Blocked" : (user.status || "Active"),
        isBlocked: user.isBlocked || false,
        createdAt: user.createdAt || ngo.createdAt || null,
        phone: ngo.phone || "Not provided",
        address: ngo.address || "Not provided",
        location: ngo.address || "Not provided",
        organizationId: ngo.organizationId || "N/A",
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedNgos.length,
      ngos: formattedNgos,
    });
  } catch (error) {
    console.error("Get all NGOs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load NGO information.",
    });
  }
};

// =====================================
// UPDATE A USER'S STATUS / BLOCK STATUS
// =====================================
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Active" বা "Blocked"

    let user = await User.findById(id);
    
    if (!user) {
      const ngoRecord = await Ngo.findById(id);
      if (ngoRecord) user = await User.findById(ngoRecord.user);
      
      const restRecord = await Restaurant.findById(id);
      if (restRecord) user = await User.findById(restRecord.user);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isBlocked = status.toLowerCase() === "blocked";
    user.isBlocked = isBlocked;
    user.status = isBlocked ? "Blocked" : "Active";
    await user.save();

    // নোটিফিকেশন তৈরি করা
    try {
      await Notification.create({
        recipient: user._id,
        title: user.isBlocked ? "🚫 Account Blocked" : "✨ Account Activated",
        message: user.isBlocked 
          ? "Your account has been blocked by the admin. You are restricted from logging in." 
          : "Your account has been activated by the admin.",
        type: "ADMIN_STATUS", 
      });
    } catch (notifErr) {
      console.error("Notification creation warning:", notifErr.message);
    }

    // রিয়েল-টাইম সকেট আপডেট পাঠানো
    const io = getIO();
    if (io && rooms && rooms.admin) {
      io.to(rooms.admin()).emit("user:updated", user);
    }

    return res.status(200).json({ 
      success: true, 
      message: `User status updated to ${user.status}`,
      user 
    });
  } catch (error) {
    console.error("Update User Status Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update user status.", error: error.message });
  }
};

// =====================================
// ADMIN TO RESTAURANT/NGO FEEDBACK & WARNING NOTIFICATION
// =====================================
const sendAdminFeedback = async (req, res) => {
  try {
    const { recipientId, status, message } = req.body;

    const targetUser = await User.findById(recipientId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found." });
    }

    // ডাটাবেজে নোটিফিকেশন সেভ করা
    await Notification.create({
      recipient: targetUser._id,
      title: status === "Approved" ? "✅ Admin Feedback: Approved" : "⚠️ Admin Warning / Notice",
      message: message || `Your account status has been reviewed by the admin.`,
      type: "ADMIN_FEEDBACK",
    });

    // রিয়েল-টাইম সকেট নোটিফিকেশন পাঠানো
    const io = getIO();
    if (io && rooms && rooms.user) {
      io.to(rooms.user(targetUser._id.toString())).emit("admin:feedback", {
        status,
        message,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback and warning notification sent successfully.",
    });
  } catch (error) {
    console.error("Send Admin Feedback Error:", error);
    return res.status(500).json({ success: false, message: "Failed to send feedback." });
  }
};

// =====================================
// GET ALL DONATIONS (ADMIN VIEW)
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
// =====================================
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonations,
      pendingDonations,
      feedbackCount,
      deliveredDonations,
    ] = await Promise.all([
      User.countDocuments({
        role: { $in: ["donor", "ngo"] },
      }),
      Donation.countDocuments(),
      Donation.countDocuments({
        pipelineStatus: "Pending",
      }),
      Feedback.countDocuments(),
      Donation.find({
        pipelineStatus: "Completed",
      }).select("quantity"),
    ]);

    const availableFoodKg = deliveredDonations.reduce(
      (sum, donation) =>
        sum + (Number(donation.quantity) || 0),
      0
    );

    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("donor", "name");

    const recentActivities = recentDonations.map((donation) => ({
      id: donation._id,
      text: `🍽️ ${
        donation.donor?.name || "A restaurant"
      } posted ${donation.quantity || 0} kg of ${
        donation.foodName || "food"
      }`,
      time: donation.createdAt,
    }));

    return res.status(200).json({
      success: true,
      totalUsers,
      totalDonations,
      pendingDonations,
      feedbackCount,
      availableFood: `${availableFoodKg} kg`,
      recentActivities,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllDonations,
  getDashboardStats,
  getAllNgos,
  sendAdminFeedback,
};