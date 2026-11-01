
const ContactMessage = require("../models/ContactMessage");
const { sendEmail } = require("../utils/email");

const {
  adminNotificationEmail,
  visitorConfirmationEmail,
  visitorReplyEmail,
} = require("../utils/emailTemplates");

// ==========================================
// PUBLIC: SUBMIT CONTACT MESSAGE
// ==========================================
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      cleanName.length < 2 ||
      cleanName.length > 100 ||
      !emailRegex.test(cleanEmail) ||
      cleanEmail.length > 254 ||
      cleanSubject.length < 2 ||
      cleanSubject.length > 150 ||
      cleanMessage.length < 10 ||
      cleanMessage.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid contact information and message.",
      });
    }

    // Save message first so an email failure does not lose the message.
    const contact = await ContactMessage.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    console.log("CONTACT MESSAGE SAVED:", contact._id);
    console.log("CONNECTED DATABASE:", ContactMessage.db.name);

    let adminEmailSent = false;
    let autoReplySent = false;

    // ==========================================
    // NOTIFY ADMIN
    // ==========================================
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `New FeedLink Contact Message: ${cleanSubject}`,
        html: adminNotificationEmail({
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          contactId: contact._id,
        }),
        text: `New contact message from ${cleanName}
Email: ${cleanEmail}
Subject: ${cleanSubject}

${cleanMessage}`,
        replyTo: cleanEmail,
      });

      adminEmailSent = true;
    } catch (emailError) {
      console.error(
        "Admin notification email error:",
        emailError.message
      );
    }

    // ==========================================
    // SEND CONFIRMATION TO VISITOR
    // ==========================================
    try {
      await sendEmail({
        to: cleanEmail,
        subject: "We received your message - FeedLink",
        html: visitorConfirmationEmail({
          name: cleanName,
          subject: cleanSubject,
        }),
        text: `Hello ${cleanName},

We have received your message. Our team will review it soon.

Subject: ${cleanSubject}

Regards,
FeedLink Team`,
      });

      autoReplySent = true;
    } catch (emailError) {
      console.error(
        "Visitor confirmation email error:",
        emailError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully.",
      contactId: contact._id,
      emailNotificationSent: adminEmailSent,
      confirmationEmailSent: autoReplySent,
    });
  } catch (error) {
    console.error("Submit contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit your message.",
    });
  }
};

// ==========================================
// ADMIN: GET ALL CONTACT MESSAGES
// ==========================================
const getContactMessages = async (req, res) => {
  try {
    const { search = "", status = "" } = req.query;

    const filter = {};

    if (["New", "Read", "Replied", "Resolved"].includes(status)) {
      filter.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get contact messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages.",
    });
  }
};

// ==========================================
// ADMIN: GET UNREAD COUNT
// ==========================================
const getUnreadContactCount = async (req, res) => {
  try {
    const unreadCount = await ContactMessage.countDocuments({
      isRead: false,
      status: "New",
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Unread contact count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread message count.",
    });
  }
};

// ==========================================
// ADMIN: UPDATE MESSAGE STATUS
// ==========================================
const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["New", "Read", "Replied", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status.",
      });
    }

    const update = { status };

    if (status === "New") {
      update.isRead = false;
    } else {
      update.isRead = true;
    }

    if (status === "Resolved") {
      update.resolvedAt = new Date();
    } else {
      update.resolvedAt = null;
    }

    const contact = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message status updated successfully.",
      contact,
    });
  } catch (error) {
    console.error("Update contact status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update message status.",
    });
  }
};

// ==========================================
// ADMIN: REPLY TO VISITOR
// ==========================================
const replyToContactMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }

    const replyText = String(message).trim();

    if (replyText.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Reply cannot exceed 3000 characters.",
      });
    }

    const contact = await ContactMessage.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    // Send email before changing status.
    await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: visitorReplyEmail({
        name: contact.name,
        reply: replyText,
        originalMessage: contact.message,
      }),
      text: `Hello ${contact.name},

${replyText}

Your original message:
${contact.message}

Regards,
FeedLink Team`,
    });

    contact.replies.push({
      message: replyText,
      sentAt: new Date(),
    });

    contact.status = "Replied";
    contact.isRead = true;
    contact.repliedAt = new Date();

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully.",
      contact,
    });
  } catch (error) {
    console.error("Reply contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send reply email.",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  submitContactMessage,
  getContactMessages,
  getUnreadContactCount,
  updateContactMessageStatus,
  replyToContactMessage,
};
