const express = require('express');
const { getUsers, updateUserStatus, getDoctors, getPatients } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin'), getUsers);
router.put('/:id/status', authorize('Admin'), auditLogger('UPDATE_STATUS', 'User'), updateUserStatus);
router.get('/doctors', getDoctors);
router.get('/patients', authorize('Admin', 'Doctor'), getPatients);

module.exports = router;
