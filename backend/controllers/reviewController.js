const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Create a review for a doctor
// @route   POST /api/reviews
// @access  Private (Patient only)
exports.createReview = async (req, res, next) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    // Verify patient profile exists for the user
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Verify the appointment belongs to the patient and is completed
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this appointment' });
    }

    if (appointment.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only review completed appointments' });
    }

    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this appointment' });
    }

    // Create the review
    const review = await Review.create({
      patientId: patient._id,
      doctorId,
      appointmentId,
      rating: Number(rating),
      comment,
    });

    // Update doctor's average rating and total reviews
    const reviews = await Review.find({ doctorId, status: 'approved' });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews
      : 0;

    await Doctor.findByIdAndUpdate(doctorId, {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this appointment' });
    }
    next(error);
  }
};

// @desc    Get reviews for a specific doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
exports.getDoctorReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ 
      doctorId: req.params.doctorId, 
      status: 'approved' 
    })
    .populate('patientId', 'firstName lastName avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public featured reviews for landing page
// @route   GET /api/reviews/public
// @access  Public
exports.getPublicReviews = async (req, res, next) => {
  try {
    // Get 5-star reviews
    const reviews = await Review.find({ status: 'approved', rating: 5 })
      .populate('patientId', 'firstName lastName avatar')
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};
