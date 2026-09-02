const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Ngo = require("../models/Ngo");
const Restaurant = require("../models/Restaurant");

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
    const existingUser = await User.findOne({ email });

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
      email,
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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
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

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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


module.exports = {
  signup,
  login,
};