const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  uploadAttachment,
  markRead,
} = require('../controllers/chatController');
const { getIceServers } = require('../controllers/iceController');


// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/chat');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|xlsx|csv/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.get('/ice-servers', protect, getIceServers);
router.post('/send', protect, sendMessage);
router.post('/upload', protect, upload.single('file'), uploadAttachment);
router.post('/mark-read/:conversationId', protect, markRead);

module.exports = router;

