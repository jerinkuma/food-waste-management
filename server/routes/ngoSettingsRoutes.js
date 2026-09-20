const express = require('express');
const router = express.Router();
const ngoSettingsController = require('../controllers/ngoSettingsController');

// সবকটি রাউট সরাসরি কন্ট্রোলারে চলে যাবে
router.get('/settings', ngoSettingsController.getNgoSettings);
router.put('/settings/profile', ngoSettingsController.updateNgoProfile);
router.put('/settings/password', ngoSettingsController.updateNgoPassword);

module.exports = router;