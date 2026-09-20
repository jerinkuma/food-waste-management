const express = require("express");
const router = express.Router();
const { 
  getActiveRequests, 
  archiveRequest 
} = require("../controllers/requestController");

// ১. সকল অ্যাক্টিভ ও ম্যাপের রিকোয়েস্ট আনার রাউট
router.get("/", getActiveRequests); // অথবা চাইলে "/mine" রাখতে পারেন

// ২. রিকোয়েস্ট স্ট্যাটাস আপডেট বা আর্কাইভ করার রাউট (Accept, Decline, Archive ইত্যাদি)
router.put("/:id", archiveRequest);

module.exports = router;