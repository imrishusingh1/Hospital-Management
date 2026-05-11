const express = require('express');
const {
  requestAdminCreation,
  requestDoctorCreation,
  requestAdminReset,
  approveRequest,
} = require('../controllers/approvalController');

const router = express.Router();

// Public: anyone can request, but approval happens via email link
router.post('/admin', requestAdminCreation);
router.post('/doctor', requestDoctorCreation);
router.post('/admin-reset', requestAdminReset);

// Public: clicked from approver email
router.get('/approve/:token', approveRequest);

module.exports = router;

