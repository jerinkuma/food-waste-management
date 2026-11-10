
const Donation = require("../models/Donation");
const Feedback = require("../models/Feedback");
const Ngo = require("../models/Ngo");
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
// HELPER: CHECK WHETHER NGO REQUESTED THIS DONATION
// ======================================================
const hasNgoRequestedDonation = (donation, ngoId) => {
  const targetId = String(ngoId);

  const newRequestExists = (donation.ngoRequests || []).some(
    (request) =>
      String(
        request.requestedBy?._id ||
        request.requestedBy
      ) === targetId
  );

  const legacyRequestExists =
    String(
      donation.ngoRequest?.requestedBy?._id ||
      donation.ngoRequest?.requestedBy ||
      ""
    ) === targetId;

  return newRequestExists || legacyRequestExists;
};

// ======================================================
// 1. NGO -> DONOR: SUBMIT FEEDBACK
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
// ======================================================

const submitDonorFeedback = async (req, res) => {
  try {
    const { donationId, ngoId, message } = req.body;
    const donorId = req.user.id;

    if (!donationId || !ngoId || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Donation ID, NGO ID and feedback message are required.",
      });
    }

    const donation = await findDonation(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    if (String(donation.donor) !== String(donorId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot submit feedback for this donation.",
      });
    }

    if (!hasNgoRequestedDonation(donation, ngoId)) {
      return res.status(403).json({
        success: false,
        message: "This NGO did not request this donation.",
      });
    }

    const existingFeedback = await Feedback.findOne({
      donation: donation._id,
      ngo: ngoId,
      donor: donorId,
      submittedBy: "Donor",
      category: "NGO Feedback",
    });

    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted feedback for this NGO and donation.",
      });
    }

    const populatedDonation = await Donation.findById(
      donation._id
    ).populate("donor", "name");

    const finalDonorName =
      populatedDonation?.donor?.name || "Donor";

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
      submittedBy: "Donor",
      date: getFormattedDate(),
      status: "Pending",
      routedTo: {
        admin: true,
        restaurant: false,
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Feedback submitted successfully. Waiting for admin approval.",
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
// 3. DONOR -> NGO: SUBMIT STAR RATING
// ======================================================
const submitDonorNgoRating = async (req, res) => {
  try {
    const donorId = req.user.id;
    const { donationId, ngoId, rating, comment } = req.body;

    const score = Number(rating);

    if (!donationId || !ngoId || !Number.isInteger(score)) {
      return res.status(400).json({
        success: false,
        message: "Donation, NGO and rating are required.",
      });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(ngoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid NGO profile.",
      });
    }

    const donation = await findDonation(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    // Only the owner of this donation can rate an NGO.
    if (String(donation.donor) !== String(donorId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot rate an NGO for another donor's donation.",
      });
    }

    // The NGO must actually have requested this donation.
    if (!hasNgoRequestedDonation(donation, ngoId)) {
      return res.status(403).json({
        success: false,
        message: "This NGO did not request this donation.",
      });
    }

    const ngoExists = await Ngo.findById(ngoId).select("_id");

    if (!ngoExists) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    // One rating per donor + donation + NGO.
    const existingRating = await Feedback.findOne({
      donation: donation._id,
      donor: donorId,
      ngo: ngoId,
      submittedBy: "Donor",
      category: "NGO Rating",
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this NGO for this donation.",
      });
    }

    const donor = await mongoose.model("User")
      .findById(donorId)
      .select("name");

    const newRating = await Feedback.create({
      donation: donation._id,
      donationId: donation.donationId || donationId,
      ngo: ngoId,
      donor: donorId,
      restaurant: donorId,
      donorName: donor?.name || "Donor",
      category: "NGO Rating",
      priority: "Normal",
      rating: score,
      comment: typeof comment === "string" ? comment.trim() : "",
      message:
        typeof comment === "string" && comment.trim()
          ? comment.trim()
          : `Donor rated this NGO ${score} out of 5 stars.`,
      submittedBy: "Donor",
      date: getFormattedDate(),
      status: "Approved",
      routedTo: {
        admin: false,
        restaurant: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "NGO rating submitted successfully.",
      rating: newRating,
    });
  } catch (error) {
    console.error("Donor NGO rating error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit NGO rating.",
      error: error.message,
    });
  }
};

// ======================================================
// 4. ADMIN: GET ALL FEEDBACK
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
// 5. NGO: GET OWN FEEDBACK + APPROVED DONOR FEEDBACK
// ======================================================
const getNgoFeedbacks = async (req, res) => {
  try {
    const loggedInNgoId = req.user.id;
    const requestedNgoId = req.params.ngoId;

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
        { submittedBy: "NGO" },
        {
          submittedBy: "Donor",
          status: "Approved",
          category: { $ne: "NGO Rating" },
        },
        {
          submittedBy: "Donor",
          category: "NGO Rating",
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
// 6. DONOR: GET NGO REQUESTS + FEEDBACK + RATINGS
// ======================================================
const getDonorNgoReviews = async (req, res) => {
  try {
    const donorId = req.user.id;

    const donations = await Donation.find({
      donor: donorId,
      $or: [
        {
          "ngoRequest.requestedBy": {
            $exists: true,
            $ne: null,
          },
        },
        {
          "ngoRequests.0": { $exists: true },
        },
      ],
    })
      .populate({
        path: "ngoRequest.requestedBy",
        populate: {
          path: "user",
          select: "name fullName",
        },
      })
      .populate({
        path: "ngoRequests.requestedBy",
        populate: {
          path: "user",
          select: "name fullName",
        },
      })
      .sort({ createdAt: -1 });

    const feedbacks = await Feedback.find({
      donor: donorId,
      submittedBy: "Donor",
      category: { $ne: "NGO Rating" },
    })
      .populate({
        path: "ngo",
        populate: {
          path: "user",
          select: "name fullName",
        },
      })
      .sort({ createdAt: -1 });

    const ratings = await Feedback.find({
      donor: donorId,
      submittedBy: "Donor",
      category: "NGO Rating",
    })
      .populate({
        path: "ngo",
        populate: {
          path: "user",
          select: "name fullName",
        },
      })
      .sort({ createdAt: -1 });

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
      ratings,
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
// 7. ADMIN: UPDATE FEEDBACK STATUS
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

    // NGO ratings do not go through admin approval.
    if (feedback.category === "NGO Rating") {
      return res.status(400).json({
        success: false,
        message: "NGO ratings cannot be moderated through this endpoint.",
      });
    }

    const previousStatus = feedback.status;

    feedback.status = status;
    await feedback.save();

    if (
      ["Approved", "Declined"].includes(status) &&
      previousStatus !== status
    ) {
      let recipient = null;
      let recipientRole = null;

      if (feedback.submittedBy === "Donor") {
        recipient = feedback.donor;
        recipientRole = "donor";
      } else if (feedback.submittedBy === "NGO") {
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
  submitDonorNgoRating,
  getAdminFeedback,
  getNgoFeedbacks,
  getDonorNgoReviews,
  updateFeedbackStatus,
};
