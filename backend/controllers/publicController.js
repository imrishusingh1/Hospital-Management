const Doctor = require('../models/Doctor');

function pickAvatar(doctor) {
  return doctor.avatar || '';
}

// @desc    Public list of active doctors (homepage)
// @route   GET /api/public/doctors
exports.getPublicDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isAvailable: { $ne: false } })
      .populate({ path: 'userId', select: 'status avatar' })
      .sort({ createdAt: -1 })
      .limit(50);

    const data = doctors
      .filter((d) => d.userId && d.userId.status === 'Active')
      .map((d) => ({
        _id: d._id,
        firstName: d.firstName,
        lastName: d.lastName,
        specialization: d.specialization,
        department: d.department,
        bio: d.bio,
        avatar: pickAvatar(d),
        experienceYears: d.experienceYears,
        consultationFee: d.consultationFee,
        qualifications: d.qualifications,
        availableDays: d.availableDays || [],
        availableTimeSlots: d.availableTimeSlots || [],
        isAvailable: d.isAvailable !== false,
        averageRating: d.averageRating || 0,
        totalReviews: d.totalReviews || 0,
      }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};
