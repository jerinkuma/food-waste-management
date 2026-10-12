const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const http = require("http");
require("dotenv").config();

const { initSocket } = require("./utils/socket");

const {
  startFreshnessMonitor,
} = require("./utils/freshnessNotifier");

const app = express();
const httpServer = http.createServer(app);


const notificationRoutes = require("./routes/notificationRoutes");

// =====================================
// MIDDLEWARE SETUP
// =====================================
app.use(cors());
app.use(express.json());

// Serve Uploaded Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/notifications", notificationRoutes);
// =====================================
// IMPORT ALL ROUTES
// =====================================
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const donationRoutes = require("./routes/donationRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const requestRoutes = require("./routes/requestRoutes");
const donationLogRoutes = require("./routes/donationLogRoutes");
const trustScoreRoutes = require("./routes/trustScoreRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const ngoSettingsRoutes = require("./routes/ngoSettingsRoutes");
const followRoutes = require("./routes/followRoutes");
const adminRoutes = require("./routes/adminRoutes");

// =====================================
// API ROUTES INTEGRATION
// =====================================

// Authentication
app.use("/api/auth", authRoutes);

// Restaurant / Donor
// Multer handles restaurant profile image upload here
app.use("/api/restaurants", restaurantRoutes);

// Donations
app.use("/api/donations", donationRoutes);

// =====================================
// NGO FILE UPLOAD MIDDLEWARE
// =====================================

// express-fileupload is used by NGO Settings
// (req.files.avatar)
//
// IMPORTANT:
// It is placed AFTER restaurant routes so it does
// not interfere with Multer in restaurantRoutes.js.
app.use(fileUpload());

// NGO
app.use("/api/ngo", ngoRoutes);

// NGO Profile & Settings Management
app.use("/api/ngo", ngoSettingsRoutes);

// Other APIs
app.use("/api/requests", requestRoutes);
app.use("/api/donation-logs", donationLogRoutes);
app.use("/api/trust-score", trustScoreRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/follow", followRoutes);
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

    // =====================================
    // FRESHNESS NOTIFICATION MONITOR
    // =====================================
    // Checks active donations periodically
    // and sends real-time expiry alerts
    // to the respective donor through Socket.IO.
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