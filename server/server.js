const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
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
const ratingRoutes = require("./routes/Rating"); 
const feedbackRoutes = require("./routes/feedbackRoutes");
const ngoSettingsRoutes = require("./routes/ngoSettingsRoutes");
const followRoutes = require("./routes/followRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchRoutes = require("./routes/searchRoutes");

// =====================================
// API ROUTES INTEGRATION
// =====================================

// Authentication
app.use("/api/auth", authRoutes);

// Restaurant / Donor
app.use("/api/restaurants", restaurantRoutes);

// Donations
app.use("/api/donations", donationRoutes);

// Notifications & Global Search
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);

// =====================================
// NGO FILE UPLOAD MIDDLEWARE
// =====================================
app.use(fileUpload());

// NGO
app.use("/api/ngo", ngoRoutes);

// NGO Profile & Settings Management
app.use("/api/ngo", ngoSettingsRoutes);

// Other APIs
app.use("/api/requests", requestRoutes);
app.use("/api/donation-logs", donationLogRoutes);
app.use("/api/ratings", ratingRoutes); 
app.use("/api/feedback", feedbackRoutes);

// /api/follow এর পরিবর্তে /api/partners করা হলো যাতে ফ্রন্টএন্ডের সাথে ম্যাচ করে
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