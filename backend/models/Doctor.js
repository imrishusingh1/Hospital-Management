const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialization: { type: String, required: true },
  department: { type: String },
  bio: { type: String },
  avatar: { type: String },
  qualifications: { type: [String], required: true },
  experienceYears: { type: Number, required: true },
  contactNumber: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  availableDays: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  availableTimeSlots: { type: [String], default: ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'] },
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
