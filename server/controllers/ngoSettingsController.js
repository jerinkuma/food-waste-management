const Ngo = require('../models/Ngo');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const getUserIdFromReq = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    return decoded.id || decoded.userId;
  } catch (err) {
    return null;
  }
};

// -------------------------------------------------------------
// ১. GET NGO Settings Data
// -------------------------------------------------------------
exports.getNgoSettings = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized / Token missing' });

    const ngo = await Ngo.findOne({ user: userId }).populate('user', 'name email avatar');
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    res.status(200).json({
      fullName: ngo.user?.name || '',
      ngoName: ngo.ngoName || '',
      email: ngo.user?.email || '',
      phone: ngo.phone || '',
      licenseNo: ngo.organizationId || ngo.licenseNo || '',
      address: ngo.address || '',
      avatar: ngo.user?.avatar || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching NGO settings', error: error.message });
  }
};

// -------------------------------------------------------------
// ২. UPDATE Profile Details (Includes Image Upload & Safe Sync)
// -------------------------------------------------------------
exports.updateNgoProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized / Token missing' });

    const { fullName, ngoName, email, phone, licenseNo, address, avatar } = req.body;

    let avatarPath = avatar;

    const uploadedFile = (req.files && req.files.avatar) || req.file;

    if (uploadedFile) {
      const fileName = `${Date.now()}_${(uploadedFile.name || uploadedFile.originalname || 'avatar.jpg').replace(/\s+/g, '_')}`;
      const uploadDir = path.join(__dirname, '../uploads/');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadPath = path.join(uploadDir, fileName);

      if (uploadedFile.mv) {
        await uploadedFile.mv(uploadPath);
      } else if (uploadedFile.path) {
        fs.copyFileSync(uploadedFile.path, uploadPath);
      }

      avatarPath = `http://localhost:5000/uploads/${fileName}`;
    }

    // ১. User মডেল আপডেট (User মডেলে ফিল্ড হলো 'name')
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: fullName,
        email,
        ...(avatarPath && { avatar: avatarPath }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // ২. NGO মডেল আপডেট
    const updatedNgo = await Ngo.findOneAndUpdate(
      { user: userId },
      { 
        ngoName, 
        phone, 
        organizationId: licenseNo, 
        licenseNo, 
        address 
      },
      { new: true, upsert: true }
    ).populate('user', 'name email avatar');

    // ৩. ক্লায়েন্টে আপডেট করা রেসপন্স পাঠানো
    res.status(200).json({
      message: 'NGO profile updated successfully',
      data: {
        fullName: updatedUser.name,
        ngoName: updatedNgo?.ngoName || ngoName,
        email: updatedUser.email,
        phone: updatedNgo?.phone || phone,
        licenseNo: updatedNgo?.organizationId || updatedNgo?.licenseNo || licenseNo,
        address: updatedNgo?.address || address,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Update profile server error:", error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// -------------------------------------------------------------
// ৩. UPDATE Password
// -------------------------------------------------------------
exports.updateNgoPassword = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized / Token missing' });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User account not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect!' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Password updated successfully!' 
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};