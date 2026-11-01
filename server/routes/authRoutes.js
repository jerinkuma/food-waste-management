const express = require("express");

const {
  signup,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Change Password
router.put("/change-password/:userId", changePassword);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password/:token", resetPassword);

module.exports = router;