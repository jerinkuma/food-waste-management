const Ngo = require("../models/Ngo");
const Donation = require("../models/Donation");
const Distribution = require("../models/Distribution");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const { getIO, rooms } = require("../utils/socket");

// ======================================================
// HELPERS
// ======================================================

const getRequestUserId = (req) => {
  const fromUser =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId;

  if (fromUser) return String(fromUser);

  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) return null;

  try {
    const decoded = jwt.verify(
      authHeader.slice(7),
      process.env.JWT_SECRET
    );

    const id =
      decoded.id ||
      decoded.userId ||
      decoded._id;

    return id ? String(id) : null;
  } catch {
    return null;
  }
};

const getId = (value) => {
  if (!value) return "";

  return String(
    value._id ||
    value.id ||
    value
  );
};

const isCompletedDonation = (donation) => {
  const statuses = [
    donation.pipelineStatus,
    donation.status,
  ].map((value) =>
    String(value || "").trim().toLowerCase()
  );

  return statuses.some(
    (status) =>
      status === "completed" ||
      status === "delivered"
  );
};

const getDonationCompletedAt = (donation) => {
  const historyDate = [
    ...(donation.statusHistory || []),
  ]
    .reverse()
    .find(
      (item) =>
        String(item.status || "")
          .trim()
          .toLowerCase() === "completed" &&
        item.changedAt
    )?.changedAt;

  return (
    donation.verification?.verifiedAt ||
    historyDate ||
    null
  );
};

const isDonationOwnedByNgo = (donation, ngoId) => {
  const targetId = String(ngoId);

  if (
    getId(donation.selectedNgo) === targetId
  ) {
    return true;
  }

  const acceptedRequest = (
    donation.ngoRequests || []
  ).some(
    (request) =>
      getId(request.requestedBy) === targetId &&
      String(request.status || "").toLowerCase() ===
        "accepted"
  );

  if (acceptedRequest) return true;

  if (
    getId(donation.ngoRequest?.requestedBy) ===
    targetId
  ) {
    return true;
  }

  return (
    getId(donation.ngoId || donation.ngo) ===
    targetId
  );
};

const getCurrentNgoDocument = async (req) => {
  const userId = getRequestUserId(req);

  if (!userId) {
    return {
      userId: null,
      ngo: null,
    };
  }

  const ngo = await Ngo.findOne({
    user: userId,
  }).populate("user", "name fullName email role");

  return {
    userId,
    ngo,
  };
};

// ======================================================
// GET NGO PROFILE
// ======================================================

const getNgoProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const userId =
      decoded.id ||
      decoded.userId ||
      decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    const ngo = await Ngo.findOne({
      user: userId,
    }).populate(
      "user",
      "name fullName email role"
    );

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message:
          "NGO profile not found for this account",
      });
    }

    return res.status(200).json({
      success: true,
      ngo,
    });
  } catch (error) {
    console.error("Get NGO Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE NGO PROFILE (With upsert & avatar support)
// ======================================================

const updateNgoProfile = async (req, res) => {
  try {
    const { userId, ngo } = await getCurrentNgoDocument(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { fullName, ngoName, phone, licenseNo, address } = req.body || {};

    if (fullName !== undefined) {
      await User.findByIdAndUpdate(userId, {
        fullName: fullName.trim(),
        name: fullName.trim(),
      });
    }

    let avatarUrl = ngo?.avatar;

    if (req.files?.avatar) {
      const avatarFile = req.files.avatar;
      const uploadDirectory = path.join(__dirname, "../uploads");

      fs.mkdirSync(uploadDirectory, { recursive: true });

      const safeName = String(avatarFile.name || "avatar").replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `ngo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;
      const uploadPath = path.join(uploadDirectory, fileName);

      await avatarFile.mv(uploadPath);
      avatarUrl = `/uploads/${fileName}`;
    }

    const updateData = {
      user: userId,
    };

    if (ngoName !== undefined) updateData.ngoName = ngoName.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (licenseNo !== undefined) updateData.licenseNo = licenseNo.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (avatarUrl !== undefined) updateData.avatar = avatarUrl;

    const updatedNgo = await Ngo.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("user", "name fullName email role");

    return res.status(200).json({
      success: true,
      message: "NGO profile updated successfully.",
      data: updatedNgo,
    });
  } catch (error) {
    console.error("Update NGO Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
};

// ======================================================
// CHANGE NGO PASSWORD
// ======================================================

const changeNgoPassword = async (req, res) => {
  try {
    const userId = getRequestUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new passwords.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while changing password.",
      error: error.message,
    });
  }
};

// ======================================================
// GET NGO STATS
// ======================================================

const getNgoStats = async (req, res) => {
  try {
    const { userId, ngo } =
      await getCurrentNgoDocument(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token missing or invalid.",
      });
    }

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message:
          "NGO profile not found for this account.",
      });
    }

    const allDonations = await Donation.find({}).lean();

    const completedDonations = allDonations.filter(
      (donation) =>
        isCompletedDonation(donation) &&
        isDonationOwnedByNgo(donation, ngo._id)
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    let totalMeals = 0;
    let totalWasteKg = 0;
    let todayClaimed = 0;
    let todayMeals = 0;

    completedDonations.forEach((donation) => {
      const quantity = Number(donation.quantity) || 0;

      const storedMeals = Number(donation.estimatedMeals);

      const meals =
        Number.isFinite(storedMeals) && storedMeals > 0
          ? storedMeals
          : Math.floor(quantity * 4);

      totalMeals += meals;
      totalWasteKg += quantity;

      const completedAt = getDonationCompletedAt(donation);

      if (completedAt) {
        const completedDate = new Date(completedAt);

        if (
          completedDate >= todayStart &&
          completedDate < tomorrowStart
        ) {
          todayClaimed += 1;
          todayMeals += meals;
        }
      }
    });

    const donorRatings = await Feedback.find({
      ngo: ngo._id,
      submittedBy: "Donor",
      category: "NGO Rating",
      rating: {
        $gte: 1,
        $lte: 5,
      },
    })
      .select("rating")
      .lean();

    const validRatings = donorRatings
      .map((item) => Number(item.rating))
      .filter(
        (score) =>
          Number.isFinite(score) &&
          score >= 1 &&
          score <= 5
      );

    const trustScore = validRatings.length
      ? Number(
          (
            validRatings.reduce(
              (sum, score) => sum + score,
              0
            ) / validRatings.length
          ).toFixed(1)
        )
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalClaimed: completedDonations.length,
        todayClaimed,
        mealsDistributed: totalMeals,
        todayMeals,
        trustScore,
        reviewCount: validRatings.length,
        foodWasteSaved: `${totalWasteKg.toFixed(1)} Kg`,
      },
    });
  } catch (error) {
    console.error("Get NGO Stats Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while loading NGO statistics.",
      error: error.message,
    });
  }
};

// ======================================================
// GET NGO COMPLETED DONATIONS
// ======================================================

const getNgoCompletedDonations = async (
  req,
  res
) => {
  try {
    const { userId, ngo } =
      await getCurrentNgoDocument(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token missing or invalid.",
      });
    }

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    const donations = await Donation.find({
      $or: [
        {
          selectedNgo: ngo._id,
        },
        {
          ngoRequests: {
            $elemMatch: {
              requestedBy: ngo._id,
              status: "Accepted",
            },
          },
        },
        {
          "ngoRequest.requestedBy": ngo._id,
        },
        {
          ngoId: ngo._id,
        },
        {
          ngo: ngo._id,
        },
      ],
    })
      .populate(
        "donor",
        "name email organizationName restaurantName businessName"
      )
      .sort({
        updatedAt: -1,
      })
      .lean();

    const completed = donations
      .filter(isCompletedDonation)
      .map((donation) => ({
        ...donation,
        completedAt:
          getDonationCompletedAt(donation),
      }));

    return res.status(200).json({
      success: true,
      count: completed.length,
      donations: completed,
    });
  } catch (error) {
    console.error(
      "Get Completed Donations Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load completed donations.",
      error: error.message,
    });
  }
};

// ======================================================
// SUBMIT DISTRIBUTION PROOF
// ======================================================

const submitDistributionProof = async (
  req,
  res
) => {
  try {
    const { userId, ngo } =
      await getCurrentNgoDocument(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found.",
      });
    }

    const {
      donationId,
      description,
      imageUrl,
    } = req.body || {};

    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: "Donation ID is required.",
      });
    }

    let donation = null;

    if (
      mongoose.Types.ObjectId.isValid(
        String(donationId)
      )
    ) {
      donation = await Donation.findById(
        donationId
      );
    }

    if (!donation) {
      donation = await Donation.findOne({
        donationId: String(donationId),
      });
    }

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    if (!isCompletedDonation(donation)) {
      return res.status(400).json({
        success: false,
        message:
          "Proof can only be submitted for a completed donation.",
      });
    }

    if (
      !isDonationOwnedByNgo(
        donation,
        ngo._id
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This completed donation does not belong to your NGO.",
      });
    }

    const imageUrls = [];

    const uploadedFiles = req.files?.images
      ? Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images]
      : [];

    if (uploadedFiles.length) {
      const uploadDirectory = path.join(
        __dirname,
        "../uploads"
      );

      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });

      for (const file of uploadedFiles) {
        const safeName = String(
          file.name || "proof-image"
        ).replace(/[^a-zA-Z0-9._-]/g, "_");

        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}_${safeName}`;

        const uploadPath = path.join(
          uploadDirectory,
          fileName
        );

        await file.mv(uploadPath);

        imageUrls.push(
          `/uploads/${fileName}`
        );
      }
    }

    if (
      !imageUrls.length &&
      typeof imageUrl === "string" &&
      imageUrl.trim()
    ) {
      imageUrls.push(imageUrl.trim());
    }

    if (!imageUrls.length) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide an image URL or upload at least one proof image.",
      });
    }

    const restaurantId = getId(
      donation.donor
    );

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message:
          "The donation has no linked restaurant account.",
      });
    }

    const proof = await Distribution.create({
      ngoId: String(ngo._id),
      restaurantId,
      donationId: String(donation._id),
      description: String(
        description ||
          "Food distribution completed."
      ),
      imageUrl: imageUrls[0],
      imageUrls,
    });

    const payload = {
      ...proof.toObject(),

      ngoName:
        ngo.user?.name || "NGO Partner",

      ngoOrganizationId:
        ngo.organizationId,

      donation: {
        _id: donation._id,
        donationId: donation.donationId,
        foodName: donation.foodName,
      },
    };

    getIO()
      .to(rooms.restaurant(restaurantId))
      .emit(
        "donation:distribution-proof",
        payload
      );

    getIO()
      .to(rooms.admins())
      .emit(
        "donation:distribution-proof",
        payload
      );

    return res.status(201).json({
      success: true,
      message:
        "Distribution proof submitted successfully.",
      data: payload,
    });
  } catch (error) {
    console.error(
      "Submit Distribution Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit distribution proof.",
      error: error.message,
    });
  }
};

// ======================================================
// GET DONOR DISTRIBUTION PROOFS
// ======================================================

const getDonorDistributionProofs = async (
  req,
  res
) => {
  try {
    const donorId = req.user._id.toString();

    const proofs = await Distribution.find({
      restaurantId: donorId,
    }).sort({
      createdAt: -1,
    });

    const proofsWithNgoDetails =
      await Promise.all(
        proofs.map(async (proof) => {
          let ngo = null;

          if (
            proof.ngoId &&
            mongoose.Types.ObjectId.isValid(
              proof.ngoId
            )
          ) {
            ngo = await Ngo.findById(
              proof.ngoId
            ).populate("user", "name");

            if (!ngo) {
              ngo = await Ngo.findOne({
                user: proof.ngoId,
              }).populate("user", "name");
            }
          }

          if (!ngo && proof.donationId) {
            let donation = null;

            if (
              mongoose.Types.ObjectId.isValid(
                proof.donationId
              )
            ) {
              donation = await Donation.findById(
                proof.donationId
              );
            }

            if (!donation) {
              donation = await Donation.findOne({
                donationId: proof.donationId,
              });
            }

            if (donation) {
              if (donation.selectedNgo) {
                ngo = await Ngo.findById(
                  donation.selectedNgo
                ).populate("user", "name");
              }

              if (
                !ngo &&
                donation.ngoRequests?.length
              ) {
                const acceptedRequest =
                  donation.ngoRequests.find(
                    (request) =>
                      request.status?.toLowerCase() ===
                      "accepted"
                  );

                if (
                  acceptedRequest?.requestedBy
                ) {
                  ngo = await Ngo.findById(
                    acceptedRequest.requestedBy
                  ).populate("user", "name");
                }
              }

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

            ngoName:
              ngo?.user?.name || "NGO Partner",

            ngoOrganizationId:
              ngo?.organizationId ||
              "Not available",
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
      message:
        "Failed to fetch distribution proofs.",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getNgoProfile,
  updateNgoProfile,
  changeNgoPassword,
  getNgoStats,
  getNgoCompletedDonations,
  submitDistributionProof,
  getDonorDistributionProofs,
};