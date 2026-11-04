const express = require("express");
const router = express.Router();
const { getAdvancedAnalytics } = require("../controllers/analyticsController");

router.get("/advanced-analytics", getAdvancedAnalytics);

module.exports = router;