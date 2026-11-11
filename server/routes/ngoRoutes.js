const express = require('express');
const router = express.Router();

// কন্ট্রোলার থেকে সঠিক ফাংশনগুলো রিকোয়ার করা হচ্ছে (updateNgoProfile এবং changeNgoPassword সহ)
const {
  getNgoProfile,
  updateNgoProfile,
  changeNgoPassword,
  getNgoStats,
  getNgoCompletedDonations,
  submitDistributionProof,
  getDonorDistributionProofs,
} = require("../controllers/ngoController");

const { protect, restrictTo } = require("../middleware/authMiddleware");

// রাউটগুলো রেজিস্টার করা
router.get('/profile', protect, restrictTo("ngo"), getNgoProfile);

// নতুন যোগ করা হলো: এনজিও প্রোফাইল আপডেট (এভার্টার বা ইনফো সহ)
router.put('/settings/profile', protect, restrictTo("ngo"), updateNgoProfile);

// নতুন যোগ করা হলো: এনজিও পাসওয়ার্ড পরিবর্তন রাউট
router.put('/settings/password', protect, restrictTo("ngo"), changeNgoPassword);

router.get('/stats', protect, restrictTo("ngo"), getNgoStats);
router.get('/completed-donations', protect, restrictTo("ngo"), getNgoCompletedDonations); // কমপ্লিটেড ডোনেশন ফেচ করার রাউট

router.post(
  "/submit-distribution",
  protect,
  restrictTo("ngo"),
  submitDistributionProof
);

router.get(
  "/donor/distribution-proofs",
  protect,
  restrictTo("donor"),
  getDonorDistributionProofs
);

module.exports = router;