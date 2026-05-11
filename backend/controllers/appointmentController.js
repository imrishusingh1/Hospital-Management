const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient/Admin)
exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, reason, notes } = req.body;
    
    // Additional validation can be added here (e.g. check if slot is available)

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      timeSlot,
      reason,
      notes
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'Admin') {
      query = Appointment.find();
    } else if (req.user.role === 'Patient') {
      // Need to find patient profile first, or require frontend to send patient ID
      // Assuming frontend sends the specific profile ID as a query param or we look it up
      // For simplicity, let's require patientId in query for patient, doctorId for doctor
      if(req.query.patientId) {
          query = Appointment.find({ patientId: req.query.patientId });
      } else {
          return res.status(400).json({message: "patientId query required"});
      }
    } else if (req.user.role === 'Doctor') {
      if(req.query.doctorId) {
          query = Appointment.find({ doctorId: req.query.doctorId });
      } else {
          return res.status(400).json({message: "doctorId query required"});
      }
    }

    const appointments = await query.populate('patientId').populate('doctorId');
    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor/Admin)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Add prescription
// @route   POST /api/appointments/:id/prescription
// @access  Private (Doctor)
exports.addPrescription = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const { medications, instructions } = req.body;

    const prescription = await Prescription.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      medications,
      instructions
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription for an appointment
// @route   GET /api/appointments/:id/prescription
// @access  Private
exports.getPrescription = async (req, res, next) => {
    try {
        const prescription = await Prescription.findOne({ appointmentId: req.params.id });
        res.status(200).json({ success: true, data: prescription });
    } catch (error) {
        next(error);
    }
}
