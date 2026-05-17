const express = require('express');
const router = express.Router();
const { getFAQs, getAllFAQs, createFAQ, updateFAQ, deleteFAQ } = require('../controllers/faqController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getFAQs);                                       // Public - active FAQs
router.get('/all', protect, authorize('Admin'), getAllFAQs);    // Admin - all FAQs
router.post('/', protect, authorize('Admin'), createFAQ);
router.put('/:id', protect, authorize('Admin'), updateFAQ);
router.delete('/:id', protect, authorize('Admin'), deleteFAQ);

module.exports = router;
