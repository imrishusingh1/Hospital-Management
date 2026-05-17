const express = require('express');
const router = express.Router();
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getServices)
  .post(protect, authorize('Admin'), createService);

router.route('/:id')
  .put(protect, authorize('Admin'), updateService)
  .delete(protect, authorize('Admin'), deleteService);

module.exports = router;
