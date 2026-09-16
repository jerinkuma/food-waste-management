const express = require("express");
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট (নিরাপদ ফলব্যাক সহ)
let donationController = {};
try {
  donationController = require("../controllers/donationController");
} catch (err) {
  console.error("Donation controller load warning:", err.message);
}

const {
  createDonation = (req, res) => res.status(501).json({ message: "Not Implemented" }),
  listAvailableDonations = (req, res) => res.json({ success: true, data: [] }), // নামটি এখানে ঠিক করা হলো
  getDonationById = (req, res) => res.status(501).json({ message: "Not Implemented" }),
  getDonationByDonationId = (req, res) => res.status(501).json({ message: "Not Implemented" }),
  verifyDonation = (req, res) => res.status(501).json({ message: "Not Implemented" }),
  rejectDonation = (req, res) => res.status(501).json({ message: "Not Implemented" }),
  getDonorDonations = (req, res) => res.json({ success: true, data: [] }),
  getDonorDashboard = (req, res) => res.json({ success: true, data: {} }),
  getNgoDonations = (req, res) => res.json({ success: true, data: [] }),
  acceptDonation = (req, res) => res.status(501).json({ message: "Not Implemented" }),
  updateDonationStatus = (req, res) => res.status(501).json({ message: "Not Implemented" }),
} = donationController;

const { protect, restrictTo } = require("../middleware/authMiddleware") || {
  protect: (req, res, next) => next(),
  restrictTo: () => (req, res, next) => next()
};

// =====================================
// ROUTES DEFINITION
// =====================================

router.post("/", createDonation);

// স্পেসিফিক রুটগুলো ডায়নামিক রাউটের উপরে থাকতে হবে
router.get("/available", listAvailableDonations); // এখানে ফাংশনটি যুক্ত করা হলো
router.get("/ngo/:ngoId", getNgoDonations);
router.put("/:id/accept", protect, restrictTo("ngo"), acceptDonation);
router.put("/:id/status", protect, restrictTo("ngo", "donor", "admin"), updateDonationStatus);
router.get("/dashboard/:donorId", getDonorDashboard);
router.get("/donation-id/:donationId", getDonationByDonationId);
router.get("/donor/:donorId", getDonorDonations);

// ডায়নামিক আইডি রুট
router.get("/:id", getDonationById);

router.post("/:id/verify", verifyDonation);
router.post("/:id/reject", rejectDonation);

module.exports = router;