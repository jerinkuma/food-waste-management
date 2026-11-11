const express = require('express');
const router = express.Router();

const {
  getNgoSettings,
  updateNgoProfile,
  updateNgoPassword
} = require('../controllers/ngoSettingsController'); 

const upload = require('../middleware/upload'); 

// অবজেক্ট থেকে protect মিডলওয়্যারটি সঠিকভাবে ডিস্ট্রাকচার করা হলো
const { protect } = require('../middleware/authMiddleware'); 

// রাউটগুলো এখন একদম নিখুঁতভাবে রেজিস্টার হবে
router.get('/settings', protect, getNgoSettings);
router.put('/settings/profile', protect, upload.single('avatar'), updateNgoProfile);
router.put('/settings/password', protect, updateNgoPassword);

console.log("NGO Settings Routes Registered Successfully!");

module.exports = router;