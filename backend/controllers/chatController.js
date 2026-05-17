const Message = require('../models/Message');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const path = require('path');
const fs = require('fs');

// Helper: build canonical conversationId (sorted so order doesn't matter)
const buildConversationId = (id1, id2) =>
  [id1.toString(), id2.toString()].sort().join('_');

// Verify the two parties have a confirmed appointment
const hasConfirmedAppointment = async (patientId, doctorId) => {
  const appt = await Appointment.findOne({
    patientId,
    doctorId,
    status: 'Confirmed',
  });
  return !!appt;
};

// @GET /api/chat/conversations  — list conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const { role } = req.user;

    let appointments;
    if (role === 'Patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.json({ success: true, data: [] });

      appointments = await Appointment.find({
        patientId: patient._id,
        status: 'Confirmed',
      }).populate({ path: 'doctorId', select: 'firstName lastName specialization avatar userId' });

      const seen = new Set();
      const conversations = [];
      for (const appt of appointments) {
        const doc = appt.doctorId;
        if (!doc || seen.has(doc._id.toString())) continue;
        seen.add(doc._id.toString());
        const convId = buildConversationId(patient._id, doc._id);
        const lastMsg = await Message.findOne({ conversationId: convId }).sort({ createdAt: -1 });
        const unread = await Message.countDocuments({
          conversationId: convId,
          senderRole: 'Doctor',
          readAt: null,
        });
        conversations.push({
          conversationId: convId,
          participant: {
            id: doc._id,
            userId: doc.userId,
            name: `Dr. ${doc.firstName} ${doc.lastName}`,
            specialization: doc.specialization,
            avatar: doc.avatar,
            role: 'Doctor',
          },
          lastMessage: lastMsg,
          unreadCount: unread,
        });
      }
      return res.json({ success: true, data: conversations });
    }

    if (role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.json({ success: true, data: [] });

      appointments = await Appointment.find({
        doctorId: doctor._id,
        status: 'Confirmed',
      }).populate({ path: 'patientId', select: 'firstName lastName avatar userId' });

      const seen = new Set();
      const conversations = [];
      for (const appt of appointments) {
        const pat = appt.patientId;
        if (!pat || seen.has(pat._id.toString())) continue;
        seen.add(pat._id.toString());
        const convId = buildConversationId(pat._id, doctor._id);
        const lastMsg = await Message.findOne({ conversationId: convId }).sort({ createdAt: -1 });
        const unread = await Message.countDocuments({
          conversationId: convId,
          senderRole: 'Patient',
          readAt: null,
        });
        conversations.push({
          conversationId: convId,
          participant: {
            id: pat._id,
            userId: pat.userId,
            name: `${pat.firstName} ${pat.lastName}`,
            avatar: pat.avatar,
            role: 'Patient',
          },
          lastMessage: lastMsg,
          unreadCount: unread,
        });
      }
      return res.json({ success: true, data: conversations });
    }

    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/chat/messages/:conversationId
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 50;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text, attachment } = req.body;
    const { role } = req.user;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'conversationId is required' });
    }

    const msgData = {
      conversationId,
      senderId: req.user._id,
      senderRole: role,
    };

    // Only set text if it's a non-empty string
    if (text && typeof text === 'string' && text.trim()) {
      msgData.text = text.trim();
    }

    // Only set attachment if it has a url
    if (attachment && attachment.url) {
      msgData.attachment = attachment;
    }

    if (!msgData.text && !msgData.attachment) {
      return res.status(400).json({ success: false, message: 'Message must have text or attachment' });
    }

    const msg = await Message.create(msgData);

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    console.error("SendMessage Error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @POST /api/chat/upload  — multer handles the file
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const isImage = req.file.mimetype.startsWith('image/');
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}/uploads/chat/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url,
        type: isImage ? 'image' : 'file',
        name: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/chat/mark-read/:conversationId
exports.markRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { role } = req.user;
    const senderRole = role === 'Patient' ? 'Doctor' : 'Patient';

    await Message.updateMany(
      { conversationId, senderRole, readAt: null },
      { readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
