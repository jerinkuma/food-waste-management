const User = require('../models/User');
const Ngo = require('../models/Ngo');

const getRequestUserId = (req) => {
  return req.user?.id || req.user?._id;
};

const getNgoSettings = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized / Token missing' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const ngo = await Ngo.findOne({ user: userId });

    res.status(200).json({
      success: true,
      data: {
        fullName: user.name || '',
        ngoName: ngo?.ngoName || user.name || '',
        email: user.email || '',
        phone: ngo?.phone || '',
        licenseNo: ngo?.organizationId || ngo?.licenseNo || '',
        address: ngo?.address || '',
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    console.error("Get NGO Settings Error:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateNgoProfile = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized / Token missing' });
    }

    const { fullName, ngoName, phone, licenseNo, address } = req.body;
    let avatarPath;

    if (req.file) {
      avatarPath = `/uploads/${req.file.filename}`;
    } else if (req.body.avatar === "") {
      avatarPath = ""; 
    }

    // ১. ইউজারের নাম ও ছবি ডাটাবেজে পার্মানেন্টলি আপডেট করা
    const userUpdateFields = {};
    if (fullName) userUpdateFields.name = fullName;
    if (avatarPath !== undefined) userUpdateFields.avatar = avatarPath;

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: userUpdateFields }, 
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // ২. এনজিওর প্রোপার্টি ডাটাবেজে স্থায়ীভাবে সেভ বা আপডেট করা
    const ngoUpdateData = {
      user: userId,
      ngoName: ngoName || fullName,
      phone: phone || '',
      organizationId: licenseNo || '',
      licenseNo: licenseNo || '',
      address: address || '',
    };

    const updatedNgo = await Ngo.findOneAndUpdate(
      { user: userId },
      { $set: ngoUpdateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated and saved permanently successfully!',
      data: {
        fullName: updatedUser.name,
        ngoName: updatedNgo.ngoName,
        email: updatedUser.email,
        phone: updatedNgo.phone,
        licenseNo: updatedNgo.licenseNo,
        address: updatedNgo.address,
        avatar: updatedUser.avatar || '',
      },
    });
  } catch (error) {
    console.error("Permanent Update NGO Profile Error:", error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};

const updateNgoPassword = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized / Token missing' });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword ? await user.matchPassword(currentPassword) : currentPassword === user.password;
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ success: false, message: 'Failed to update password', error: error.message });
  }
};

module.exports = {
  getNgoSettings,
  updateNgoProfile,
  updateNgoPassword,
};