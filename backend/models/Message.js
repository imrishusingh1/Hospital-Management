const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['Patient', 'Doctor'], required: true },
  text: { type: String, maxlength: 2000 },
  attachment: {
    url: { type: String },
    type: { type: String, enum: ['image', 'file'] },
    name: { type: String },
    size: { type: Number }
  },
  readAt: { type: Date, default: null },
}, { timestamps: true });


module.exports = mongoose.model('Message', messageSchema);
