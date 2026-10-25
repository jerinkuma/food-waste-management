const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const http = require("http");
require("dotenv").config();

const { initSocket } = require("./utils/socket");

const app = express();
const httpServer = http.createServer(app);

// =====================================
// MIDDLEWARE SETUP
// =====================================
app.use(cors());
app.use(express.json());
app.use(fileUpload());

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
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/ngo", ngoSettingsRoutes); // NGO Profile & Settings Management
app.use("/api/requests", requestRoutes);
app.use("/api/donation-logs", donationLogRoutes);
app.use("/api/trust-score", trustScoreRoutes); // NGO Trust Score Route
app.use("/api/feedback", feedbackRoutes);
app.use("/api/follow", followRoutes); // Instagram-style NGO <-> Restaurant partner system
app.use("/api/admin", adminRoutes); // Admin routes

// =====================================
// REAL-TIME LAYER (Socket.IO)
// Powers live donation sync, follow notifications, and dual
// feedback delivery across Restaurant / NGO / Admin panels.
// =====================================
initSocket(httpServer, process.env.CLIENT_URL || "*");

// =====================================
// MONGODB CONNECTION & SERVER START
// =====================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Central Database Connected Successfully!");
    httpServer.listen(PORT, () => {
      console.log(`FeedLink Server (HTTP + Socket.IO) is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });