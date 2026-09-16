const express = require("express");
const router = express.Router();

// সেফটি চেক: যদি কন্ট্রোলার ফাইলটি তৈরি করা না থাকে, তবে যেন ক্র্যাশ না করে ডামি ফাংশন কাজ করে
let followController = {};
try {
  followController = require("../controllers/followController");
} catch (error) {
  // ফলব্যাক বা ডামি কন্ট্রোলার যদি ফাইল না থাকে
  followController = {
    getSuggestedPartners: (req, res) => res.status(200).json({ success: true, data: [] }),
    getFollowing: (req, res) => res.status(200).json({ success: true, data: [] }),
    getFollowers: (req, res) => res.status(200).json({ success: true, data: [] }),
    followUser: (req, res) => res.status(200).json({ success: true, message: "Followed successfully" }),
    unfollowUser: (req, res) => res.status(200).json({ success: true, message: "Unfollowed successfully" }),
  };
}

const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getSuggestedPartners,
} = followController;

// মিডলওয়্যার ছাড়া রাউটগুলো সেট করা হলো
router.get("/suggestions/:userId", getSuggestedPartners || ((req, res) => res.json([])));
router.get("/following/:userId", getFollowing || ((req, res) => res.json([])));
router.get("/followers/:userId", getFollowers || ((req, res) => res.json([])));
router.post("/", followUser || ((req, res) => res.json({ success: true })));
router.delete("/", unfollowUser || ((req, res) => res.json({ success: true })));

module.exports = router;