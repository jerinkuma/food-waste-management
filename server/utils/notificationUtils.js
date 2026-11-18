
const Notification = require("../models/Notification");
const { getIO, rooms } = require("./socket");

// =====================================
// CREATE + SEND NOTIFICATION
// =====================================

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  donation = null,
  feedback = null,
  data = {},
}) => {
  try {
    // =====================================
    // VALIDATE RECIPIENT
    // =====================================

    if (!recipient) {
      console.error("Notification error: recipient is required.");
      return null;
    }

    if (!type || !title || !message) {
      console.error(
        "Notification error: type, title and message are required."
      );
      return null;
    }

    // =====================================
    // SAVE NOTIFICATION IN MONGODB
    // =====================================

    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      donation,
      feedback,
      data,
      read: false,
    });

    // Convert notification to plain object
    const notificationData = notification.toObject();

    // =====================================
    // SEND REAL-TIME NOTIFICATION
    // =====================================

    const role = data?.role;

    try {
      const io = getIO();

      if (role === "admin") {
        io.to(rooms.admins()).emit(
          "notification:new",
          notificationData
        );
      } else if (role === "ngo") {
        io.to(rooms.ngo(recipient.toString())).emit(
          "notification:new",
          notificationData
        );
      } else if (role === "donor") {
        io.to(rooms.restaurant(recipient.toString())).emit(
          "notification:new",
          notificationData
        );
      }
    } catch (socketError) {
      // Database notification is already saved.
      console.error(
        "Notification Socket Error:",
        socketError.message
      );
    }

    return notificationData;

  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// =====================================
// CREATE FRESHNESS ALERT
// =====================================

const createFreshnessNotification = async ({
  recipient,
  role,
  donation,
  remainingMinutes,
}) => {
  try {
    if (!recipient || !donation) {
      console.error(
        "Freshness notification error: recipient and donation are required."
      );
      return null;
    }

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    let remainingTime;

    if (hours > 0) {
      remainingTime = `${hours}h ${minutes}m`;
    } else {
      remainingTime = `${minutes} minutes`;
    }

    const title = "Food Expiring Very Soon";

    const message =
      `${donation.foodName} expires in ${remainingTime}.`;

    return await createNotification({
      recipient,
      type: "FRESHNESS_ALERT",
      title,
      message,
      donation: donation._id,
      data: {
        role,
        donationId: donation.donationId,
        foodName: donation.foodName,
        quantity: donation.quantity,
        bestBefore: donation.bestBefore,
        pipelineStatus: donation.pipelineStatus,
        remainingMinutes,
        urgency: "critical",
      },
    });

  } catch (error) {
    console.error(
      "Create freshness notification error:",
      error
    );

    return null;
  }
};

// =====================================
// EXPORT FUNCTIONS
// =====================================

module.exports = {
  createNotification,
  createFreshnessNotification,
};
