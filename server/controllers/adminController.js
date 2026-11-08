const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification"); // 👉 নোটিফিকেশন মডেল ইমপোর্ট করা হলো
const { getIO, rooms } = require("../utils/socket");

const { createNotification } = require("../utils/notificationUtils");

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

// =====================================
// ADMIN TO DONOR / NGO WARNING NOTIFICATION
// =====================================
const sendAdminFeedback = async (req, res) => {
  try {
    const { feedbackId, message } = req.body;

    if (!feedbackId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Feedback ID and warning message are required.",
      });
    }

    // Find original feedback
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    let recipientId = null;
    let recipientRole = null;
    let recipientUser = null;

    // =====================================
    // DONOR SUBMITTED FEEDBACK
    // =====================================
    if (
      String(feedback.submittedBy).toLowerCase() === "donor"
    ) {
      recipientId = feedback.donor;
      recipientRole = "donor";

      if (recipientId) {
        recipientUser = await User.findById(recipientId);
      }
    }

    // =====================================
    // NGO SUBMITTED FEEDBACK
    // NGO profile ID -> NGO User ID
    // =====================================
    else if (
      String(feedback.submittedBy).toLowerCase() === "ngo"
    ) {
      const ngo = await Ngo.findById(feedback.ngo)
        .select("user");

      recipientId = ngo?.user || null;
      recipientRole = "ngo";

      if (recipientId) {
        recipientUser = await User.findById(recipientId);
      }
    }

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "Recipient user could not be found for this feedback.",
      });
    }

    // =====================================
    // CREATE NOTIFICATION
    // =====================================
    const notification = await createNotification({
      recipient: recipientUser._id,

      type: "ADMIN_FEEDBACK",

      title: "⚠️ Admin Warning / Notice",

      message: message.trim(),

      donation: feedback.donation || null,

      feedback: feedback._id,

      data: {
        role: recipientRole,
        sender: "Admin",
        feedbackId: feedback._id.toString(),
        donationId: feedback.donationId || "",
        submittedBy: feedback.submittedBy,
      },
    });

    if (!notification) {
      return res.status(500).json({
        success: false,
        message: "Failed to create notification.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Warning notification successfully sent to ${recipientRole}.`,
      notification,
    });

  } catch (error) {
    console.error("Send Admin Feedback Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send warning notification.",
      error: error.message,
    });
  }
};


// =====================================
// GET ALL DONATIONS (ADMIN VIEW)
// =====================================


const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donor", "name email")
      .populate({
        path: "selectedNgo",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "ngoRequests.requestedBy",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "ngoRequest.requestedBy",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate("statusHistory.changedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get All Donations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load donations.",
      error: error.message,
    });
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
      text: `🍽️ ${donation.donor?.name || "A restaurant"
        } posted ${donation.quantity || 0} kg of ${donation.foodName || "food"
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


// =====================================
// ADVANCED ADMIN REPORTS & ANALYTICS
// =====================================
const getAdvancedReports = async (req, res) => {
  try {
    const selectedYear = Number(req.query.year) || new Date().getFullYear();
    const selectedMonth = req.query.month
      ? Number(req.query.month)
      : null;

    if (
      !Number.isInteger(selectedYear) ||
      selectedYear < 2000 ||
      selectedYear > 2100 ||
      (selectedMonth !== null &&
        (!Number.isInteger(selectedMonth) ||
          selectedMonth < 1 ||
          selectedMonth > 12))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid year or month.",
      });
    }

    const [donors, ngos, donations] = await Promise.all([
      User.find({ role: "donor" })
        .select("name email createdAt")
        .lean(),

      Ngo.find()
        .populate("user", "name email createdAt")
        .lean(),

      Donation.find()
        .populate("donor", "name email")
        .populate("selectedNgo", "user")
        .populate({
          path: "ngoRequests.requestedBy",
          select: "user",
        })
        .populate({
          path: "ngoRequest.requestedBy",
          select: "user",
        })
        .select(
          "donor selectedNgo ngoRequests ngoRequest quantity pipelineStatus status createdAt foodName"
        )
        .lean(),
    ]);

    const ngoMap = new Map(
      ngos.map((ngo) => [String(ngo._id), ngo])
    );

    const getNgoProfileId = (value) => {
      if (!value) return null;
      return String(value._id || value);
    };

    const getNgoName = (ngo) =>
      ngo?.user?.name || ngo?.name || "Unknown NGO";

    const getDonorName = (donor) =>
      donor?.name || "Unknown Donor";

    const normalizeStatus = (donation) => {
      const pipeline = donation.pipelineStatus;

      if (pipeline) return pipeline;

      const status = String(donation.status || "").toLowerCase();

      if (status === "completed" || status === "delivered") {
        return "Completed";
      }

      if (status === "rejected") return "Rejected";

      if (status === "accepted") return "Accepted";

      return "Pending";
    };

    const getAcceptedNgoIds = (donation) => {
      const ids = new Set();

      const selectedId = getNgoProfileId(donation.selectedNgo);
      if (selectedId) ids.add(selectedId);

      (donation.ngoRequests || []).forEach((request) => {
        if (request.status === "Accepted") {
          const id = getNgoProfileId(request.requestedBy);
          if (id) ids.add(id);
        }
      });

      if (donation.ngoRequest?.requestedBy) {
        const oldRequestId = getNgoProfileId(
          donation.ngoRequest.requestedBy
        );

        if (
          oldRequestId &&
          (donation.pipelineStatus === "Accepted" ||
            donation.pipelineStatus === "Out for Delivery" ||
            donation.pipelineStatus === "Completed")
        ) {
          ids.add(oldRequestId);
        }
      }

      return [...ids];
    };

    const makeEmptyStats = () => ({
      donations: 0,
      quantity: 0,
      completed: 0,
      completedQuantity: 0,
      pending: 0,
      accepted: 0,
      outForDelivery: 0,
      rejected: 0,
    });

    const addDonation = (stats, donation) => {
      const quantity = Number(donation.quantity) || 0;
      const status = normalizeStatus(donation);

      stats.donations += 1;
      stats.quantity += quantity;

      if (status === "Completed") {
        stats.completed += 1;
        stats.completedQuantity += quantity;
      } else if (status === "Pending") {
        stats.pending += 1;
      } else if (status === "Accepted") {
        stats.accepted += 1;
      } else if (status === "Out for Delivery") {
        stats.outForDelivery += 1;
      } else if (status === "Rejected") {
        stats.rejected += 1;
      }
    };

    const yearStart = new Date(selectedYear, 0, 1);
    const nextYearStart = new Date(selectedYear + 1, 0, 1);

    const yearDonations = donations.filter((donation) => {
      const date = new Date(donation.createdAt);
      return date >= yearStart && date < nextYearStart;
    });

    const filteredDonations = selectedMonth
      ? yearDonations.filter(
          (donation) =>
            new Date(donation.createdAt).getMonth() + 1 ===
            selectedMonth
        )
      : yearDonations;

    // DONOR REPORTS
    const donorStats = new Map();

    donors.forEach((donor) => {
      donorStats.set(String(donor._id), {
        id: String(donor._id),
        name: donor.name || "Unknown Donor",
        email: donor.email || "",
        joinedAt: donor.createdAt,
        ...makeEmptyStats(),
      });
    });

    // NGO REPORTS
    const ngoStats = new Map();

    ngos.forEach((ngo) => {
      ngoStats.set(String(ngo._id), {
        id: String(ngo._id),
        userId: ngo.user?._id
          ? String(ngo.user._id)
          : null,
        name: getNgoName(ngo),
        email: ngo.user?.email || ngo.email || "",
        joinedAt: ngo.user?.createdAt || ngo.createdAt,
        ...makeEmptyStats(),
      });
    });

    // Monthly report for the selected year
    const monthlyTrend = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      label: new Date(selectedYear, index, 1).toLocaleString(
        "en-US",
        { month: "short" }
      ),
      donations: 0,
      quantity: 0,
      completed: 0,
      donorQuantity: 0,
      ngoQuantity: 0,
    }));

    // Yearly trend: last 5 years including selected year
    const yearlyTrend = Array.from({ length: 5 }, (_, index) => {
      const year = selectedYear - 4 + index;

      return {
        year,
        donations: 0,
        quantity: 0,
        completed: 0,
        donorQuantity: 0,
        ngoQuantity: 0,
      };
    });

    const overallStatus = {
      Pending: 0,
      Accepted: 0,
      "Out for Delivery": 0,
      Completed: 0,
      Rejected: 0,
    };

    // Process all donation records
    donations.forEach((donation) => {
      const donorId = donation.donor?._id
        ? String(donation.donor._id)
        : String(donation.donor || "");

      const status = normalizeStatus(donation);
      const quantity = Number(donation.quantity) || 0;
      const date = new Date(donation.createdAt);
      const donationYear = date.getFullYear();
      const donationMonth = date.getMonth();

      const donorRecord = donorStats.get(donorId);

      if (donorRecord) {
        addDonation(donorRecord, donation);
      }

      const acceptedNgoIds = getAcceptedNgoIds(donation);

      acceptedNgoIds.forEach((ngoId) => {
        const ngoRecord = ngoStats.get(ngoId);
        if (ngoRecord) addDonation(ngoRecord, donation);
      });

      if (
        donationYear >= selectedYear - 4 &&
        donationYear <= selectedYear
      ) {
        const yearlyRecord = yearlyTrend.find(
          (item) => item.year === donationYear
        );

        if (yearlyRecord) {
          yearlyRecord.donations += 1;
          yearlyRecord.quantity += quantity;
          if (status === "Completed") yearlyRecord.completed += 1;
          yearlyRecord.donorQuantity += quantity;

          if (acceptedNgoIds.length > 0) {
            yearlyRecord.ngoQuantity += quantity;
          }
        }
      }

      if (donationYear === selectedYear) {
        const monthRecord = monthlyTrend[donationMonth];

        monthRecord.donations += 1;
        monthRecord.quantity += quantity;
        monthRecord.donorQuantity += quantity;

        if (status === "Completed") {
          monthRecord.completed += 1;
        }

        if (acceptedNgoIds.length > 0) {
          monthRecord.ngoQuantity += quantity;
        }
      }
    });

    // Only selected year/month contributes to summary KPIs
    const selectedDonorStats = new Map();
    const selectedNgoStats = new Map();

    donors.forEach((donor) => {
      selectedDonorStats.set(String(donor._id), {
        ...makeEmptyStats(),
        id: String(donor._id),
        name: donor.name || "Unknown Donor",
        email: donor.email || "",
      });
    });

    ngos.forEach((ngo) => {
      selectedNgoStats.set(String(ngo._id), {
        ...makeEmptyStats(),
        id: String(ngo._id),
        name: getNgoName(ngo),
        email: ngo.user?.email || "",
      });
    });

    filteredDonations.forEach((donation) => {
      const donorId = donation.donor?._id
        ? String(donation.donor._id)
        : String(donation.donor || "");

      const donorRecord = selectedDonorStats.get(donorId);

      if (donorRecord) addDonation(donorRecord, donation);

      getAcceptedNgoIds(donation).forEach((ngoId) => {
        const ngoRecord = selectedNgoStats.get(ngoId);
        if (ngoRecord) addDonation(ngoRecord, donation);
      });

      const status = normalizeStatus(donation);
      if (Object.prototype.hasOwnProperty.call(overallStatus, status)) {
        overallStatus[status] += 1;
      }
    });

    const sumStats = (records) =>
      [...records.values()].reduce(
        (total, item) => {
          Object.keys(makeEmptyStats()).forEach((key) => {
            total[key] += Number(item[key]) || 0;
          });
          return total;
        },
        makeEmptyStats()
      );

    const donorSummary = sumStats(selectedDonorStats);
    const ngoSummary = sumStats(selectedNgoStats);

    const topDonors = [...selectedDonorStats.values()]
      .filter((item) => item.donations > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const topNgos = [...selectedNgoStats.values()]
      .filter((item) => item.donations > 0)
      .sort((a, b) => b.completedQuantity - a.completedQuantity)
      .slice(0, 5);

    const overall = {
      totalUsers: donors.length + ngos.length,
      totalDonors: donors.length,
      totalNgos: ngos.length,
      totalDonations: filteredDonations.length,
      totalFoodDonated: donorSummary.quantity,
      totalFoodReceived: ngoSummary.quantity,
      totalFoodDistributed: ngoSummary.completedQuantity,
      completedDonations: overallStatus.Completed,
      pendingDonations: overallStatus.Pending,
      feedbackCount: await Feedback.countDocuments(),
    };

    return res.status(200).json({
      success: true,
      filters: {
        year: selectedYear,
        month: selectedMonth,
      },
      overall,
      donor: {
        registered: donors.length,
        ...donorSummary,
        topPerformers: topDonors,
      },
      ngo: {
        registered: ngos.length,
        ...ngoSummary,
        topPerformers: topNgos,
      },
      monthlyTrend,
      yearlyTrend,
      statusBreakdown: Object.entries(overallStatus).map(
        ([status, count]) => ({ status, count })
      ),
    });
  } catch (error) {
    console.error("Advanced reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load advanced reports.",
      error: error.message,
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
  getAdvancedReports,
};