const Feedback = require("../models/Feedback");
const Ngo = require("../models/Ngo");
const { getIO, rooms } = require("../utils/socket");

// ১. নতুন ফিডব্যাক সাবমিট করা
const submitFeedback = async (req, res) => {
  try {
    const {
      donationId,
      ngo,
      restaurant,
      donorName,
      category,
      priority,
      message,
      submittedBy,
    } = req.body;

    if (!donationId || !category || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const today = new Date();
    const formattedDate = `${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()}`;

    // donorName নিশ্চিত করা
    const finalDonorName = donorName || "cafe24";

    const newFeedback = await Feedback.create({
      donationId,
      ngo: ngo || null,
      restaurant: restaurant || null,
      donorName: finalDonorName,
      category,
      priority: priority || "Normal",
      message,
      submittedBy: submittedBy || "NGO",
      date: formattedDate,
      status: "Awaiting Response",
      routedTo: {
        admin: true,
        restaurant: !!restaurant,
      },
    });

    return res.status(201).json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error("Submit feedback error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit feedback.", error: error.message });
  }
};

// ২. অ্যাডমিন ফিডব্যাক ফেচ করা
const getAdminFeedback = async (req, res) => {
  try {
    const list = await Feedback.find({ "routedTo.admin": true })
      .populate("ngo", "name email")
      .populate("restaurant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: list.length, feedback: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load feedback.", error: error.message });
  }
};

// ৩. এনজিও ফিডব্যাক ফেচ করা (এটি তোমার ফাইলে মিসিং ছিল!)
const getNgoFeedbacks = async (req, res) => {
  try {
    const { ngoId } = req.params;

    // যদি ngoId থাকে তাহলে নির্দিষ্ট এনজিওর ফিডব্যাক খুঁজবে, না হলে সব পাঠাবে
    const query = ngoId ? { ngo: ngoId } : {};
    const list = await Feedback.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: list.length, feedback: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load NGO feedback.", error: error.message });
  }
};

// ৪. স্ট্যাটাস আপডেট
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found." });
    }

    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update status.", error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAdminFeedback,
  getNgoFeedbacks, // এটি এখানে এড করা হয়েছে
  updateFeedbackStatus,
};