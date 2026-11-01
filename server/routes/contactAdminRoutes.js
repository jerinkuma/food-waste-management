
const express = require("express");
const router = express.Router();

const {
  getContactMessages,
  getUnreadContactCount,
  updateContactMessageStatus,
  replyToContactMessage,
} = require("../controllers/contactController");

const {
  protect,
  restrictTo,
} = require("../middleware/authMiddleware");

// Every route in this file requires Admin authentication.
router.use(protect, restrictTo("admin"));

router.get("/", getContactMessages);
router.get("/unread-count", getUnreadContactCount);
router.patch("/:id/status", updateContactMessageStatus);
router.post("/:id/reply", replyToContactMessage);

module.exports = router;
