const express = require("express");
const router = express.Router();
const {
  followPartner,
  unfollowPartner,
  getFollowing,
  getFollowers,
  getSuggestions,
  getPartnerDetails,
} = require("../controllers/followController");

// Follow & Unfollow routes
router.post("/follow", followPartner);
router.post("/unfollow", unfollowPartner);

// Partner lists
router.get("/following/:userId", getFollowing);
router.get("/followers/:userId", getFollowers);
router.get("/suggestions/:userId", getSuggestions);

// Partner details, live inventory, and history route
router.get("/details/:restaurantUserId", getPartnerDetails);

module.exports = router;