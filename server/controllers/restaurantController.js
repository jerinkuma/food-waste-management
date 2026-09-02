const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

// =====================================
// GET RESTAURANT PROFILE
// =====================================

const getRestaurantProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const restaurant = await Restaurant.findOne({
      user: userId,
    }).populate("user", "name email role createdAt");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      restaurant: {
        id: restaurant._id,
        userId: restaurant.user._id,
        name: restaurant.user.name,
        email: restaurant.user.email,
        role: restaurant.user.role,
        phone: restaurant.phone,
        address: restaurant.address,
        tradeLicense: restaurant.tradeLicense,
        profileImage: restaurant.profileImage || "",
        createdAt: restaurant.user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Restaurant Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================
// UPDATE RESTAURANT PROFILE
// =====================================

const updateRestaurantProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    const {
      name,
      phone,
      tradeLicense,
      address,
    } = req.body;

    const restaurant = await Restaurant.findOne({
      user: userId,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant profile not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user name
    if (name && name.trim()) {
      user.name = name.trim();
      await user.save();
    }

    // Update restaurant information
    if (phone !== undefined) {
      restaurant.phone = phone.trim();
    }

    if (tradeLicense !== undefined) {
      restaurant.tradeLicense = tradeLicense.trim();
    }

    if (address !== undefined) {
      restaurant.address = address.trim();
    }

    // Save uploaded profile image
    if (req.file) {
      restaurant.profileImage =
        `/uploads/profiles/${req.file.filename}`;
    }

    await restaurant.save();

    // Get updated profile
    const updatedRestaurant =
      await Restaurant.findById(
        restaurant._id
      ).populate(
        "user",
        "name email role createdAt"
      );

    return res.status(200).json({
      success: true,
      message: "Restaurant profile updated successfully.",
      restaurant: {
        id: updatedRestaurant._id,
        userId: updatedRestaurant.user._id,
        name: updatedRestaurant.user.name,
        email: updatedRestaurant.user.email,
        role: updatedRestaurant.user.role,
        phone: updatedRestaurant.phone,
        address: updatedRestaurant.address,
        tradeLicense: updatedRestaurant.tradeLicense,
        profileImage:
          updatedRestaurant.profileImage || "",
        createdAt: updatedRestaurant.user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Update Restaurant Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update restaurant profile.",
      error: error.message,
    });
  }
};


module.exports = {
  getRestaurantProfile,
  updateRestaurantProfile,
};