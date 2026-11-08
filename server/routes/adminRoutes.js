const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  getAllDonations,
  getDashboardStats,
  getAllNgos,
  sendAdminFeedback,
  getAdvancedReports,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");



router.get("/dashboard-stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/status", protect, restrictTo("admin"), updateUserStatus);
router.get("/donations", getAllDonations);
router.get("/ngos", protect, restrictTo("admin"), getAllNgos);

// 👉 সঠিক রুট পাথ: ফ্রন্টএন্ডের সাথে মিল রেখে '/feedback/send-warning' করা হলো
router.post("/feedback/send-warning", protect, restrictTo("admin"), sendAdminFeedback);
router.get(
  "/advanced-reports",
  protect,
  restrictTo("admin"),
  getAdvancedReports
);

module.exports = router;