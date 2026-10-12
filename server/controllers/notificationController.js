const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");

// =====================================
// GET USER ID FROM JWT
// =====================================
const getUserIdFromReq = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );

    return decoded.id || decoded.userId || null;
  } catch (error) {
    return null;
  }
};

// =====================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// =====================================
const getMyNotifications = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized / Token missing",
      });
    }

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("donation")
      .populate("feedback")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
      error: error.message,
    });
  }
};

// =====================================
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// =====================================
const getUnreadCount = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized / Token missing",
      });
    }

    const count = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get unread notification count.",
      error: error.message,
    });
  }
};

// =====================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// =====================================
const markAsRead = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized / Token missing",
      });
    }

    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        recipient: userId,
      },
      {
        read: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
      error: error.message,
    });
  }
};

// =====================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// =====================================
const markAllAsRead = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized / Token missing",
      });
    }

    const result = await Notification.updateMany(
      {
        recipient: userId,
        read: false,
      },
      {
        read: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read.",
      error: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};