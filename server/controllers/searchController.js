const User = require("../models/User");
const Donation = require("../models/Donation");

// =====================================
// GLOBAL SEARCH API
// GET /api/search?q=query
// =====================================
const searchGlobal = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(200).json({
        success: true,
        restaurants: [],
        donations: [],
      });
    }

    const regex = new RegExp(q.trim(), "i"); // Case-insensitive search

    // ১. শুধু রেস্টুরেন্ট এবং ডোনার খোঁজা (NGO বা অন্য রোল বাদ দেওয়া হলো)
    const users = await User.find({
      role: { $in: ["restaurant", "donor"] },
      $or: [
        { name: regex },
        { organizationName: regex },
        { email: regex },
        { address: regex },
      ],
    }).select("_id name organizationName email image address phone role");

    // ফ্রন্টএন্ডের জন্য প্রপার স্ট্রাকচার তৈরি করা
    const restaurants = users.map(u => ({
      _id: u._id,
      user: u._id, // নিশ্চিত করার জন্য user ফিল্ড রাখা হলো
      name: u.organizationName || u.name,
      organizationName: u.organizationName || u.name,
      email: u.email,
      address: u.address || "Chattogram",
      phone: u.phone || "N/A",
      image: u.image,
      role: u.role
    }));

    // ২. এভেলেবল খাবার/ডোনেশন খোঁজা (Donation collection)
    const donations = await Donation.find({
      status: "Waiting for NGO Acceptance",
      $or: [
        { foodName: regex },
        { foodCategory: regex },
        { pickupAddress: regex },
      ],
    }).populate("donor", "name organizationName image address phone");

    return res.status(200).json({
      success: true,
      restaurants, 
      donations,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Search failed.",
      error: error.message,
    });
  }
};

module.exports = {
  searchGlobal,
};