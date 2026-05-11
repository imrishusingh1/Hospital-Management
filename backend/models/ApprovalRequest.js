const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['Admin', 'Doctor', 'AdminReset'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Expired'],
      default: 'Pending',
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    notifyEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);

