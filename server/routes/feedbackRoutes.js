const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getAdminFeedback,
  getRestaurantFeedback,
  getNgoFeedbacks,
  respondToFeedback,
  markFeedbackRead,
} = require("../controllers/feedbackController");

// Submit feedback -> dual-routed to Admin + Restaurant
router.post("/", submitFeedback);

// Admin inbox
router.get("/admin", getAdminFeedback);

// Restaurant inbox
router.get("/restaurant/:restaurantId", getRestaurantFeedback);

// NGO's own submitted feedback
router.get("/ngo/:ngoId", getNgoFeedbacks);

// Restaurant responds to a piece of feedback
router.put("/:id/respond", respondToFeedback);

// Mark read by a given viewer
router.patch("/:id/read", markFeedbackRead);

// Backwards-compatible generic list (kept for anything still calling GET /api/feedback)
router.get("/", getAdminFeedback);

module.exports = router;
