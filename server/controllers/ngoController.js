const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation"); 
const Distribution = require("../models/Distribution"); 
const Notification = require("../models/Notification"); 
const User = require("../models/User"); 
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const getNgoProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const userId = decoded.id || decoded.userId || decoded._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User ID not found in token" });
    }

    const ngo = await Ngo.findOne({ user: userId }).populate("user", "name fullName email role");
    if (!ngo) {
      return res.status(404).json({ success: false, message: "NGO profile not found for this account" });
    }

    return res.status(200).json({ success: true, ngo });
  } catch (error) {
    console.error("Get NGO Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getNgoStats = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const userIdStr = String(decoded.id || decoded.userId || decoded._id || "");
    const ngoDoc = await Ngo.findOne({ user: userIdStr }).lean();
    const ngoIdStr = ngoDoc ? String(ngoDoc._id) : "";

    const allLogs = await Donation.find({}).lean();

    // শুধুমাত্র কমপ্লিটেড এবং ভ্যালিড লগগুলো ফিল্টার করা
    const myLogs = allLogs.filter((d) => {
      const isCompleted = String(d.status || '').toLowerCase() === 'completed' || String(d.pipelineStatus || '').toLowerCase() === 'completed';
      
      const requestedBy = String(d.ngoRequest?.requestedBy || "");
      const historyMatches = Array.isArray(d.statusHistory) && d.statusHistory.some((h) => {
        const changedBy = String(h.changedBy || "");
        return (userIdStr && changedBy === userIdStr) || (ngoIdStr && changedBy === ngoIdStr);
      });
      const directNgoId = String(d.ngoId?._id || d.ngoId || d.ngo?._id || d.ngo || "");

      const isRequestedByMe = (userIdStr && requestedBy === userIdStr) || (ngoIdStr && requestedBy === ngoIdStr);
      const isDirectMatch = (userIdStr && directNgoId === userIdStr) || (ngoIdStr && directNgoId === ngoIdStr);

      const isMine = isRequestedByMe || historyMatches || isDirectMatch;

      return isCompleted && isMine;
    });

    const totalClaimed = myLogs.length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayClaimed = myLogs.filter((d) => {
      const dDate = new Date(d.createdAt || d.pickupDate);
      return dDate >= today;
    }).length;

    let mealsDistributed = 0;
    let wasteInKg = 0;

    myLogs.forEach((d) => {
      const estMeals = Number(d.estimatedMeals) || 0;
      let qtyNum = Number(d.quantity) || parseFloat(String(d.quantity || "0").replace(/[^0-9.]/g, "")) || 0;

      if (estMeals > 0) {
        mealsDistributed += estMeals;
      } else if (qtyNum > 0) {
        mealsDistributed += Math.round(qtyNum * 4);
      }

      if (qtyNum > 0) {
        wasteInKg += qtyNum;
      }
    });

    const foodWasteSaved = `${wasteInKg.toFixed(1)} Kg`;

    return res.status(200).json({
      success: true,
      stats: {
        totalClaimed: totalClaimed,
        todayClaimed: todayClaimed,
        mealsDistributed: mealsDistributed,
        todayMeals: 0,
        trustScore: 0.0,
        reviewCount: 0,
        foodWasteSaved: foodWasteSaved,
      },
    });
  } catch (error) {
    console.error("Get NGO Stats Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getNgoCompletedDonations = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userIdStr = String(decoded.id || decoded.userId || decoded._id || "");
    const ngoDoc = await Ngo.findOne({ user: userIdStr }).lean();
    const ngoIdStr = ngoDoc ? String(ngoDoc._id) : "";

    const allDonations = await Donation.find({})
      .populate('donor', 'name organizationName email restaurantName businessName')
      .lean();

    const completedList = allDonations.filter((d) => {
      const isCompleted = String(d.status || '').toLowerCase() === 'completed' || String(d.pipelineStatus || '').toLowerCase() === 'completed';
      
      const requestedBy = String(d.ngoRequest?.requestedBy || "");
      const historyMatches = Array.isArray(d.statusHistory) && d.statusHistory.some((h) => {
        const changedBy = String(h.changedBy || "");
        return (userIdStr && changedBy === userIdStr) || (ngoIdStr && changedBy === ngoIdStr);
      });
      const directNgoId = String(d.ngoId?._id || d.ngoId || d.ngo?._id || d.ngo || "");

      const isMine = (userIdStr && requestedBy === userIdStr) || (ngoIdStr && requestedBy === ngoIdStr) || historyMatches || (userIdStr && directNgoId === userIdStr) || (ngoIdStr && directNgoId === ngoIdStr);

      return isCompleted && isMine;
    });

    return res.status(200).json({
      success: true,
      donations: completedList,
    });
  } catch (error) {
    console.error("Get Completed Donations Error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const submitDistributionProof = async (req, res) => {
  try {
    const { restaurantId, donationId, description } = req.body;

    // Logged-in NGO বের করা
    const ngo = await Ngo.findOne({
      user: req.user._id,
    }).populate("user", "name");

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    let imageUrls = [];

    if (req.files && req.files.images) {
      let uploadedFiles = req.files.images;

      if (!Array.isArray(uploadedFiles)) {
        uploadedFiles = [uploadedFiles];
      }

      for (const file of uploadedFiles) {
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

        const uploadPath = path.join(
          __dirname,
          "../uploads/",
          fileName
        );

        await file.mv(uploadPath);

        imageUrls.push(`/uploads/${fileName}`);
      }
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image file.",
      });
    }

    const newDistribution = new Distribution({
      // NGO document-এর actual MongoDB _id
      ngoId: ngo._id.toString(),

      restaurantId: restaurantId
        ? String(restaurantId)
        : "manual-restaurant",

      donationId: donationId || `DIST-${Date.now()}`,

      description: description || "No description provided",

      imageUrl: imageUrls[0],
      imageUrls: imageUrls,
    });

    await newDistribution.save();

    return res.status(201).json({
      success: true,
      message: "Distribution proof submitted successfully!",
      data: newDistribution,
      ngoName: ngo.user?.name || "NGO Partner",
      ngoOrganizationId: ngo.organizationId,
    });

  } catch (error) {
    console.error("Submit Distribution Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const getDonorDistributionProofs = async (req, res) => {
  try {
    const donorId = req.user._id.toString();

    const proofs = await Distribution.find({
      restaurantId: donorId,
    }).sort({ createdAt: -1 });

    const proofsWithNgoDetails = await Promise.all(
      proofs.map(async (proof) => {
        let ngo = null;

        // 1. First try: NGO document ID
        if (
          proof.ngoId &&
          mongoose.Types.ObjectId.isValid(proof.ngoId)
        ) {
          ngo = await Ngo.findById(proof.ngoId)
            .populate("user", "name");

          // 2. Legacy: NGO User ID
          if (!ngo) {
            ngo = await Ngo.findOne({
              user: proof.ngoId,
            }).populate("user", "name");
          }
        }

        // 3. Fallback: Find NGO through related Donation
        if (!ngo && proof.donationId) {
          let donation = null;

          if (
            mongoose.Types.ObjectId.isValid(proof.donationId)
          ) {
            donation = await Donation.findById(
              proof.donationId
            );
          }

          // Also support human-readable donationId
          if (!donation) {
            donation = await Donation.findOne({
              donationId: proof.donationId,
            });
          }

          if (donation) {
            // First preference: selected NGO
            if (donation.selectedNgo) {
              ngo = await Ngo.findById(
                donation.selectedNgo
              ).populate("user", "name");
            }

            // Second preference: accepted NGO request
            if (!ngo && donation.ngoRequests?.length) {
              const acceptedRequest =
                donation.ngoRequests.find(
                  (request) =>
                    request.status?.toLowerCase() === "accepted"
                );

              if (acceptedRequest?.requestedBy) {
                ngo = await Ngo.findById(
                  acceptedRequest.requestedBy
                ).populate("user", "name");
              }
            }

            // Third preference: legacy NGO request
            if (
              !ngo &&
              donation.ngoRequest?.requestedBy
            ) {
              ngo = await Ngo.findById(
                donation.ngoRequest.requestedBy
              ).populate("user", "name");
            }
          }
        }

        return {
          ...proof.toObject(),

          ngoName: ngo?.user?.name || "NGO Partner",

          ngoOrganizationId:
            ngo?.organizationId || "Not available",
        };
      })
    );

    return res.status(200).json({
      success: true,
      proofs: proofsWithNgoDetails,
    });

  } catch (error) {
    console.error(
      "Get Donor Distribution Proofs Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch distribution proofs.",
    });
  }
};


module.exports = {
  getNgoProfile,
  getNgoStats,
  getNgoCompletedDonations,
  submitDistributionProof,
  getDonorDistributionProofs,
};