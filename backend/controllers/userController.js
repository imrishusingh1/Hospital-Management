const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Private
exports.getDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find().populate('userId', 'email status');
        res.status(200).json({ success: true, data: doctors });
    } catch(error) {
        next(error);
    }
}

// @desc    Get all patients (Admin/Doctor)
// @route   GET /api/users/patients
// @access  Private
exports.getPatients = async (req, res, next) => {
    try {
        const patients = await Patient.find().populate('userId', 'email status');
        res.status(200).json({ success: true, data: patients });
    } catch(error) {
        next(error);
    }
}
