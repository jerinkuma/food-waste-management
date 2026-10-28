const Donation = require("../models/Donation");
const Notification = require("../models/Notification");
const Ngo = require("../models/Ngo");
const mongoose = require("mongoose");

// নির্দিষ্ট এই এনজিওর কমপ্লিট হওয়া ডোনেশনগুলো বের করা
const getCompletedDonationsForNGO = async (req, res) => {
  try {
    const { ngoId } = req.params;

    const ngoDoc = await Ngo.findOne({ 
      $or: [{ _id: ngoId }, { user: ngoId }] 
    });

    const targetIds = [ngoId];
    if (ngoDoc) {
      targetIds.push(ngoDoc._id);
    }

    const donations = await Donation.find({
      "ngoRequest.requestedBy": { $in: targetIds },
      $or: [
        { status: { $in: ["Completed", "completed", "COMPLETED"] } },
        { pipelineStatus: { $in: ["Completed", "completed", "COMPLETED"] } }
      ]
    }).populate("donor", "name restaurantName email");

    console.log(`NGO Donations Loaded | NGO: ${ngoId} | Total: ${donations.length}`);

    return res.status(200).json({ success: true, donations });
  } catch (error) {
    console.error("Fetch completed donations error:", error);
    return res.status(500).json({ success: false, message: "Failed to load donations." });
  }
};

// রেটিং সাবমিট করার কন্ট্রোলার (আইডি কাস্টিং এরর ফিক্সড)
const submitRating = async (req, res) => {
  try {
    const { donationId, rating, comment } = req.body;

    if (!donationId || !rating) {
      return res.status(400).json({ success: false, message: "Donation ID and Rating are required." });
    }

    // সেফ কুয়েরি: আইডিটি ObjectId নাকি কাস্টম string (donationId) তা যাচাই করা হচ্ছে
    let query;
    if (mongoose.Types.ObjectId.isValid(donationId) && donationId.length === 24) {
      query = { $or: [{ _id: donationId }, { donationId: donationId }] };
    } else {
      query = { donationId: donationId };
    }

    const donation = await Donation.findOne(query);

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found." });
    }

    donation.rating = {
      score: Number(rating),
      comment: comment || "",
      ratedAt: new Date(),
    };
    await donation.save();

    if (Notification && donation.donor) {
      await Notification.create({
        recipient: donation.donor,
        type: "RATING_RECEIVED",
        title: "New Rating Received ⭐",
        message: `An NGO rated your donation with ${rating} stars: "${comment || 'No comment provided'}"`,
        donation: donation._id,
        read: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rating saved successfully!",
      donation,
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    return res.status(500).json({ success: false, message: "Failed to process rating." });
  }
};

module.exports = {
  getCompletedDonationsForNGO,
  submitRating,
};