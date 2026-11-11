const express = require("express");
const router = express.Router();
const {
  getCompletedDonationsForNGO,
  submitRating,
  getNgoReceivedRatings,
} = require("../controllers/ratingController");

// কমপ্লিটেড ডোনেশন ফেচ করার রাউট
router.get("/ngo/:ngoId", getCompletedDonationsForNGO);

// রেস্টুরেন্ট রেটিং ভিউর জন্য নতুন রাউট
router.get("/ngo-ratings/:ngoId", getNgoReceivedRatings);

// রেটিং সাবমিট করার রাউট
router.post("/", submitRating);

module.exports = router;