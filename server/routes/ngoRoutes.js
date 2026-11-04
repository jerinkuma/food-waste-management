const express = require('express');
const router = express.Router();

// কন্ট্রোলার থেকে সঠিক ফাংশনগুলো রিকোয়ার করা হচ্ছে
const { 
  getNgoProfile, 
  getNgoStats, 
  getNgoCompletedDonations, 
  submitDistributionProof 
} = require('../controllers/ngoController');

// রাউটগুলো রেজিস্টার করা
router.get('/profile', getNgoProfile);
router.get('/stats', getNgoStats);
router.get('/completed-donations', getNgoCompletedDonations); // কমপ্লিটেড ডোনেশন ফেচ করার রাউট
router.post('/submit-distribution', submitDistributionProof);

module.exports = router;