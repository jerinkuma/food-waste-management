const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

// =====================================
// GET LOGGED-IN RESTAURANT PROFILE
// =====================================

const getRestaurantProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Restaurant data খোঁজা
    const restaurant = await Restaurant.findOne({
      user: userId,
    }).populate("user", "name email role");

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

module.exports = {
  getRestaurantProfile,
};