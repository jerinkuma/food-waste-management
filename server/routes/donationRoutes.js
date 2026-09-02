const express = require("express");

const {
  createDonation,
  getDonationById,
  getDonationByDonationId,
  verifyDonation,
  rejectDonation,
  getDonorDonations,
  getDonorDashboard,
} = require("../controllers/donationController");

const router = express.Router();

// =====================================
// CREATE DONATION
// =====================================

router.post("/", createDonation);

// =====================================
// DONOR DASHBOARD
// IMPORTANT:
// এই route /:id এর আগে রাখতে হবে
// =====================================

router.get(
  "/dashboard/:donorId",
  getDonorDashboard
);

// =====================================
// GET DONATION BY DONATION ID
// =====================================

router.get(
  "/donation-id/:donationId",
  getDonationByDonationId
);

// =====================================
// GET ALL DONATIONS OF A DONOR
// =====================================

router.get(
  "/donor/:donorId",
  getDonorDonations
);

// =====================================
// GET DONATION BY MONGODB ID
// =====================================

router.get(
  "/:id",
  getDonationById
);

// =====================================
// VERIFY DONATION
// =====================================

router.post(
  "/:id/verify",
  verifyDonation
);

// =====================================
// REJECT DONATION
// =====================================

router.post(
  "/:id/reject",
  rejectDonation
);

module.exports = router;