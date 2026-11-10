
const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedbackController");
const {
  protect,
  restrictTo,
} = require("../middleware/authMiddleware");

// ======================================================
// DONOR -> NGO
// ======================================================

// Donor submits text feedback to NGO
router.post(
  "/donor",
  protect,
  restrictTo("donor"),
  feedbackController.submitDonorFeedback
);

// Donor rates an NGO that requested their donation
router.post(
  "/donor/rating",
  protect,
  restrictTo("donor"),
  feedbackController.submitDonorNgoRating
);

// Donor views NGO requests, feedback status and ratings
router.get(
  "/donor/ngo-reviews",
  protect,
  restrictTo("donor"),
  feedbackController.getDonorNgoReviews
);

// ======================================================
// NGO -> DONOR
// ======================================================

router.post(
  "/",
  protect,
  restrictTo("ngo"),
  feedbackController.submitFeedback
);

// ======================================================
// ADMIN
// ======================================================

router.get(
  "/admin",
  protect,
  restrictTo("admin"),
  feedbackController.getAdminFeedback
);

router.patch(
  "/:id/status",
  protect,
  restrictTo("admin"),
  feedbackController.updateFeedbackStatus
);

// ======================================================
// NGO FEEDBACK VIEW
// ======================================================

router.get(
  "/ngo/:ngoId",
  protect,
  restrictTo("ngo"),
  feedbackController.getNgoFeedbacks
);

router.get(
  "/ngo",
  protect,
  restrictTo("ngo"),
  feedbackController.getNgoFeedbacks
);

// Default admin feedback route
router.get(
  "/",
  protect,
  restrictTo("admin"),
  feedbackController.getAdminFeedback
);

module.exports = router;
