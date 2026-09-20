const Ngo = require('../models/Ngo');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

// টোকেন থেকে User ID বের করার হেলপার ফাংশন
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

    const ngo = await Ngo.findOne({ user: userId }).populate('user', 'fullName email avatar');
    if (!ngo) return res.status(404).json({ message: 'NGO profile not found' });

    res.status(200).json({
      fullName: ngo.user?.fullName || '',
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
// ২. UPDATE Profile Details (Includes File Upload)
// -------------------------------------------------------------
exports.updateNgoProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized / Token missing' });

    const { fullName, ngoName, email, phone, licenseNo, address, avatar } = req.body;

    let avatarPath = avatar;
    if (req.files && req.files.avatar) {
      const file = req.files.avatar;
      const fileName = `${Date.now()}_${file.name}`;
      const uploadPath = path.join(__dirname, '../uploads/', fileName);
      await file.mv(uploadPath);
      avatarPath = `http://localhost:5000/uploads/${fileName}`;
    }

    await User.findByIdAndUpdate(userId, {
      fullName,
      email,
      ...(avatarPath && { avatar: avatarPath }),
    });

    const updatedNgo = await Ngo.findOneAndUpdate(
      { user: userId },
      { ngoName, phone, organizationId: licenseNo, licenseNo, address },
      { new: true }
    ).populate('user', 'fullName email avatar');

    res.status(200).json({
      message: 'NGO profile updated successfully',
      data: {
        fullName: updatedNgo.user?.fullName,
        ngoName: updatedNgo.ngoName,
        email: updatedNgo.user?.email,
        phone: updatedNgo.phone,
        licenseNo: updatedNgo.organizationId || updatedNgo.licenseNo,
        address: updatedNgo.address,
        avatar: updatedNgo.user?.avatar,
      },
    });
  } catch (error) {
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
    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password does not match!' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};