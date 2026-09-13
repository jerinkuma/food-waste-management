const express = require("express");
const router = express.Router();
const { 
  getNgoProfile, 
  getNgoStats 
} = require("../controllers/ngoController");

// এনজিও প্রোফাইল ও স্ট্যাটাস রাউট
router.get("/profile", getNgoProfile);
router.get("/stats", getNgoStats);

module.exports = router;