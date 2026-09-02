const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const donationRoutes = require("./routes/donationRoutes");

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


// =====================================
// SERVE UPLOADED FILES
// =====================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// =====================================
// API ROUTES
// =====================================

app.use(
  "/api/restaurants",
  restaurantRoutes
);

app.use(
  "/api/donations",
  donationRoutes
);

app.use(
  "/api/auth",
  authRoutes
);


// =====================================
// MONGODB CONNECTION
// =====================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "Central Database Connected Successfully!"
    );

    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "Database connection failed:",
      err
    );
  });