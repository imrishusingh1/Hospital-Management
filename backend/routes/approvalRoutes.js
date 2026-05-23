const express = require('express');
const {
  requestAdminCreation,
  requestDoctorCreation,
  requestAdminReset,
  approveRequest,
  getPendingApprovals,
  approveApprovalRequest,
  rejectApprovalRequest
} = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public: anyone can request, but approval happens via email link
router.post('/admin', requestAdminCreation);
router.post('/doctor', requestDoctorCreation);
router.post('/admin-reset', requestAdminReset);

// Public: clicked from approver email
router.get('/approve/:token', approveRequest);

// Admin dashboard routes
router.get('/pending', protect, authorize('Admin'), getPendingApprovals);
router.post('/:id/approve', protect, authorize('Admin'), approveApprovalRequest);
router.post('/:id/reject', protect, authorize('Admin'), rejectApprovalRequest);

module.exports = router;

