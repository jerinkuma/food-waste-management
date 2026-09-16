const Feedback = require("../models/Feedback");
const Ngo = require("../models/Ngo");
const { getIO, rooms } = require("../utils/socket");

// =====================================
// SUBMIT FEEDBACK
// A single feedback document is created and routed to BOTH the
// Admin panel and (when a restaurant is linked) that restaurant's
// own dashboard, in real time.
// =====================================
const submitFeedback = async (req, res) => {
  try {
    const {
      donationId,
      donation,
      ngo,
      donor,
      restaurant,
      donorName,
      category,
      tags,
      priority,
      rating,
      message,
      comment,
      submittedBy,
    } = req.body;

    if (!donationId || !donorName || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "donationId, donorName, category and message are required.",
      });
    }

    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}`;

    const newFeedback = await Feedback.create({
      donationId,
      donation,
      ngo,
      donor,
      restaurant: restaurant || null,
      donorName,
      category,
      tags,
      priority,
      rating,
      message,
      comment,
      submittedBy: submittedBy || "NGO",
      date: formattedDate,
      routedTo: {
        admin: true,
        restaurant: !!restaurant,
      },
    });

    // ============ DUAL-DESTINATION REAL-TIME DELIVERY ============
    getIO().to(rooms.admins()).emit("feedback:new", newFeedback);

    if (restaurant) {
      getIO().to(rooms.restaurant(restaurant.toString())).emit("feedback:new", newFeedback);
    }

    return res.status(201).json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error("Submit feedback error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit feedback.", error: error.message });
  }
};

// =====================================
// GET ALL FEEDBACK (ADMIN VIEW)
// =====================================
const getAdminFeedback = async (req, res) => {
  try {
    const list = await Feedback.find({ "routedTo.admin": true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: list.length, feedback: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load feedback.", error: error.message });
  }
};

// =====================================
// GET FEEDBACK FOR A SPECIFIC RESTAURANT
// =====================================
const getRestaurantFeedback = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const list = await Feedback.find({ restaurant: restaurantId, "routedTo.restaurant": true }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, count: list.length, feedback: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load feedback.", error: error.message });
  }
};

// =====================================
// GET FEEDBACK AN NGO HAS SUBMITTED
// =====================================
const getNgoFeedbacks = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const feedbacks = await Feedback.find({ ngo: ngoId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: feedbacks.length, feedback: feedbacks });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching feedback", error: error.message });
  }
};

// =====================================
// RESTAURANT RESPONDS TO FEEDBACK
// (the response also becomes visible to the admin + the NGO who sent it)
// =====================================
const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found." });
    }

    feedback.restaurantResponse = { message, respondedAt: new Date() };
    await feedback.save();

    getIO().to(rooms.admins()).emit("feedback:updated", feedback);
    if (feedback.ngo) {
      getIO().to(rooms.ngo(feedback.ngo.toString())).emit("feedback:updated", feedback);
    }

    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to respond.", error: error.message });
  }
};

// =====================================
// MARK AS READ (per-viewer)
// =====================================
const markFeedbackRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { viewer } = req.query; // "admin" | "restaurant"

    const field = viewer === "restaurant" ? { restaurantRead: true } : { adminRead: true };
    const feedback = await Feedback.findByIdAndUpdate(id, field, { new: true });

    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update read state.", error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAdminFeedback,
  getRestaurantFeedback,
  getNgoFeedbacks,
  respondToFeedback,
  markFeedbackRead,
};
