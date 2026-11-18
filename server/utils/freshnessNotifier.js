
const Donation = require("../models/Donation");
const User = require("../models/User");

const { getIO, rooms } = require("./socket");

const {
  createFreshnessNotification,
} = require("./notificationUtils");

// ======================================================
// CONFIGURATION
// ======================================================

const ACTIVE_STATUSES = [
  "Pending",
  "Accepted",
  "Out for Delivery",
];

const ALERT_WINDOW_MINUTES = 120;
const CHECK_INTERVAL = 60 * 1000;

let freshnessInterval = null;
let isChecking = false;

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
// GET URGENCY
// ======================================================

const getUrgency = (remainingMinutes) => {
  if (
    remainingMinutes >= 0 &&
    remainingMinutes <= ALERT_WINDOW_MINUTES
  ) {
    return {
      level: "critical",
      title: "Food Expiring Very Soon",
    };
  }

  return null;
};

// ======================================================
// CHECK FOOD FRESHNESS NOTIFICATIONS
// ======================================================

const checkFreshnessNotifications = async () => {
  // Prevent overlapping checks in the same process
  if (isChecking) {
    return;
  }

  isChecking = true;

  try {
    const now = new Date();

    const alertLimit = new Date(
      now.getTime() +
        ALERT_WINDOW_MINUTES * 60 * 1000
    );

    // ================================================
    // FIND ACTIVE DONATIONS NEAR EXPIRY
    // ================================================

    const donations = await Donation.find({
      pipelineStatus: {
        $in: ACTIVE_STATUSES,
      },

      bestBefore: {
        $gt: now,
        $lte: alertLimit,
      },

      freshnessAlertSentAt: null,
    }).select(
      "_id donationId donor foodName quantity bestBefore pipelineStatus freshnessAlertSentAt"
    );

    if (!donations.length) {
      return;
    }

    // ================================================
    // GET ALL NGO USERS
    // ================================================

    const ngoUsers = await User.find({
      role: "ngo",
    }).select("_id");

    // ================================================
    // INITIALIZE SOCKET.IO
    // ================================================

    const io = getIO();

    // ================================================
    // PROCESS EACH DONATION
    // ================================================

    for (const donation of donations) {
      try {
        // --------------------------------------------
        // VALIDATE DONOR
        // --------------------------------------------

        if (!donation.donor) {
          continue;
        }

        // --------------------------------------------
        // VALIDATE DONATION STATUS
        // --------------------------------------------

        if (
          !ACTIVE_STATUSES.includes(
            donation.pipelineStatus
          )
        ) {
          continue;
        }

        // --------------------------------------------
        // VALIDATE EXPIRY DATE
        // --------------------------------------------

        const expiryTime = new Date(
          donation.bestBefore
        );

        if (
          Number.isNaN(expiryTime.getTime())
        ) {
          continue;
        }

        const currentTime = new Date();

        const remainingMinutes = Math.floor(
          (expiryTime.getTime() -
            currentTime.getTime()) /
            60000
        );

        // --------------------------------------------
        // CHECK EXPIRY WINDOW
        // --------------------------------------------

        if (
          remainingMinutes < 0 ||
          remainingMinutes > ALERT_WINDOW_MINUTES
        ) {
          continue;
        }

        // --------------------------------------------
        // GET URGENCY
        // --------------------------------------------

        const urgency = getUrgency(
          remainingMinutes
        );

        if (!urgency) {
          continue;
        }

        // ============================================
        // ATOMIC DUPLICATE ALERT PREVENTION
        // ============================================

        const claimedDonation =
          await Donation.findOneAndUpdate(
            {
              _id: donation._id,

              pipelineStatus: {
                $in: ACTIVE_STATUSES,
              },

              bestBefore: {
                $gt: new Date(),
                $lte: new Date(
                  Date.now() +
                    ALERT_WINDOW_MINUTES *
                      60 *
                      1000
                ),
              },

              freshnessAlertSentAt: null,
            },

            {
              $set: {
                freshnessAlertSentAt: new Date(),
              },
            },

            {
              new: true,
            }
          );

        // Already claimed by another check
        if (!claimedDonation) {
          continue;
        }

        // ============================================
        // PREPARE REAL-TIME ALERT DATA
        // ============================================

        const notificationData = {
          type: "freshness",

          donationId: claimedDonation._id,

          customDonationId:
            claimedDonation.donationId,

          foodName:
            claimedDonation.foodName,

          quantity:
            claimedDonation.quantity,

          bestBefore:
            claimedDonation.bestBefore,

          pipelineStatus:
            claimedDonation.pipelineStatus,

          remainingMinutes,

          urgency: urgency.level,

          title: urgency.title,

          message:
            `${claimedDonation.foodName} expires in ` +
            `${formatRemainingTime(remainingMinutes)}.`,
        };

        // ============================================
        // CREATE DONOR DATABASE NOTIFICATION
        // ============================================

        const donorNotification =
          await createFreshnessNotification({
            recipient: claimedDonation.donor,
            role: "donor",
            donation: claimedDonation,
            remainingMinutes,
          });

        // ============================================
        // CREATE NGO DATABASE NOTIFICATIONS
        // ============================================

        for (const ngoUser of ngoUsers) {
          await createFreshnessNotification({
            recipient: ngoUser._id,
            role: "ngo",
            donation: claimedDonation,
            remainingMinutes,
          });
        }

        // ============================================
        // EMIT CUSTOM REAL-TIME ALERT
        // ============================================

        // Donor room
        io.to(
          rooms.restaurant(
            claimedDonation.donor.toString()
          )
        ).emit(
          "donation:freshness-alert",
          notificationData
        );

        // All NGO rooms
        io.to(
          rooms.ngos()
        ).emit(
          "donation:freshness-alert",
          notificationData
        );

        // ============================================
        // SERVER LOG
        // ============================================

        console.log(
          `Freshness alert processed: ${
            claimedDonation.donationId
          } | ${
            urgency.level
          } | ${
            formatRemainingTime(remainingMinutes)
          } | Donor notification: ${
            donorNotification ? "Saved" : "Failed"
          }`
        );

      } catch (donationError) {
        console.error(
          `Freshness alert error for ${donation.donationId}:`,
          donationError
        );
      }
    }

  } catch (error) {
    console.error(
      "Freshness Monitor Error:",
      error
    );

  } finally {
    isChecking = false;
  }
};

// ======================================================
// START FRESHNESS MONITOR
// ======================================================

const startFreshnessMonitor = () => {
  if (freshnessInterval) {
    console.log(
      "Freshness monitor is already running."
    );

    return;
  }

  console.log(
    "Freshness notification monitor started."
  );

  // Run immediately
  checkFreshnessNotifications();

  // Repeat every 60 seconds
  freshnessInterval = setInterval(
    checkFreshnessNotifications,
    CHECK_INTERVAL
  );

  if (freshnessInterval.unref) {
    freshnessInterval.unref();
  }
};

// ======================================================
// STOP FRESHNESS MONITOR
// ======================================================

const stopFreshnessMonitor = () => {
  if (freshnessInterval) {
    clearInterval(freshnessInterval);
    freshnessInterval = null;

    console.log(
      "Freshness notification monitor stopped."
    );
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  startFreshnessMonitor,
  stopFreshnessMonitor,
  checkFreshnessNotifications,
  formatRemainingTime,
  getUrgency,
};
