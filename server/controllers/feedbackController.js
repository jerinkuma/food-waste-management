const Donation = require("../models/Donation");
const Feedback = require("../models/Feedback");
const mongoose = require("mongoose");
const { createNotification } = require("../utils/notificationUtils");


// ======================================================
// HELPER: FORMAT DATE
// ======================================================
const getFormattedDate = () => {
  const today = new Date();

  return `${today.getDate()} ${today.toLocaleString("default", {
    month: "short",
  })} ${today.getFullYear()}`;
};

// ======================================================
// HELPER: FIND DONATION BY ID
// ======================================================
const findDonation = async (donationId) => {
  let query = { donationId };

  if (
    mongoose.Types.ObjectId.isValid(donationId) &&
    donationId.length === 24
  ) {
    query = {
      $or: [{ _id: donationId }, { donationId }],
    };
  }

  return Donation.findOne(query);
};

// ======================================================
// 1. NGO -> DONOR: SUBMIT FEEDBACK
// Existing NGO feedback functionality
// ======================================================
const submitFeedback = async (req, res) => {
  try {
    const {
      donationId,
      category,
      priority,
      message,
      donorName,
    } = req.body;

    const ngoId = req.user.id;

    if (!donationId || !category || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing.",
      });
    }

    const donation = await findDonation(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    const donorId = donation.donor || null;

    const newFeedback = await Feedback.create({
      donation: donation._id,
      donationId: donation.donationId || donationId,

      ngo: ngoId,

      restaurant: donorId,
      donor: donorId,

      donorName: donorName || "Donor",

      category,
      priority: priority || "Normal",
      message: message.trim(),

      submittedBy: "NGO",
      date: getFormattedDate(),

      status: "Awaiting Response",

      routedTo: {
        admin: true,
        restaurant: !!donorId,
      },
    });

    // Notify Donor
    if (donorId) {
      await createNotification({
        recipient: donorId,
        type: "FEEDBACK_RECEIVED",
        title: "New Feedback Received",
        message: `An NGO submitted feedback for your donation: "${message}"`,
        donation: donation._id,
        feedback: newFeedback._id,
        data: {
          role: "donor",
          donationId:
            donation.donationId || donation._id.toString(),
          feedbackId: newFeedback._id.toString(),
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("NGO submit feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback.",
      error: error.message,
    });
  }
};

// ======================================================
// 2. DONOR -> NGO: SUBMIT TEXT FEEDBACK
// No rating is accepted from Donor
// ======================================================
const submitDonorFeedback = async (req, res) => {
  try {
    const { donationId, message } = req.body;
    const donorId = req.user.id;

    if (!donationId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Donation ID and feedback message are required.",
      });
    }

    // Find donation
    const donation = await findDonation(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    // Ensure this donation belongs to the logged-in Donor
    if (String(donation.donor) !== String(donorId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot submit feedback for this donation.",
      });
    }

    // Get NGO from the donation request
    const ngoId = donation.ngoRequest?.requestedBy;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        message: "No NGO is associated with this donation.",
      });
    }

    // Get Donor name from database
    const populatedDonation = await Donation.findById(donation._id)
      .populate("donor", "name");

    const finalDonorName =
      populatedDonation?.donor?.name || "Donor";

    // Create Donor -> NGO feedback
    const newFeedback = await Feedback.create({
      donation: donation._id,
      donationId: donation.donationId || donationId,

      ngo: ngoId,

      donor: donorId,
      restaurant: donorId,

      donorName: finalDonorName,

      category: "NGO Feedback",
      priority: "Normal",

      message: message.trim(),

      // Important: identifies feedback direction
      submittedBy: "Donor",

      date: getFormattedDate(),

      // Admin must approve before NGO can see it
      status: "Pending",

      routedTo: {
        admin: true,
        restaurant: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully. Waiting for admin approval.",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Donor submit feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit feedback.",
      error: error.message,
    });
  }
};

// ======================================================
// 3. ADMIN: GET ALL FEEDBACK
// ======================================================
const getAdminFeedback = async (req, res) => {
  try {
    const list = await Feedback.find({
      "routedTo.admin": true,
    })
      .populate("ngo", "name email")
      .populate("restaurant", "name email")
      .populate("donor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: list.length,
      feedback: list,
    });
  } catch (error) {
    console.error("Get admin feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load feedback.",
      error: error.message,
    });
  }
};

// ======================================================
// 4. NGO: GET OWN FEEDBACK + APPROVED DONOR FEEDBACK
// NGO must never receive Pending or Declined Donor feedback
// ======================================================
const getNgoFeedbacks = async (req, res) => {
  try {
    const loggedInNgoId = req.user.id;
    const requestedNgoId = req.params.ngoId;

    // Prevent one NGO from accessing another NGO's feedback
    if (
      requestedNgoId &&
      String(requestedNgoId) !== String(loggedInNgoId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this feedback.",
      });
    }

    const list = await Feedback.find({
      ngo: loggedInNgoId,

      $or: [
        // NGO's own submitted feedback about Donors
        { submittedBy: "NGO" },

        // Donor's feedback only after Admin approval
        {
          submittedBy: "Donor",
          status: "Approved",
        },
      ],
    })
      .populate("donor", "name email")
      .populate("restaurant", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: list.length,
      feedback: list,
    });
  } catch (error) {
    console.error("Get NGO feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load NGO feedback.",
      error: error.message,
    });
  }
};

// ======================================================
// 5. DONOR: GET NGO REVIEWS + OWN FEEDBACK STATUS
// ======================================================
// =====================================
// GET DONOR NGO REVIEWS
// =====================================
// =====================================
// GET DONOR NGO REVIEWS
// =====================================
const getDonorNgoReviews = async (req, res) => {
  try {
    const donorId = req.user.id;

    // Donor's donations with NGO profile and associated User
    const donations = await Donation.find({
      donor: donorId,
      "ngoRequest.requestedBy": { $exists: true, $ne: null },
    })
      .populate({
        path: "ngoRequest.requestedBy",
        populate: {
          path: "user",
          select: "name fullName",
        },
      })
      .sort({ createdAt: -1 });

    // Donor -> NGO feedback
    const feedbacks = await Feedback.find({
      donor: donorId,
      submittedBy: "Donor",
    })
      .populate({
        path: "ngo",
        populate: {
          path: "user",
          select: "name fullName",
        },
      })
      .sort({ createdAt: -1 });

    // NGO -> Donor feedback (only Admin-approved)
    const ngoFeedbacks = await Feedback.find({
      donor: donorId,
      submittedBy: "NGO",
      status: "Approved",
    })
      .populate({
        path: "ngo",
        populate: {
          path: "user",
          select: "name fullName",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      donations,
      feedbacks,
      ngoFeedbacks,
    });
  } catch (error) {
    console.error("Get Donor NGO Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch NGO reviews",
      error: error.message,
    });
  }
};

// ======================================================
// 6. ADMIN: UPDATE FEEDBACK STATUS
// ======================================================
const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Awaiting Response",
      "Approved",
      "Declined",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback status.",
      });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    const previousStatus = feedback.status;

    feedback.status = status;
    await feedback.save();

    // =====================================
    // SEND NOTIFICATION ON APPROVE / DECLINE
    // =====================================

    if (
      ["Approved", "Declined"].includes(status) &&
      previousStatus !== status
    ) {
      let recipient = null;
      let recipientRole = null;

      // Donor submitted feedback
      if (feedback.submittedBy === "Donor") {
        recipient = feedback.donor;
        recipientRole = "donor";
      }

      // NGO submitted feedback
      else if (feedback.submittedBy === "NGO") {
        const ngo = await Ngo.findById(feedback.ngo)
          .select("user");

        recipient = ngo?.user || null;
        recipientRole = "ngo";
      }

      if (recipient && recipientRole) {
        const isApproved = status === "Approved";

        await createNotification({
          recipient,
          type: "FEEDBACK_RESPONSE",

          title: isApproved
            ? "Feedback Approved"
            : "Feedback Declined",

          message: isApproved
            ? "Your submitted feedback has been approved by Admin."
            : "Your submitted feedback has been declined by Admin.",

          donation: feedback.donation || null,
          feedback: feedback._id,

          data: {
            role: recipientRole,
            feedbackId: feedback._id.toString(),
            donationId: feedback.donationId,
            status,
            submittedBy: feedback.submittedBy,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Feedback status updated successfully.",
      feedback,
    });

  } catch (error) {
    console.error("Update feedback status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update feedback status.",
      error: error.message,
    });
  }
};

module.exports = {
  submitFeedback,
  submitDonorFeedback,
  getAdminFeedback,
  getNgoFeedbacks,
  getDonorNgoReviews,
  updateFeedbackStatus,
};
