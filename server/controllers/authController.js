const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Ngo = require("../models/Ngo");
const Restaurant = require("../models/Restaurant");


//forgetpass
const crypto = require("crypto");
const sendEmail = require("../utils/email").sendEmail;

// ===============================
// SIGNUP
// ===============================

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      organizationId,
      maximumCapacity,
      tradeLicense,
      phone,
      address,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    // Role validation
    if (!["donor", "ngo"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    // NGO registration
    if (role === "ngo") {
      if (
        !organizationId ||
        !maximumCapacity ||
        !phone ||
        !address
      ) {
        return res.status(400).json({
          success: false,
          message: "All NGO information is required",
        });
      }

      await Ngo.create({
        user: user._id,
        ngoName: name, // 👉 এনজিওর নাম হিসেবে ইউজারনেম/নাম সেভ নিশ্চিত করা হলো
        organizationId,
        maximumCapacity,
        phone,
        address,
      });
    }

    // Donor / Restaurant registration
    if (role === "donor") {
      if (!tradeLicense || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: "All donor information is required",
        });
      }

      await Restaurant.create({
        user: user._id,
        restaurantName: name, // 👉 রেস্টুরেন্টের নাম সেভ নিশ্চিত করা হলো
        tradeLicense,
        phone,
        address,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during signup",
      error: error.message,
    });
  }
};


// ===============================
// LOGIN
// ===============================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let ngoDetails = null;
    let restaurantDetails = null;

    // 👉 রোল অনুযায়ী সঠিক টেবিল থেকে অর্গানাইজেশন বা এনজিওর নাম ফেচ করা হলো
    if (user.role === "ngo") {
      ngoDetails = await Ngo.findOne({ user: user._id });
    } else if (user.role === "donor") {
      restaurantDetails = await Restaurant.findOne({ user: user._id });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      {
        expiresIn: "7d",
      }
    );

    // 👉 ফিক্সড অর্গানাইজেশন বা এনজিও নাম রেসপন্সে পাঠানো
    const organizationName = 
      ngoDetails?.ngoName || 
      restaurantDetails?.restaurantName || 
      user.name;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        ngoName: organizationName, // হেডার এবং সেটিংসের জন্য সঠিক নাম
        email: user.email,
        role: user.role,
        avatar: user.avatar || null, // ইউজারের নিজস্ব ছবি
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};


// ===============================
// CHANGE PASSWORD
// ===============================

const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      currentPassword,
      newPassword,
    } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    // New password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent same password
    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {
    console.error(
      "Change Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while changing password",
    });
  }
};
// ===============================
// FORGOT PASSWORD
// ===============================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // Email আছে কি নেই, তা প্রকাশ করা হবে না
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Database-এ token hash সংরক্ষণ
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token 15 মিনিট পর expire হবে
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/reset-password/${resetToken}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:550px;margin:auto;padding:30px;color:#333;">
        <h2 style="color:#16a34a;">FeedLink Password Reset</h2>

        <p>Hello ${user.name},</p>

        <p>We received a request to reset your FeedLink account password.</p>

        <p>Click the button below to create a new password.</p>

        <a href="${resetUrl}"
          style="display:inline-block;background:#16a34a;color:white;padding:13px 25px;text-decoration:none;border-radius:8px;font-weight:bold;">
          Reset Password
        </a>

        <p style="margin-top:25px;">
          This link will expire in 15 minutes.
        </p>

        <p>If you did not request this, you can safely ignore this email.</p>

        <p>Regards,<br/>FeedLink Team</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "FeedLink - Password Reset Request",
        html,
        text: `Reset your FeedLink password using this link: ${resetUrl}. This link expires in 15 minutes.`,
      });
    } catch (emailError) {
      // Email পাঠানো ব্যর্থ হলে token মুছে ফেলবে
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};


// ===============================
// RESET PASSWORD
// ===============================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both password fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Received token-এর hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Valid এবং unexpired token দিয়ে user খোঁজা
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or expired",
      });
    }

    // নতুন password hash
    user.password = await bcrypt.hash(newPassword, 10);

    // Token একবার ব্যবহার হওয়ার পর মুছে যাবে
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

module.exports = {
  signup,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};