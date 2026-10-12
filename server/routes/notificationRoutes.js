const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

// =====================================
// GET ALL MY NOTIFICATIONS
// GET /api/notifications
// =====================================
router.get("/", getMyNotifications);

// =====================================
// GET UNREAD COUNT
// GET /api/notifications/unread-count
// =====================================
router.get("/unread-count", getUnreadCount);

// =====================================
// MARK ALL AS READ
// PATCH /api/notifications/read-all
// =====================================
router.patch("/read-all", markAllAsRead);

// =====================================
// MARK ONE AS READ
// PATCH /api/notifications/:id/read
// =====================================
router.patch("/:id/read", markAsRead);

module.exports = router;