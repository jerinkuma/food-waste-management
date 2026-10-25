const express = require("express");
const router = express.Router();
const {
  getCompletedDonationsForNGO,
  submitRating,
} = require("../controllers/ratingController");

router.get("/ngo/:ngoId", getCompletedDonationsForNGO);

router.post("/", submitRating);

module.exports = router;