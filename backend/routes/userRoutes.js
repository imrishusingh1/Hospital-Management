const express = require('express');
const {
  getUsers,
  updateUserStatus,
  getDoctors,
  getPatients,
  updateDoctorProfile,
  updatePatientProfile,
  getUserProfile,
  updateUserProfileAdmin,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin'), getUsers);
router.put('/:id/status', authorize('Admin'), auditLogger('UPDATE_STATUS', 'User'), updateUserStatus);
router.get('/doctors', getDoctors);
router.put('/doctors/profile', authorize('Doctor'), auditLogger('UPDATE_PROFILE', 'User'), updateDoctorProfile);
router.get('/patients', authorize('Admin', 'Doctor'), getPatients);
router.put('/patients/profile', authorize('Patient'), auditLogger('UPDATE_PROFILE', 'User'), updatePatientProfile);
router.get('/:id/profile', authorize('Admin'), getUserProfile);
router.put('/:id/profile', authorize('Admin'), auditLogger('UPDATE_PROFILE', 'User'), updateUserProfileAdmin);
router.delete('/:id', authorize('Admin'), auditLogger('DELETE', 'User'), deleteUser);

module.exports = router;
