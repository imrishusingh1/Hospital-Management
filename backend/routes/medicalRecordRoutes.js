const express = require('express');
const { createMedicalRecord, getPatientRecords, deleteMedicalRecord } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.use(protect);

router.post('/', authorize('Doctor', 'Admin'), auditLogger('CREATE', 'MedicalRecord'), createMedicalRecord);
router.get('/:patientId', authorize('Doctor', 'Patient', 'Admin'), getPatientRecords);
router.delete('/:id', authorize('Doctor', 'Admin'), auditLogger('DELETE', 'MedicalRecord'), deleteMedicalRecord);

module.exports = router;
