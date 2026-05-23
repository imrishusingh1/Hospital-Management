const Doctor = require('../models/Doctor');
const Subscriber = require('../models/Subscriber');

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

// @desc    Subscribe to newsletter
// @route   POST /api/public/subscribe
exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already subscribed!' });
    }

    await Subscriber.create({ email });
    res.status(201).json({ success: true, message: 'Successfully subscribed to the newsletter!' });
  } catch (error) {
    next(error);
  }
};
