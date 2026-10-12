const Donation = require("../models/Donation");
const { getIO, rooms } = require("./socket");

// ======================================================
// FORMAT REMAINING TIME
// ======================================================

const formatRemainingTime = (minutes) => {
  if (minutes <= 0) {
    return "expired";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }

  return `${mins}m`;
};

// ======================================================
// FRESHNESS NOTIFICATION HELPER
// ======================================================

const getUrgency = (remainingMinutes) => {
  // Only 0–2 hours should reach this function
  if (
    remainingMinutes >= 0 &&
    remainingMinutes <= 120
  ) {
    return {
      level: "critical",
      title: "Food Expiring Very Soon",
    };
  }

  return null;
};

// ======================================================
// CHECK FOOD FRESHNESS
// ======================================================

const checkFreshnessNotifications = async () => {
  try {
    const now = new Date();

    // --------------------------------------------------
    // FIND ACTIVE DONATIONS
    // --------------------------------------------------

    const donations = await Donation.find({
      pipelineStatus: {
        $in: [
          "Pending",
          "Accepted",
          "Out for Delivery",
        ],
      },

      bestBefore: {
        $exists: true,
        $ne: null,
      },
    }).select(
      "_id donationId donor foodName quantity bestBefore pipelineStatus"
    );

    const io = getIO();

    // --------------------------------------------------
    // CHECK EACH DONATION
    // --------------------------------------------------

    for (const donation of donations) {
      // ------------------------------------------------
      // SAFETY CHECK
      // ------------------------------------------------

      if (!donation.donor) {
        continue;
      }

      // ------------------------------------------------
      // COMPLETED DONATION SHOULD NEVER ALERT
      // ------------------------------------------------

      if (
        donation.pipelineStatus ===
        "Completed"
      ) {
        continue;
      }

      // ------------------------------------------------
      // CONVERT BEST BEFORE TO DATE
      // ------------------------------------------------

      const expiryTime = new Date(
        donation.bestBefore
      );

      // Invalid date হলে skip
      if (
        Number.isNaN(
          expiryTime.getTime()
        )
      ) {
        continue;
      }

      // ------------------------------------------------
      // CALCULATE REMAINING TIME
      // ------------------------------------------------

      const remainingMinutes =
        Math.floor(
          (expiryTime.getTime() -
            now.getTime()) /
            (1000 * 60)
        );

      // ==================================================
      // ONLY SHOW ALERT WHEN 0–2 HOURS ARE REMAINING
      // ==================================================

      // More than 2 hours remaining
      if (remainingMinutes > 120) {
        continue;
      }

      // Expired
      if (remainingMinutes < 0) {
        continue;
      }

      // ------------------------------------------------
      // GET URGENCY
      // ------------------------------------------------

      const urgency =
        getUrgency(
          remainingMinutes
        );

      // Safety check
      if (!urgency) {
        continue;
      }

      // ------------------------------------------------
      // COMMON NOTIFICATION DATA
      // ------------------------------------------------

      const notification = {
        type: "freshness",

        donationId:
          donation._id,

        customDonationId:
          donation.donationId,

        foodName:
          donation.foodName,

        quantity:
          donation.quantity,

        bestBefore:
          donation.bestBefore,

        pipelineStatus:
          donation.pipelineStatus,

        remainingMinutes,

        urgency:
          urgency.level,

        title:
          urgency.title,

        message:
          `${donation.foodName} expires in ${formatRemainingTime(
            remainingMinutes
          )}.`,
      };

      // ==================================================
      // SEND TO DONOR
      // ==================================================

      io.to(
        rooms.restaurant(
          donation.donor.toString()
        )
      ).emit(
        "donation:freshness-alert",
        notification
      );

      // ==================================================
      // SEND TO ALL NGOs
      // ==================================================

      io.to(
        rooms.ngos()
      ).emit(
        "donation:freshness-alert",
        notification
      );

      // --------------------------------------------------
      // SERVER LOG
      // --------------------------------------------------

      console.log(
        `Freshness alert sent: ${donation.foodName} | ${urgency.level} | ${formatRemainingTime(
          remainingMinutes
        )}`
      );
    }
  } catch (error) {
    console.error(
      "Freshness notification error:",
      error
    );
  }
};

// ======================================================
// START FRESHNESS MONITOR
// ======================================================

const startFreshnessMonitor = () => {
  console.log(
    "Freshness notification monitor started."
  );

  // First check immediately
  checkFreshnessNotifications();

  // Check every 60 seconds
  setInterval(
    checkFreshnessNotifications,
    60 * 1000
  );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  startFreshnessMonitor,
  checkFreshnessNotifications,
};