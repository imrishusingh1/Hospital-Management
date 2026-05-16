const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  contactNumber: { type: String, required: true },
  address: { type: String },
  avatar: { type: String },
  bloodGroup: { type: String },
  allergies: { type: [String], default: [] },
  emergencyContact: {
    name: String,
    relation: String,
    number: String
  },
  insuranceDetails: {
    provider: String,
    policyNumber: String
  },
  medicalHistory: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
