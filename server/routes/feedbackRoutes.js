
const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");
const {
  protect,
  restrictTo,
} = require("../middleware/authMiddleware");

// ======================================================
// DONOR -> NGO FEEDBACK
// ======================================================

// Donor submits text feedback to NGO
router.post(
  "/donor",
  protect,
  restrictTo("donor"),
  feedbackController.submitDonorFeedback
);

// Donor views NGO reviews and own feedback status
router.get(
  "/donor/ngo-reviews",
  protect,
  restrictTo("donor"),
  feedbackController.getDonorNgoReviews
);

// ======================================================
// NGO -> DONOR FEEDBACK
// ======================================================

// NGO submits feedback about Donor
router.post(
  "/",
  protect,
  restrictTo("ngo"),
  feedbackController.submitFeedback
);

// ======================================================
// ADMIN FEEDBACK MANAGEMENT
// ======================================================

// Admin views all feedback
router.get(
  "/admin",
  protect,
  restrictTo("admin"),
  feedbackController.getAdminFeedback
);

// Admin approves or declines feedback
router.patch(
  "/:id/status",
  protect,
  restrictTo("admin"),
  feedbackController.updateFeedbackStatus
);

// ======================================================
// NGO FEEDBACK VIEW
// ======================================================

// NGO views its own feedback and Admin-approved Donor feedback
router.get(
  "/ngo/:ngoId",
  protect,
  restrictTo("ngo"),
  feedbackController.getNgoFeedbacks
);

// NGO views feedback without passing NGO ID
router.get(
  "/ngo",
  protect,
  restrictTo("ngo"),
  feedbackController.getNgoFeedbacks
);

// ======================================================
// DEFAULT ADMIN FEEDBACK ROUTE
// ======================================================

router.get(
  "/",
  protect,
  restrictTo("admin"),
  feedbackController.getAdminFeedback
);

module.exports = router;
