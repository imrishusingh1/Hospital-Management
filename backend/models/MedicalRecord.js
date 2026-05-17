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
    default: null,
  },
  uploadedBy: {
    type: String,
    enum: ['Doctor', 'Patient'],
    default: 'Doctor',
  },
  recordType: { 
    type: String, 
    enum: ['Lab Result', 'Diagnosis', 'Scan', 'Prescription', 'Other'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String }, // Path or URL to the uploaded file
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
