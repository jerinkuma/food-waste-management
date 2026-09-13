<<<<<<< Updated upstream
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// সেন্ট্রাল ডাটাবেস কানেকশন
mongoose.connect(MONGO_URI)
.then(() => {
    console.log("Central Database Connected Successfully!");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err) => {
    console.error("Database connection failed:", err);
});
=======
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
require("dotenv").config();

const app = express();

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
const trustScoreRoutes = require("./routes/trustScoreRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const ngoSettingsRoutes = require("./routes/ngoSettingsRoutes");

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

// =====================================
// MONGODB CONNECTION & SERVER START
// =====================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/feedlink";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Central Database Connected Successfully!");
    app.listen(PORT, () => {
      console.log(`FeedLink Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
>>>>>>> Stashed changes
