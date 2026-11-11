const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
require("dotenv").config();

const { initSocket } = require("./utils/socket");
const { startFreshnessMonitor } = require("./utils/freshnessNotifier");

const app = express();
const httpServer = http.createServer(app);

// =====================================
// MIDDLEWARE SETUP
// =====================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================================
// IMPORT ALL ROUTES
// =====================================
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const donationRoutes = require("./routes/donationRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const requestRoutes = require("./routes/requestRoutes");
const donationLogRoutes = require("./routes/donationLogRoutes");
const ratingRoutes = require("./routes/rating");
const feedbackRoutes = require("./routes/feedbackRoutes");
const ngoSettingsRoutes = require("./routes/ngoSettingsRoutes");
const followRoutes = require("./routes/followRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchRoutes = require("./routes/searchRoutes");
const contactRoutes = require("./routes/contactRoutes");
const contactAdminRoutes = require("./routes/contactAdminRoutes");
const reportsRoutes = require("./routes/analyticsRoutes");

// =====================================
// API ROUTES INTEGRATION
// =====================================

// Authentication
app.use("/api/auth", authRoutes);

// Contact & Admin Messages
app.use("/api/contact", contactRoutes);
app.use("/api/admin/contact-messages", contactAdminRoutes);

// Restaurant / Donor
app.use("/api/restaurants", restaurantRoutes);

// Donations
app.use("/api/donations", donationRoutes);

// Reports & Analytics API
app.use("/api/reports", reportsRoutes);

// Notifications & Global Search
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);

// =====================================
// NGO & SETTINGS ROUTES (Unified & Clean)
// =====================================
// মূল এনজিও রাউট এবং সেটিংস রাউট উভয়কেই /api/ngo এর অধীনে সঠিকভাবে সাজানো হলো
app.use("/api/ngo", ngoRoutes);
app.use("/api/ngo", ngoSettingsRoutes); // এটি এখন সরাসরি /api/ngo/settings এ কাজ করবে

// Other APIs
app.use("/api/requests", requestRoutes);
app.use("/api/donation-logs", donationLogRoutes);
app.use("/api/ratings", ratingRoutes); 
app.use("/api/feedback", feedbackRoutes);
app.use("/api/partners", followRoutes);
app.use("/api/admin", adminRoutes);

// =====================================
// REAL-TIME LAYER (Socket.IO)
// =====================================
initSocket(
  httpServer,
  process.env.CLIENT_URL || "*"
);

// =====================================
// MONGODB CONNECTION & SERVER START
// =====================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Central Database Connected Successfully!");

    startFreshnessMonitor();

    httpServer.listen(PORT, () => {
      console.log(
        `FeedLink Server (HTTP + Socket.IO) is running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });