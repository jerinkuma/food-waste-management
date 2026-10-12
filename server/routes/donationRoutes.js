
const express = require("express");

const router = express.Router();

const {
  createDonation,
  getDonationById,
  getDonationByDonationId,

  verifyDonation,
  rejectDonation,

  getDonorDonations,
  getDonorDashboard,

  listAvailableDonations,
  acceptDonation,

  updateDonationStatus,

  getNgoDonations,
  assignDeliveryDriver,
} = require("../controllers/donationController");

const {
  protect,
  restrictTo,
} = require("../middleware/authMiddleware");

// ======================================================
// CREATE DONATION
// ======================================================
router.post("/", createDonation);

// ======================================================
// AVAILABLE DONATIONS
// Public because NGOs can browse available donations.
// ======================================================
router.get(
  "/available",
  listAvailableDonations
);

// ======================================================
// NGO DONATIONS
// ======================================================
router.get(
  "/ngo/:ngoId",
  getNgoDonations
);

// ======================================================
// ACCEPT DONATION
// NGO ONLY
// ======================================================
router.put(
  "/:id/accept",
  protect,
  restrictTo("ngo"),
  acceptDonation
);

// ======================================================
// ASSIGN DELIVERY DRIVER
// NGO ONLY
// ======================================================
router.put(
  "/:id/assign-driver",
  protect,
  restrictTo("ngo"),
  assignDeliveryDriver
);

// ======================================================
// UPDATE DONATION STATUS
// NGO / DONOR / ADMIN
// ======================================================
router.put(
  "/:id/status",
  protect,
  restrictTo("ngo", "donor", "admin"),
  updateDonationStatus
);

// ======================================================
// DONOR DASHBOARD
// ======================================================
router.get(
  "/dashboard/:donorId",
  getDonorDashboard
);

// ======================================================
// GET BY CUSTOM DONATION ID
// ======================================================
router.get(
  "/donation-id/:donationId",
  getDonationByDonationId
);

// ======================================================
// DONOR DONATIONS
// ======================================================
router.get(
  "/donor/:donorId",
  getDonorDonations
);

// ======================================================
// SAFETY VERIFICATION
// NGO ONLY
// ======================================================
router.post(
  "/:id/verify",
  protect,
  restrictTo("ngo"),
  verifyDonation
);

// ======================================================
// REJECT DONATION
// NGO ONLY
// ======================================================
router.post(
  "/:id/reject",
  protect,
  restrictTo("ngo"),
  rejectDonation
);

// ======================================================
// GET SINGLE DONATION
// Keep this LAST because it uses /:id
// ======================================================
router.get(
  "/:id",
  getDonationById
);

module.exports = router;

