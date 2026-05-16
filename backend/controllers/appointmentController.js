const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Patient/Admin)
exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, reason, notes, type } = req.body;
    
    // Check if slot is available
    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'Cancelled' } });
    if (existing) {
        return res.status(400).json({ message: 'Time slot is already booked for this doctor.' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      timeSlot,
      reason,
      notes,
      type
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

// @desc    Cancel an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
    try {
        const { cancelReason } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        
        appointment.status = 'Cancelled';
        appointment.cancelReason = cancelReason || 'Cancelled by user';
        await appointment.save();

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
};

// @desc    Reschedule an appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res, next) => {
    try {
        const { date, timeSlot } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        // Check availability
        const existing = await Appointment.findOne({ doctorId: appointment.doctorId, date, timeSlot, status: { $ne: 'Cancelled' } });
        if (existing) {
            return res.status(400).json({ message: 'Time slot is already booked.' });
        }

        appointment.date = date;
        appointment.timeSlot = timeSlot;
        appointment.status = 'Pending';
        await appointment.save();

        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
};

// @desc    Get available slots for a doctor
// @route   GET /api/appointments/slots
// @access  Private
exports.getAvailableSlots = async (req, res, next) => {
    try {
        const { doctorId, date } = req.query;
        if (!doctorId || !date) return res.status(400).json({ message: 'Doctor ID and date required' });

        const Doctor = require('../models/Doctor');
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const appointments = await Appointment.find({ doctorId, date, status: { $ne: 'Cancelled' } });
        const bookedSlots = appointments.map(a => a.timeSlot);

        // Assume availableTimeSlots is an array on Doctor model
        const availableSlots = (doctor.availableTimeSlots || ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']).filter(slot => !bookedSlots.includes(slot));

        res.status(200).json({ success: true, data: availableSlots });
    } catch (error) {
        next(error);
    }
};
