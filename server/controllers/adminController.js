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
    // Only donor accounts; exclude NGO and admin
    const users = await User.find({ role: "donor" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((user) => user._id);

    // Fetch restaurant profiles belonging to these donors
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
        status: user.status || "Active",
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

// get all ngos



const getAllNgos = async (req, res) => {
  try {
    const ngos = await Ngo.find()
      .populate("user", "name email role status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formattedNgos = ngos.map((ngo) => {
      const user =
        ngo.user && typeof ngo.user === "object"
          ? ngo.user
          : {};

      return {
        id: String(ngo._id),
        name: user.name || ngo.name || "N/A",
        email: user.email || ngo.email || "N/A",
        role: user.role || "ngo",
        status: user.status || "Active",
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
/// =====================================
// DASHBOARD OVERVIEW STATS
// Real statistics from MongoDB
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
      // Count donors and NGOs only. Exclude admins.
      User.countDocuments({
        role: { $in: ["donor", "ngo"] },
      }),

      // Count all donations
      Donation.countDocuments(),

      // Count pending donations
      Donation.countDocuments({
        pipelineStatus: "Pending",
      }),

      // Count all feedback records
      Feedback.countDocuments(),

      // Completed donations for the available-food calculation
      Donation.find({
        pipelineStatus: "Completed",
      }).select("quantity"),
    ]);

    const availableFoodKg = deliveredDonations.reduce(
      (sum, donation) =>
        sum + (Number(donation.quantity) || 0),
      0
    );

    // Recent donation activity
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
};
