const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getRestaurantProfile,
  updateRestaurantProfile,
} = require("../controllers/restaurantController");

const router = express.Router();


// =====================================
// PROFILE IMAGE UPLOAD CONFIGURATION
// =====================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/profiles"
);

// Create folder automatically if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}


// =====================================
// MULTER STORAGE
// =====================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const fileName = `profile-${Date.now()}${extension}`;

    cb(null, fileName);
  },
});


// =====================================
// IMAGE TYPE VALIDATION
// =====================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};


// =====================================
// MULTER CONFIG
// =====================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// =====================================
// GET RESTAURANT PROFILE
// =====================================

router.get(
  "/profile/:userId",
  getRestaurantProfile
);


// =====================================
// UPDATE RESTAURANT PROFILE
// =====================================

router.put(
  "/profile/:userId",
  upload.single("profileImage"),
  updateRestaurantProfile
);


module.exports = router;