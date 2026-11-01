
const Donation = require("../models/Donation");
const Ngo = require("../models/Ngo");
const mongoose = require("mongoose");

const {
  createNotification,
} = require("../utils/notificationUtils");

// ======================================================
// GET COMPLETED DONATIONS FOR NGO
// ======================================================

const getCompletedDonationsForNGO = async (req, res) => {
  try {
    const { ngoId } = req.params;

    const ngoDoc = await Ngo.findOne({
      $or: [
        { _id: ngoId },
        { user: ngoId },
      ],
    });

    const targetIds = [ngoId];

    if (ngoDoc) {
      targetIds.push(ngoDoc._id);
    }

    const donations = await Donation.find({
      "ngoRequest.requestedBy": {
        $in: targetIds,
      },
      $or: [
        {
          status: {
            $in: [
              "Completed",
              "completed",
              "COMPLETED",
            ],
          },
        },
        {
          pipelineStatus: {
            $in: [
              "Completed",
              "completed",
              "COMPLETED",
            ],
          },
        },
      ],
    }).populate(
      "donor",
      "name restaurantName email"
    );

    console.log(
      `NGO Donations Loaded | NGO: ${ngoId} | Total: ${donations.length}`
    );

    return res.status(200).json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error(
      "Fetch completed donations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load donations.",
    });
  }
};

// ======================================================
// SUBMIT RATING
// ======================================================

const submitRating = async (req, res) => {
  try {
    const {
      donationId,
      rating,
      comment,
    } = req.body;

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    const score = Number(rating);

    if (
      !donationId ||
      rating === undefined ||
      rating === null ||
      !Number.isFinite(score) ||
      score < 1 ||
      score > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid Donation ID and Rating (1-5) are required.",
      });
    }

    // ----------------------------------------------
    // FIND DONATION
    // ----------------------------------------------

    let query;

    if (
      mongoose.Types.ObjectId.isValid(donationId) &&
      donationId.length === 24
    ) {
      query = {
        $or: [
          { _id: donationId },
          { donationId: donationId },
        ],
      };
    } else {
      query = {
        donationId: donationId,
      };
    }

    const donation = await Donation.findOne(query);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    // ----------------------------------------------
    // SAVE RATING
    // ----------------------------------------------

    donation.rating = {
      score,
      comment: comment || "",
      ratedAt: new Date(),
    };

    await donation.save();

    // ----------------------------------------------
    // NOTIFY DONOR
    // ----------------------------------------------

    if (donation.donor) {
      await createNotification({
        recipient: donation.donor,

        type: "RATING_RECEIVED",

        title: "New Rating Received ⭐",

        message:
          `An NGO rated your donation with ${score} stars: "${comment || "No comment provided"}"`,

        donation: donation._id,

        data: {
          role: "donor",
          donationId:
            donation.donationId ||
            donation._id.toString(),
          rating: score,
        },
      });
    }

    // ----------------------------------------------
    // RESPONSE
    // ----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Rating saved successfully!",
      donation,
    });
  } catch (error) {
    console.error(
      "Submit rating error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process rating.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getCompletedDonationsForNGO,
  submitRating,
};
