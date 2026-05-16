const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  recordType: { 
    type: String, 
    enum: ['Lab Result', 'Diagnosis', 'Scan', 'Prescription', 'Other'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true }, // Path or URL to the uploaded file
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
