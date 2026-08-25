const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const crypto = require("crypto");

const secureOptions =
  crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT;
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
    
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
  console.error("MongoDB connection failed!");
  console.error("NAME:", error.name);
  console.error("MESSAGE:", error.message);
  console.error("CODE:", error.code);
  console.error("REASON:", error.reason);
  console.error("FULL ERROR:", error);
});

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "FeedLink Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});