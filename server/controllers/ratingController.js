
const Donation = require("../models/Donation");
const Ngo = require("../models/Ngo");
const Feedback = require("../models/Feedback");
const User = require("../models/User"); // User মডেল ইম্পোর্ট করা নিশ্চিত করো
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
      "name restaurantName email organizationName businessName fullName"
    );

    return res.status(200).json({
      success: true,
      donations,
    });
  } catch (error) {
    console.error("Fetch completed donations error:", error);
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
        message: "Valid Donation ID and Rating (1-5) are required.",
      });
    }

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
      query = { donationId: donationId };
    }

    const donation = await Donation.findOne(query);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    donation.rating = {
      score,
      comment: comment || "",
      ratedAt: new Date(),
    };

    await donation.save();

    if (donation.donor) {
      await createNotification({
        recipient: donation.donor,
        type: "RATING_RECEIVED",
        title: "New Rating Received ⭐",
        message: `An NGO rated your donation with ${score} stars: "${comment || "No comment provided"}"`,
        donation: donation._id,
        data: {
          role: "donor",
          donationId: donation.donationId || donation._id.toString(),
          rating: score,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rating saved successfully!",
      donation,
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process rating.",
    });
  }
};

// ======================================================
// GET NGO RECEIVED RATINGS (From Restaurants) - ROBUST FIX
// ======================================================

const getNgoReceivedRatings = async (req, res) => {
  try {
    const { ngoId } = req.params;

    const ngoDoc = await Ngo.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(ngoId) ? ngoId : null },
        { user: ngoId },
      ],
    });

    const targetIds = [ngoId];
    if (ngoDoc) {
      targetIds.push(ngoDoc._id.toString());
      targetIds.push(ngoDoc._id);
    }

    // ১. Feedback কালেকশন থেকে চেক করা
    let donorRatings = [];
    if (ngoDoc) {
      donorRatings = await Feedback.find({
        ngo: ngoDoc._id,
        submittedBy: "Donor",
        category: "NGO Rating",
      })
        .populate("donor", "name restaurantName email organizationName businessName fullName")
        .sort({ createdAt: -1 })
        .lean();
    }

    let ratings = await Promise.all(donorRatings.map(async (item) => {
      let donorObj = item.donor;
      if (donorObj && !donorObj.name && !donorObj.restaurantName && mongoose.Types.ObjectId.isValid(donorObj)) {
        donorObj = await User.findById(donorObj).lean();
      }

      const restaurantName = 
        donorObj?.restaurantName || 
        donorObj?.organizationName || 
        donorObj?.businessName || 
        donorObj?.name || 
        donorObj?.fullName || 
        "Restaurant Partner";

      return {
        _id: item._id,
        restaurantId: donorObj?._id || item.donor,
        restaurantName,
        restaurantEmail: donorObj?.email || "",
        rating: Number(item.rating) || 0,
        review: item.comment || item.review || "No written review provided.",
        createdAt: item.createdAt,
        foodName: item.foodName || "Surplus Food",
      };
    }));

    // ২. যদি Feedback এ না পাওয়া যায়, তবে Donation মডেল চেক করা
    if (ratings.length === 0) {
      const ratedDonations = await Donation.find({
        $or: [
          { "ngoRequest.requestedBy": { $in: targetIds } },
          { ngoId: { $in: targetIds } },
          { selectedNgo: { $in: targetIds } }
        ],
        "rating.score": { $exists: true, $ne: null }
      })
        .populate("donor", "name restaurantName email organizationName businessName fullName")
        .sort({ updatedAt: -1 })
        .lean();

      ratings = await Promise.all(ratedDonations.map(async (item) => {
        let donorObj = item.donor;
        // যদি donor শুধু একটি আইডি হয়ে থাকে, তবে আলাদাভাবে ইউজার ডাটা ফেচ করা
        if (donorObj && !donorObj.name && !donorObj.restaurantName && mongoose.Types.ObjectId.isValid(donorObj)) {
          donorObj = await User.findById(donorObj).lean();
        }

        const restaurantName = 
          donorObj?.restaurantName || 
          donorObj?.organizationName || 
          donorObj?.businessName || 
          donorObj?.name || 
          donorObj?.fullName || 
          "Restaurant Partner";

        return {
          _id: item._id,
          donationId: item.donationId || item._id,
          restaurantId: donorObj?._id || item.donor,
          restaurantName,
          restaurantEmail: donorObj?.email || "",
          rating: Number(item.rating?.score) || 0,
          review: item.rating?.comment || "No written review provided.",
          createdAt: item.rating?.ratedAt || item.updatedAt,
          foodName: item.foodName || item.foodCategory || "Surplus Food",
        };
      }));

      ratings = ratings.filter(r => r.rating > 0);
    }

    // গড় রেটিং হিসাব করা
    let totalScore = 0;
    ratings.forEach((r) => {
      totalScore += r.rating;
    });
    const averageRating = ratings.length > 0 ? (totalScore / ratings.length).toFixed(1) : "0.0";

    return res.status(200).json({
      success: true,
      count: ratings.length,
      averageRating,
      ratings,
    });
  } catch (error) {
    console.error("Get NGO received ratings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load ratings.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getCompletedDonationsForNGO,
  submitRating,
  getNgoReceivedRatings,
};