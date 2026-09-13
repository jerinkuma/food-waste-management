const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  changePassword,
  logoutUser,
} = require("../controllers/authController");

// Signup Route
router.post("/signup", signup);

// Login Route
router.post("/login", login);

// Change Password Route
router.put("/change-password/:userId", changePassword);

// Logout Route
router.post("/logout", logoutUser);

module.exports = router;