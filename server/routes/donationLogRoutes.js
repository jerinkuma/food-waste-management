const express = require("express");
const router = express.Router();
const { getDonationLogs } = require("../controllers/donationLogController");

router.get("/all", getDonationLogs);

module.exports = router;