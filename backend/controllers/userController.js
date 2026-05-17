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
        const allowed = [
            'firstName', 'lastName', 'specialization', 'department', 'bio', 'avatar',
            'experienceYears', 'consultationFee', 'contactNumber', 'qualifications',
            'isAvailable', 'availableDays', 'availableTimeSlots',
        ];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const profile = await Doctor.findOneAndUpdate(
            { userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );
        if (!profile) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        if (updates.avatar) {
            await User.findByIdAndUpdate(req.user._id, { avatar: updates.avatar });
        }
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

// @desc    Get user + role profile (Admin)
// @route   GET /api/users/:id/profile
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        let profile = null;
        if (user.role === 'Doctor') {
            profile = await Doctor.findOne({ userId: user._id });
        } else if (user.role === 'Patient') {
            profile = await Patient.findOne({ userId: user._id });
        }

        res.status(200).json({ success: true, data: { user, profile } });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user + role profile (Admin)
// @route   PUT /api/users/:id/profile
exports.updateUserProfileAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { email, status, avatar, profile } = req.body;
        if (email) user.email = email;
        if (status) user.status = status;
        if (avatar !== undefined) user.avatar = avatar;
        await user.save();

        let updatedProfile = null;
        if (user.role === 'Doctor' && profile) {
            updatedProfile = await Doctor.findOneAndUpdate(
                { userId: user._id },
                profile,
                { new: true, runValidators: true }
            );
        } else if (user.role === 'Patient' && profile) {
            updatedProfile = await Patient.findOneAndUpdate(
                { userId: user._id },
                profile,
                { new: true, runValidators: true }
            );
        }

        const freshUser = await User.findById(user._id).select('-password');
        res.status(200).json({ success: true, data: { user: freshUser, profile: updatedProfile } });
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
