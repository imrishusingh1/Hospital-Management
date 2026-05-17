const express = require('express');
const {
  createMedicalRecord,
  createPatientRecord,
  getPatientRecords,
  deleteMedicalRecord,
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.use(protect);

router.post(
  '/my-upload',
  authorize('Patient'),
  uploadDocument,
  auditLogger('CREATE', 'MedicalRecord'),
  createPatientRecord
);
router.post(
  '/',
  authorize('Doctor', 'Admin'),
  uploadDocument,
  auditLogger('CREATE', 'MedicalRecord'),
  createMedicalRecord
);
router.get('/:patientId', authorize('Doctor', 'Patient', 'Admin'), getPatientRecords);
router.delete('/:id', authorize('Doctor', 'Admin'), auditLogger('DELETE', 'MedicalRecord'), deleteMedicalRecord);

module.exports = router;
