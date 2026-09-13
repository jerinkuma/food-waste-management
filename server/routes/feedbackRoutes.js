const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// GET all feedback logs
router.get("/", async (req, res) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit feedback
router.post("/", async (req, res) => {
  try {
    const { donationId, donorName, category, tags, priority, message } = req.body;
    
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}`;

    const newFeedback = new Feedback({
      donationId,
      donorName,
      category,
      tags,
      priority,
      message,
      date: formattedDate
    });

    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;