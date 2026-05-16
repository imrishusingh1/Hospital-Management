const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, enum: ['In-Person', 'Video', 'Phone'], default: 'In-Person' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  reason: { type: String, required: true },
  notes: { type: String },
  cancelReason: { type: String },
  attachments: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
