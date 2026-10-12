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
    if (!recipient) {
      console.error("Notification error: recipient is required.");
      return null;
    }

    // Save notification in MongoDB
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

    // Send notification in real-time
    // User's role can be passed inside data.role
    const role = data?.role;

    if (role === "admin") {
      getIO()
        .to(rooms.admins())
        .emit("notification:new", notificationData);
    } else if (role === "ngo") {
      getIO()
        .to(rooms.ngo(recipient.toString()))
        .emit("notification:new", notificationData);
    } else if (role === "donor") {
      getIO()
        .to(rooms.restaurant(recipient.toString()))
        .emit("notification:new", notificationData);
    }

    return notificationData;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

module.exports = {
  createNotification,
};