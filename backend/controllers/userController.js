const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let queryStr = {};
    if (req.query.search) {
      queryStr.email = { $regex: req.query.search, $options: 'i' };
    }

    const total = await User.countDocuments(queryStr);
    const users = await User.find(queryStr).select('-password').skip(startIndex).limit(limit);

    res.status(200).json({ 
      success: true, 
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users 
    });
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
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        let queryStr = {};
        if (req.query.search) {
            queryStr = {
                $or: [
                    { firstName: { $regex: req.query.search, $options: 'i' } },
                    { lastName: { $regex: req.query.search, $options: 'i' } },
                    { specialization: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }

        const total = await Doctor.countDocuments(queryStr);
        const doctors = await Doctor.find(queryStr).populate('userId', 'email status avatar').skip(startIndex).limit(limit);

        res.status(200).json({ 
            success: true, 
            count: doctors.length,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            data: doctors 
        });
    } catch(error) {
        next(error);
    }
}

// @desc    Get all patients (Admin/Doctor)
// @route   GET /api/users/patients
// @access  Private
exports.getPatients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        let queryStr = {};
        if (req.query.search) {
            queryStr = {
                $or: [
                    { firstName: { $regex: req.query.search, $options: 'i' } },
                    { lastName: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }

        const total = await Patient.countDocuments(queryStr);
        const patients = await Patient.find(queryStr).populate('userId', 'email status avatar').skip(startIndex).limit(limit);

        res.status(200).json({ 
            success: true, 
            count: patients.length,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            data: patients 
        });
    } catch(error) {
        next(error);
    }
}

// @desc    Update Doctor Profile
// @route   PUT /api/users/doctors/profile
// @access  Private/Doctor
exports.updateDoctorProfile = async (req, res, next) => {
    try {
        const profile = await Doctor.findOneAndUpdate(
            { userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Patient Profile
// @route   PUT /api/users/patients/profile
// @access  Private/Patient
exports.updatePatientProfile = async (req, res, next) => {
    try {
        const profile = await Patient.findOneAndUpdate(
            { userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        
        // Also update User avatar if provided
        if (req.body.avatar) {
            await User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar });
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'Doctor') await Doctor.findOneAndDelete({ userId: user._id });
        if (user.role === 'Patient') await Patient.findOneAndDelete({ userId: user._id });

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};
