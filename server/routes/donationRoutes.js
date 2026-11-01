
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
  selectNgoForDonation,

  updateDonationStatus,

  getNgoDonations,
  assignDeliveryDriver,
  declineNgoRequest,
} = require("../controllers/donationController");

const {
  getImpactStats,
} = require("../controllers/impactController");

const {
  protect,
  restrictTo,
} = require("../middleware/authMiddleware");

// PUBLIC HOMEPAGE IMPACT STATISTICS
// ======================================================
router.get("/impact-stats", getImpactStats);

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
// ACCEPT / REQUEST DONATION
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
// DONOR SELECTS ONE NGO
// DONOR ONLY
// ======================================================
router.patch(
  "/:id/select-ngo/:ngoId",
  protect,
  restrictTo("donor"),
  selectNgoForDonation
);

router.patch(
  "/:id/decline-ngo/:ngoId",
  protect,
  restrictTo("donor"),
  declineNgoRequest
);

// ======================================================
// GET SINGLE DONATION
// Keep this LAST because it uses /:id
// ======================================================
router.get(
  "/:id",
  getDonationById
);


// ======================================================


module.exports = router;
