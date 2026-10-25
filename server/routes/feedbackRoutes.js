const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");

// কন্ট্রোলার থেকে ফাংশনগুলো নিরাপদভাবে নেওয়া
const {
  submitFeedback = (req, res) => res.status(500).json({ message: "submitFeedback undefined" }),
  getAdminFeedback = (req, res) => res.status(500).json({ message: "getAdminFeedback undefined" }),
  getRestaurantFeedback = (req, res) => res.status(500).json({ message: "getRestaurantFeedback undefined" }),
  getNgoFeedbacks = (req, res) => res.status(500).json({ message: "getNgoFeedbacks undefined" }),
  respondToFeedback = (req, res) => res.status(500).json({ message: "respondToFeedback undefined" }),
  updateFeedbackStatus = (req, res) => res.status(500).json({ message: "updateFeedbackStatus undefined" }),
  markFeedbackRead = (req, res) => res.status(500).json({ message: "markFeedbackRead undefined" }),
} = feedbackController || {};

// রাউটসমূহ
router.post("/", submitFeedback);
router.get("/admin", getAdminFeedback);
router.get("/restaurant/:restaurantId", getRestaurantFeedback);
router.get("/ngo/:ngoId", getNgoFeedbacks);
router.get("/ngo", getNgoFeedbacks);
router.put("/:id/respond", respondToFeedback);
router.patch("/:id/status", updateFeedbackStatus);
router.patch("/:id/read", markFeedbackRead);
router.get("/", getAdminFeedback);

module.exports = router;
