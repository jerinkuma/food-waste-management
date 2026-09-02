
const express = require("express");

const {
  createDonation,
  getDonationById,
  getDonationByDonationId,
  verifyDonation,
  rejectDonation,
} = require("../controllers/donationController");

const router = express.Router();


// Create / Publish Donation
router.post("/", createDonation);


// Get donation by MongoDB _id
router.get("/:id", getDonationById);


// Get donation by Donation ID
router.get(
  "/donation-id/:donationId",
  getDonationByDonationId
);


// Safety verification
router.post(
  "/:id/verify",
  verifyDonation
);

// reject
router.post(
  "/:id/reject",
  rejectDonation
);
```



module.exports = router;

