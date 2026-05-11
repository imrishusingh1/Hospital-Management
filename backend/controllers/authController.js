const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const ApprovalRequest = require('../models/ApprovalRequest');
const crypto = require('crypto');
const { sendApprovalEmail } = require('../utils/email');

const APPROVER_EMAIL = 'rishukrsingh99p@gmail.com';

function approvalExtras(emailSent, link) {
  if (emailSent || process.env.NODE_ENV === 'production') return {};
  return {
    approvalLink: link,
    devNote:
      'Email not sent (SMTP_USER/SMTP_PASS missing). Open approvalLink in a browser to approve, or add Gmail SMTP to backend/.env.',
  };
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function expiresInHours(hours = 24) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, ...profileData } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Admin and Doctor require approval
    if (role === 'Admin' || role === 'Doctor') {
      if (!email || !password) {
        return res.status(400).json({ message: 'email and password are required' });
      }

      if (role === 'Admin') {
        const existingAdmin = await User.findOne({ role: 'Admin', status: 'Active' });
        if (existingAdmin) {
          return res.status(409).json({
            message: 'An active Admin already exists. Request an admin reset to replace it.',
          });
        }
      }

      const token = createToken();
      const approval = await ApprovalRequest.create({
        role,
        token,
        expiresAt: expiresInHours(24),
        notifyEmail: APPROVER_EMAIL,
        payload: { email, password, profileData },
        requestedBy: null,
      });

      const { link, emailSent } = await sendApprovalEmail({
        to: APPROVER_EMAIL,
        subject: `Approve ${role} creation`,
        token: approval.token,
        intro: `Approve creating a new ${role} account for: ${email}`,
      });

      return res.status(202).json({
        success: true,
        message: `${role} creation request submitted for approval.`,
        emailSent,
        ...approvalExtras(emailSent, link),
      });
    }

    // Create user
    user = await User.create({
      email,
      password,
      role
    });

    // Create corresponding profile based on role
    if (role === 'Patient') {
      await Patient.create({ userId: user._id, ...profileData });
    } else if (role === 'Doctor') {
      await Doctor.create({ userId: user._id, ...profileData });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'Inactive') {
        return res.status(401).json({ message: 'Account is inactive. Please contact admin.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'Patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'Doctor') {
      profile = await Doctor.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};
