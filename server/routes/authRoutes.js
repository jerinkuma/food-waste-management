const express = require("express");

const {
  signup,
  login,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();


// Signup
router.post(
  "/signup",
  signup
);


// Login
router.post(
  "/login",
  login
);


// Change Password
router.put(
  "/change-password/:userId",
  changePassword
);


module.exports = router;