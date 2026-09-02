const express = require("express");

const router = express.Router();

const {
  getRestaurantProfile,
} = require("../controllers/restaurantController");


// GET RESTAURANT PROFILE BY USER ID

router.get(
  "/profile/:userId",
  getRestaurantProfile
);


module.exports = router;