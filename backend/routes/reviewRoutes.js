const express = require('express');
const router = express.Router();
const {
  createReview,
  getDoctorReviews,
  getPublicReviews,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('Patient'), createReview);
router.get('/public', getPublicReviews);
router.get('/doctor/:doctorId', getDoctorReviews);

module.exports = router;
