const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const PendingFeedback = require('../models/PendingFeedback');
const trustScoreController = require('../controllers/trustScoreController');

// -------------------------------------------------------------
// 1. NGO Trust Score Route
// -------------------------------------------------------------
router.get('/trust-score', trustScoreController.getNgoTrustScore);

// -------------------------------------------------------------
// 2. Donor Routes (Search, Filter, Follow)
// -------------------------------------------------------------

// Get All Donors with optional Search & Trust Filter
router.get('/donors', async (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (filter === 'positive') {
      query.trustScore = { $gte: 4.0 };
    } else if (filter === 'negative') {
      query.trustScore = { $lt: 4.0 };
    }

    const donors = await Donor.find(query).sort({ trustScore: -1 });
    res.status(200).json(donors);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching donors', error: err.message });
  }
});

// Toggle Follow Status
router.patch('/donors/:id/follow', async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    donor.isFollowed = !donor.isFollowed;
    await donor.save();

    res.status(200).json({ id: donor._id, isFollowed: donor.isFollowed });
  } catch (err) {
    res.status(500).json({ message: 'Error updating follow status', error: err.message });
  }
});

// -------------------------------------------------------------
// 3. Feedback Management Routes
// -------------------------------------------------------------

// Get Pending Feedback List
router.get('/pending-feedback', async (req, res) => {
  try {
    const pending = await PendingFeedback.find({ status: 'Delivered' }).sort({ createdAt: -1 });
    res.status(200).json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending feedback', error: err.message });
  }
});

// Submit Rating & Update Donor Score + Tags Dynamically
router.post('/rate-donor', async (req, res) => {
  const { pendingId, donorName, userStars, selectedTag, reviewComment } = req.body;

  try {
    const donor = await Donor.findOne({ name: donorName });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    // Trust Score Calculation
    const newTotalDonations = donor.totalDonations + 1;
    const updatedScore = parseFloat(
      (((donor.trustScore * donor.totalDonations) + userStars) / newTotalDonations).toFixed(1)
    );

    // Tags Update
    const updatedTags = donor.tags.includes(selectedTag)
      ? donor.tags
      : [...donor.tags, selectedTag];

    // New Review Object
    const newReview = {
      user: 'Verified NGO Recipient',
      rating: userStars,
      comment: reviewComment || 'No written review provided.',
      type: userStars >= 3 ? 'positive' : 'negative'
    };

    // Update Donor
    donor.trustScore = updatedScore;
    donor.totalDonations = newTotalDonations;
    donor.tags = updatedTags;
    donor.reviews.unshift(newReview);
    await donor.save();

    // Remove Pending Feedback Item
    await PendingFeedback.findByIdAndDelete(pendingId);

    res.status(200).json({ message: 'Feedback submitted successfully', donor });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting rating', error: err.message });
  }
});

module.exports = router;