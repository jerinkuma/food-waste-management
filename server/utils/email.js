
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email credentials are not configured.");
  }

  if (!to || !subject || !html) {
    throw new Error("Email recipient, subject and HTML are required.");
  }

  return transporter.sendMail({
    from: `"FeedLink" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    ...(text && { text }),
    ...(replyTo && { replyTo }),
  });
};

module.exports = { sendEmail };
