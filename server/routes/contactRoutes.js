
const express = require("express");
const router = express.Router();

const {
  submitContactMessage,
} = require("../controllers/contactController");

// Simple in-memory rate limiter.
// Limit: 5 submissions per IP within 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const requestsByIp = new Map();

const contactRateLimiter = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip;

  let record = requestsByIp.get(ip);

  if (!record || now - record.startTime >= WINDOW_MS) {
    record = {
      count: 0,
      startTime: now,
    };
  }

  record.count += 1;
  requestsByIp.set(ip, record);

  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many messages. Please try again after 15 minutes.",
    });
  }

  next();
};

router.post("/", contactRateLimiter, (req, res, next) => {
  console.log("CONTACT API HIT:", req.body);
  next();
}, submitContactMessage);

module.exports = router;
