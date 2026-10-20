const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  getAllDonations,
  getDashboardStats,
  getAllNgos,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

router.get("/dashboard-stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/status", protect, restrictTo("admin"), updateUserStatus);
router.get("/donations", getAllDonations);

router.get("/ngos", protect, restrictTo("admin"), getAllNgos);

module.exports = router;
