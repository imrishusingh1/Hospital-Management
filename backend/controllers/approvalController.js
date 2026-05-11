const crypto = require('crypto');
const ApprovalRequest = require('../models/ApprovalRequest');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { sendApprovalEmail } = require('../utils/email');

const APPROVER_EMAIL = 'rishukrsingh99p@gmail.com';

function includeApprovalLinkInResponse() {
  return process.env.NODE_ENV !== 'production';
}

function approvalExtras(emailSent, link) {
  if (emailSent || !includeApprovalLinkInResponse()) return {};
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

async function ensureNoActiveAdmin() {
  const existing = await User.findOne({ role: 'Admin', status: 'Active' });
  return !existing;
}

// POST /api/approvals/admin
exports.requestAdminCreation = async (req, res, next) => {
  try {
    const canCreate = await ensureNoActiveAdmin();
    if (!canCreate) {
      return res.status(409).json({
        success: false,
        message: 'An active Admin already exists. Request an admin reset to replace it.',
      });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const alreadyUsedEmail = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (alreadyUsedEmail) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const token = createToken();
    const approval = await ApprovalRequest.create({
      role: 'Admin',
      token,
      expiresAt: expiresInHours(24),
      notifyEmail: APPROVER_EMAIL,
      payload: { email, password },
      requestedBy: req.user?._id || null,
    });

    const { link, emailSent } = await sendApprovalEmail({
      to: APPROVER_EMAIL,
      subject: 'Approve Admin creation',
      token: approval.token,
      intro: `Approve creating a new Admin account for: ${email}`,
    });

    return res.status(202).json({
      success: true,
      message: 'Admin creation request submitted for approval.',
      emailSent,
      ...approvalExtras(emailSent, link),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/approvals/doctor
exports.requestDoctorCreation = async (req, res, next) => {
  try {
    const { email, password, ...profileData } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const alreadyUsedEmail = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (alreadyUsedEmail) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const token = createToken();
    const approval = await ApprovalRequest.create({
      role: 'Doctor',
      token,
      expiresAt: expiresInHours(24),
      notifyEmail: APPROVER_EMAIL,
      payload: { email, password, profileData },
      requestedBy: req.user?._id || null,
    });

    const { link, emailSent } = await sendApprovalEmail({
      to: APPROVER_EMAIL,
      subject: 'Approve Doctor creation',
      token: approval.token,
      intro: `Approve creating a new Doctor account for: ${email}`,
    });

    return res.status(202).json({
      success: true,
      message: 'Doctor creation request submitted for approval.',
      emailSent,
      ...approvalExtras(emailSent, link),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/approvals/admin-reset
exports.requestAdminReset = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const token = createToken();
    const approval = await ApprovalRequest.create({
      role: 'AdminReset',
      token,
      expiresAt: expiresInHours(24),
      notifyEmail: APPROVER_EMAIL,
      payload: { email, password },
      requestedBy: req.user?._id || null,
    });

    const { link, emailSent } = await sendApprovalEmail({
      to: APPROVER_EMAIL,
      subject: 'Approve Admin reset',
      token: approval.token,
      intro: `Approve resetting Admin. This will deactivate existing Admins and create a new Admin: ${email}`,
    });

    return res.status(202).json({
      success: true,
      message: 'Admin reset request submitted for approval.',
      emailSent,
      ...approvalExtras(emailSent, link),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/approvals/approve/:token
exports.approveRequest = async (req, res, next) => {
  try {
    const { token } = req.params;

    const approval = await ApprovalRequest.findOne({ token });
    if (!approval) return res.status(404).send('Approval request not found.');

    if (approval.status !== 'Pending') {
      return res.status(400).send(`This request is already ${approval.status}.`);
    }

    if (approval.expiresAt < new Date()) {
      approval.status = 'Expired';
      await approval.save();
      return res.status(400).send('This approval link has expired.');
    }

    if (approval.role === 'Admin') {
      const canCreate = await ensureNoActiveAdmin();
      if (!canCreate) return res.status(409).send('An active Admin already exists. Use Admin Reset.');

      const { email, password } = approval.payload || {};
      if (!email || !password) return res.status(400).send('Approval payload missing email/password.');

      const user = await User.create({ email, password, role: 'Admin', status: 'Active' });
      approval.status = 'Approved';
      await approval.save();
      return res.status(200).send(`Approved. Admin created: ${user.email}`);
    }

    if (approval.role === 'Doctor') {
      const { email, password, profileData } = approval.payload || {};
      if (!email || !password) return res.status(400).send('Approval payload missing email/password.');

      const doctorUser = await User.create({ email, password, role: 'Doctor', status: 'Active' });
      await Doctor.create({ userId: doctorUser._id, ...(profileData || {}) });

      approval.status = 'Approved';
      await approval.save();
      return res.status(200).send(`Approved. Doctor created: ${doctorUser.email}`);
    }

    if (approval.role === 'AdminReset') {
      const { email, password } = approval.payload || {};
      if (!email || !password) return res.status(400).send('Approval payload missing email/password.');

      await User.updateMany({ role: 'Admin', status: 'Active' }, { $set: { status: 'Inactive' } });

      // Also optionally deactivate any stray admin profiles (none exist currently)
      // Keep patients/doctors intact

      const user = await User.create({ email, password, role: 'Admin', status: 'Active' });
      approval.status = 'Approved';
      await approval.save();
      return res.status(200).send(`Approved. Admin reset completed. New Admin: ${user.email}`);
    }

    return res.status(400).send('Unknown approval type.');
  } catch (error) {
    next(error);
  }
};

