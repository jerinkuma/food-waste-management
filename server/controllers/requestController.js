const DonationRequest = require('../models/DonationRequest');

// ১. ম্যাপ এবং অ্যাক্টিভ রিকোয়েস্ট উভয়ের জন্য ডেটা ফেচ করার ফাংশন
const getDonationRequests = async (req, res) => {
  try {
    const requests = await DonationRequest.find({ 
      status: { $ne: 'Archived' } 
    }).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: requests.length,
      data: requests 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ২. শুধু অ্যাক্টিভ রিকোয়েস্টগুলো আনার ফাংশন
const getActiveRequests = async (req, res) => {
  try {
    const requests = await DonationRequest.find({ 
      status: { $ne: "Archived" } 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ৩. রিকোয়েস্ট আর্কাইভ বা আপডেট করার ফাংশন
const archiveRequest = async (req, res) => {
  try {
    const newStatus = req.body.status || "Archived";
    
    await DonationRequest.findByIdAndUpdate(
      req.params.id, 
      { status: newStatus }
    );

    res.status(200).json({ 
      success: true, 
      message: "Request processed successfully" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { 
  getDonationRequests, 
  getActiveRequests, 
  archiveRequest 
};