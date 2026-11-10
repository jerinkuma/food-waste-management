const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");

const { getIO, rooms } = require("../utils/socket");
const { createNotification } = require("../utils/notificationUtils");

// ======================================================
// HELPERS
// ======================================================

const normalizeStatus = (donation) => {
  const statuses = [
    donation.pipelineStatus,
    donation.status,
  ].map((value) =>
    String(value || "").trim().toLowerCase()
  );

  if (
    statuses.some((status) =>
      ["completed", "delivered"].includes(status)
    )
  ) {
    return "Completed";
  }

  if (statuses.includes("rejected")) {
    return "Rejected";
  }

  if (
    statuses.some((status) =>
      [
        "out for delivery",
        "delivery man assigned",
        "food picked up",
        "in transit",
      ].includes(status)
    )
  ) {
    return "Out for Delivery";
  }

  if (
    statuses.some((status) =>
      ["accepted", "ngo requested"].includes(status)
    )
  ) {
    return "Accepted";
  }

  return "Pending";
};

const getId = (value) => {
  if (!value) return null;

  return String(value._id || value.id || value);
};

const getDonationCompletedAt = (donation) => {
  const historyCompletedAt = [
    ...(donation.statusHistory || []),
  ]
    .reverse()
    .find(
      (item) =>
        String(item.status || "")
          .trim()
          .toLowerCase() === "completed" &&
        item.changedAt
    )?.changedAt;

  return (
    donation.verification?.verifiedAt ||
    historyCompletedAt ||
    null
  );
};

// Completed donation-এর জন্য প্রকৃত completion date ব্যবহার হবে।
// Pending/Accepted donation-এর ক্ষেত্রে createdAt ব্যবহার হবে।
const getDonationReportDate = (donation) => {
  const status = normalizeStatus(donation);

  if (status === "Completed") {
    return getDonationCompletedAt(donation);
  }

  return donation.createdAt || null;
};

const getAcceptedNgoIds = (donation) => {
  const ids = new Set();

  // Selected NGO
  const selectedNgoId = getId(donation.selectedNgo);

  if (selectedNgoId) {
    ids.add(selectedNgoId);
  }

  // Multiple NGO request support
  (donation.ngoRequests || []).forEach((request) => {
    const requestStatus = String(
      request.status || ""
    ).trim().toLowerCase();

    if (
      [
        "accepted",
        "completed",
        "out for delivery",
      ].includes(requestStatus)
    ) {
      const ngoId = getId(request.requestedBy);

      if (ngoId) {
        ids.add(ngoId);
      }
    }
  });

  // Legacy single NGO request support
  if (donation.ngoRequest?.requestedBy) {
    const legacyStatus = normalizeStatus(donation);

    if (
      [
        "Accepted",
        "Out for Delivery",
        "Completed",
      ].includes(legacyStatus)
    ) {
      const ngoId = getId(
        donation.ngoRequest.requestedBy
      );

      if (ngoId) {
        ids.add(ngoId);
      }
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

const addDonationToStats = (stats, donation) => {
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

// ======================================================
// GET ALL DONORS
// ======================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "donor",
    })
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
      const restaurant = restaurantByUser.get(
        String(user._id)
      );

      return {
        id: String(user._id),
        name: user.name || "N/A",
        email: user.email || "N/A",
        role: user.role,
        status: user.isBlocked
          ? "Blocked"
          : user.status || "Active",
        isBlocked: Boolean(user.isBlocked),
        createdAt: user.createdAt || null,
        location:
          restaurant?.address || "Not provided",
        phone:
          restaurant?.phone || "Not provided",
        tradeLicense:
          restaurant?.tradeLicense || "Not provided",
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
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL NGOS
// ======================================================

const getAllNgos = async (req, res) => {
  try {
    const ngos = await Ngo.find()
      .populate(
        "user",
        "name email role status isBlocked createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    const formattedNgos = ngos.map((ngo) => {
      const user =
        ngo.user && typeof ngo.user === "object"
          ? ngo.user
          : {};

      return {
        id: String(ngo._id),

        userId: user._id
          ? String(user._id)
          : null,

        name: user.name || ngo.name || "N/A",

        email: user.email || ngo.email || "N/A",

        role: user.role || "ngo",

        status: user.isBlocked
          ? "Blocked"
          : user.status || "Active",

        isBlocked: Boolean(user.isBlocked),

        createdAt:
          user.createdAt ||
          ngo.createdAt ||
          null,

        phone: ngo.phone || "Not provided",

        address: ngo.address || "Not provided",

        location: ngo.address || "Not provided",

        organizationId:
          ngo.organizationId || "N/A",
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
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE USER STATUS / BLOCK STATUS
// ======================================================

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "User status is required.",
      });
    }

    let user = await User.findById(id);

    if (!user) {
      const ngoRecord = await Ngo.findById(id);

      if (ngoRecord) {
        user = await User.findById(ngoRecord.user);
      }
    }

    if (!user) {
      const restaurantRecord =
        await Restaurant.findById(id);

      if (restaurantRecord) {
        user = await User.findById(
          restaurantRecord.user
        );
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isBlocked =
      String(status).trim().toLowerCase() ===
      "blocked";

    user.isBlocked = isBlocked;
    user.status = isBlocked
      ? "Blocked"
      : "Active";

    await user.save();

    // Create notification
    try {
      await Notification.create({
        recipient: user._id,

        title: isBlocked
          ? "🚫 Account Blocked"
          : "✨ Account Activated",

        message: isBlocked
          ? "Your account has been blocked by the admin. You are restricted from logging in."
          : "Your account has been activated by the admin.",

        type: "ADMIN_STATUS",
      });
    } catch (notificationError) {
      console.error(
        "Notification creation warning:",
        notificationError.message
      );
    }

    // Real-time admin update
    try {
      const io = getIO();

      if (io && rooms?.admin) {
        io.to(rooms.admin()).emit(
          "user:updated",
          {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            isBlocked: user.isBlocked,
          }
        );
      }
    } catch (socketError) {
      console.error(
        "User status socket warning:",
        socketError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      user,
    });
  } catch (error) {
    console.error("Update User Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN WARNING / FEEDBACK NOTIFICATION
// ======================================================

const sendAdminFeedback = async (req, res) => {
  try {
    const { feedbackId, message } = req.body;

    if (!feedbackId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Feedback ID and warning message are required.",
      });
    }

    const feedback = await Feedback.findById(
      feedbackId
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    let recipientId = null;
    let recipientRole = null;
    let recipientUser = null;

    // Donor feedback
    if (
      String(feedback.submittedBy).toLowerCase() ===
      "donor"
    ) {
      recipientId = feedback.donor;
      recipientRole = "donor";

      if (recipientId) {
        recipientUser = await User.findById(
          recipientId
        );
      }
    }

    // NGO feedback
    else if (
      String(feedback.submittedBy).toLowerCase() ===
      "ngo"
    ) {
      const ngo = await Ngo.findById(
        feedback.ngo
      ).select("user");

      recipientId = ngo?.user || null;
      recipientRole = "ngo";

      if (recipientId) {
        recipientUser = await User.findById(
          recipientId
        );
      }
    }

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message:
          "Recipient user could not be found for this feedback.",
      });
    }

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
    console.error(
      "Send Admin Feedback Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send warning notification.",
      error: error.message,
    });
  }
};

// ======================================================
// GET ALL DONATIONS - ADMIN
// ======================================================

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
      .populate(
        "statusHistory.changedBy",
        "name email"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error(
      "Get All Donations Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load donations.",
      error: error.message,
    });
  }
};

// ======================================================
// ADMIN DASHBOARD OVERVIEW STATS
// ======================================================

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonations,
      pendingDonations,
      feedbackCount,
      completedDonations,
      recentDonations,
    ] = await Promise.all([
      User.countDocuments({
        role: {
          $in: ["donor", "ngo"],
        },
      }),

      Donation.countDocuments(),

      Donation.countDocuments({
        $or: [
          {
            pipelineStatus: {
              $in: ["Pending", "pending"],
            },
          },
          {
            status: {
              $in: [
                "Pending",
                "pending",
                "Waiting for NGO Acceptance",
              ],
            },
          },
        ],
      }),

      Feedback.countDocuments(),

      Donation.find({
        $or: [
          {
            pipelineStatus: {
              $in: [
                "Completed",
                "completed",
                "Delivered",
                "delivered",
              ],
            },
          },
          {
            status: {
              $in: [
                "Completed",
                "completed",
                "Delivered",
                "delivered",
              ],
            },
          },
        ],
      })
        .select("quantity")
        .lean(),

      Donation.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("donor", "name")
        .lean(),
    ]);

    const totalFoodDistributed =
      completedDonations.reduce(
        (sum, donation) =>
          sum + (Number(donation.quantity) || 0),
        0
      );

    const recentActivities = recentDonations.map(
      (donation) => ({
        id: donation._id,

        text: `🍽️ ${
          donation.donor?.name || "A restaurant"
        } posted ${
          donation.quantity || 0
        } kg of ${
          donation.foodName || "food"
        }`,

        time: donation.createdAt,
      })
    );

    return res.status(200).json({
      success: true,

      totalUsers,

      totalDonations,

      pendingDonations,

      completedDonations:
        completedDonations.length,

      feedbackCount,

      availableFood: `${totalFoodDistributed} kg`,

      totalFoodDistributed,

      recentActivities,
    });
  } catch (error) {
    console.error(
      "Get dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard statistics.",
      error: error.message,
    });
  }
};

// ======================================================
// ADVANCED ADMIN REPORTS & ANALYTICS
// ======================================================

const getAdvancedReports = async (req, res) => {
  try {
    const selectedYear =
      Number(req.query.year) ||
      new Date().getFullYear();

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

    const [donors, ngos, donations] =
      await Promise.all([
        User.find({
          role: "donor",
        })
          .select("name email createdAt")
          .lean(),

        Ngo.find()
          .populate(
            "user",
            "name email createdAt"
          )
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
            [
              "donor",
              "selectedNgo",
              "ngoRequests",
              "ngoRequest",
              "quantity",
              "pipelineStatus",
              "status",
              "createdAt",
              "verification",
              "statusHistory",
              "foodName",
            ].join(" ")
          )
          .lean(),
      ]);

    // --------------------------------------------------
    // NGO MAP
    // --------------------------------------------------

    const getNgoName = (ngo) =>
      ngo?.user?.name ||
      ngo?.name ||
      "Unknown NGO";

    const ngoMap = new Map(
      ngos.map((ngo) => [
        String(ngo._id),
        ngo,
      ])
    );

    // --------------------------------------------------
    // DATE FILTER
    // --------------------------------------------------

    const yearStart = new Date(
      selectedYear,
      0,
      1
    );

    const nextYearStart = new Date(
      selectedYear + 1,
      0,
      1
    );

    const yearDonations = donations.filter(
      (donation) => {
        const reportDate =
          getDonationReportDate(donation);

        if (!reportDate) return false;

        const date = new Date(reportDate);

        return (
          !Number.isNaN(date.getTime()) &&
          date >= yearStart &&
          date < nextYearStart
        );
      }
    );

    const filteredDonations = selectedMonth
      ? yearDonations.filter((donation) => {
          const reportDate =
            getDonationReportDate(donation);

          if (!reportDate) return false;

          const date = new Date(reportDate);

          return (
            !Number.isNaN(date.getTime()) &&
            date.getMonth() + 1 ===
              selectedMonth
          );
        })
      : yearDonations;

    // --------------------------------------------------
    // DONOR REPORTS
    // --------------------------------------------------

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

    // --------------------------------------------------
    // NGO REPORTS
    // --------------------------------------------------

    const ngoStats = new Map();

    ngos.forEach((ngo) => {
      ngoStats.set(String(ngo._id), {
        id: String(ngo._id),

        userId: ngo.user?._id
          ? String(ngo.user._id)
          : null,

        name: getNgoName(ngo),

        email:
          ngo.user?.email ||
          ngo.email ||
          "",

        joinedAt:
          ngo.user?.createdAt ||
          ngo.createdAt,

        ...makeEmptyStats(),
      });
    });

    // --------------------------------------------------
    // MONTHLY TREND
    // --------------------------------------------------

    const monthlyTrend = Array.from(
      { length: 12 },
      (_, index) => ({
        month: index + 1,

        label: new Date(
          selectedYear,
          index,
          1
        ).toLocaleString("en-US", {
          month: "short",
        }),

        donations: 0,

        quantity: 0,

        completed: 0,

        donorQuantity: 0,

        ngoQuantity: 0,
      })
    );

    // --------------------------------------------------
    // YEARLY TREND
    // --------------------------------------------------

    const yearlyTrend = Array.from(
      { length: 5 },
      (_, index) => {
        const year =
          selectedYear - 4 + index;

        return {
          year,

          donations: 0,

          quantity: 0,

          completed: 0,

          donorQuantity: 0,

          ngoQuantity: 0,
        };
      }
    );

    // --------------------------------------------------
    // STATUS BREAKDOWN
    // --------------------------------------------------

    const overallStatus = {
      Pending: 0,
      Accepted: 0,
      "Out for Delivery": 0,
      Completed: 0,
      Rejected: 0,
    };

    // --------------------------------------------------
    // PROCESS ALL DONATIONS
    // --------------------------------------------------

    donations.forEach((donation) => {
      const donorId = getId(donation.donor);

      const status =
        normalizeStatus(donation);

      const quantity =
        Number(donation.quantity) || 0;

      const reportDate =
        getDonationReportDate(donation);

      const date = reportDate
        ? new Date(reportDate)
        : null;

      const validDate =
        date &&
        !Number.isNaN(date.getTime());

      const donationYear = validDate
        ? date.getFullYear()
        : null;

      const donationMonth = validDate
        ? date.getMonth()
        : null;

      // Donor totals
      const donorRecord =
        donorStats.get(donorId);

      if (donorRecord) {
        addDonationToStats(
          donorRecord,
          donation
        );
      }

      // NGO totals
      const acceptedNgoIds =
        getAcceptedNgoIds(donation);

      acceptedNgoIds.forEach((ngoId) => {
        const ngoRecord =
          ngoStats.get(ngoId);

        if (ngoRecord) {
          addDonationToStats(
            ngoRecord,
            donation
          );
        }
      });

      // Yearly trend
      if (
        donationYear !== null &&
        donationYear >= selectedYear - 4 &&
        donationYear <= selectedYear
      ) {
        const yearlyRecord =
          yearlyTrend.find(
            (item) =>
              item.year === donationYear
          );

        if (yearlyRecord) {
          yearlyRecord.donations += 1;

          yearlyRecord.quantity += quantity;

          yearlyRecord.donorQuantity +=
            quantity;

          if (status === "Completed") {
            yearlyRecord.completed += 1;
          }

          if (acceptedNgoIds.length > 0) {
            yearlyRecord.ngoQuantity +=
              quantity;
          }
        }
      }

      // Monthly trend
      if (
        donationYear === selectedYear &&
        donationMonth !== null
      ) {
        const monthRecord =
          monthlyTrend[donationMonth];

        monthRecord.donations += 1;

        monthRecord.quantity += quantity;

        monthRecord.donorQuantity +=
          quantity;

        if (status === "Completed") {
          monthRecord.completed += 1;
        }

        if (acceptedNgoIds.length > 0) {
          monthRecord.ngoQuantity +=
            quantity;
        }
      }
    });

    // --------------------------------------------------
    // SELECTED PERIOD DONOR STATS
    // --------------------------------------------------

    const selectedDonorStats = new Map();

    donors.forEach((donor) => {
      selectedDonorStats.set(
        String(donor._id),
        {
          ...makeEmptyStats(),

          id: String(donor._id),

          name:
            donor.name || "Unknown Donor",

          email: donor.email || "",
        }
      );
    });

    // --------------------------------------------------
    // SELECTED PERIOD NGO STATS
    // --------------------------------------------------

    const selectedNgoStats = new Map();

    ngos.forEach((ngo) => {
      selectedNgoStats.set(
        String(ngo._id),
        {
          ...makeEmptyStats(),

          id: String(ngo._id),

          name: getNgoName(ngo),

          email: ngo.user?.email || "",
        }
      );
    });

    // --------------------------------------------------
    // PROCESS SELECTED YEAR / MONTH
    // --------------------------------------------------

    filteredDonations.forEach((donation) => {
      const donorId = getId(donation.donor);

      const donorRecord =
        selectedDonorStats.get(donorId);

      if (donorRecord) {
        addDonationToStats(
          donorRecord,
          donation
        );
      }

      getAcceptedNgoIds(donation).forEach(
        (ngoId) => {
          const ngoRecord =
            selectedNgoStats.get(ngoId);

          if (ngoRecord) {
            addDonationToStats(
              ngoRecord,
              donation
            );
          }
        }
      );

      const status =
        normalizeStatus(donation);

      if (
        Object.prototype.hasOwnProperty.call(
          overallStatus,
          status
        )
      ) {
        overallStatus[status] += 1;
      }
    });

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    const sumStats = (records) =>
      [...records.values()].reduce(
        (total, item) => {
          Object.keys(makeEmptyStats()).forEach(
            (key) => {
              total[key] +=
                Number(item[key]) || 0;
            }
          );

          return total;
        },
        makeEmptyStats()
      );

    const donorSummary = sumStats(
      selectedDonorStats
    );

    const ngoSummary = sumStats(
      selectedNgoStats
    );

    // --------------------------------------------------
    // TOP DONORS
    // --------------------------------------------------

    const topDonors = [
      ...selectedDonorStats.values(),
    ]
      .filter(
        (item) => item.donations > 0
      )
      .sort(
        (a, b) => b.quantity - a.quantity
      )
      .slice(0, 5);

    // --------------------------------------------------
    // TOP NGOS
    // --------------------------------------------------

    const topNgos = [
      ...selectedNgoStats.values(),
    ]
      .filter(
        (item) => item.donations > 0
      )
      .sort(
        (a, b) =>
          b.completedQuantity -
          a.completedQuantity
      )
      .slice(0, 5);

    // --------------------------------------------------
    // OVERALL SUMMARY
    // --------------------------------------------------

    const overall = {
      totalUsers:
        donors.length + ngos.length,

      totalDonors: donors.length,

      totalNgos: ngos.length,

      totalDonations:
        filteredDonations.length,

      totalFoodDonated:
        donorSummary.quantity,

      totalFoodReceived:
        ngoSummary.quantity,

      totalFoodDistributed:
        ngoSummary.completedQuantity,

      completedDonations:
        overallStatus.Completed,

      pendingDonations:
        overallStatus.Pending,

      feedbackCount:
        await Feedback.countDocuments(),
    };

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

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

      statusBreakdown: Object.entries(
        overallStatus
      ).map(([status, count]) => ({
        status,
        count,
      })),
    });
  } catch (error) {
    console.error(
      "Advanced reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load advanced reports.",
      error: error.message,
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getAllUsers,
  updateUserStatus,
  getAllDonations,
  getDashboardStats,
  getAllNgos,
  sendAdminFeedback,
  getAdvancedReports,
};