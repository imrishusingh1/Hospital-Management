const express = require('express');
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  addPrescription,
  getPrescription,
  cancelAppointment,
  rescheduleAppointment,
  getAvailableSlots
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.use(protect);

router.get('/slots', getAvailableSlots);
router.post('/', authorize('Patient', 'Admin'), auditLogger('CREATE', 'Appointment'), createAppointment);
router.get('/', getAppointments);
router.put('/:id/status', authorize('Doctor', 'Admin'), auditLogger('UPDATE_STATUS', 'Appointment'), updateAppointmentStatus);
router.delete('/:id', auditLogger('CANCEL', 'Appointment'), cancelAppointment);
router.put('/:id/reschedule', auditLogger('RESCHEDULE', 'Appointment'), rescheduleAppointment);

router.post('/:id/prescription', authorize('Doctor'), auditLogger('CREATE', 'Prescription'), addPrescription);
router.get('/:id/prescription', getPrescription);

module.exports = router;
