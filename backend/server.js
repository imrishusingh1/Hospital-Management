require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const connectDB = require('./config/db');
const path = require('path');
const jwt = require('jsonwebtoken');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.io auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Track userId → socketId map for direct calls
const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.user?.id || socket.user?._id;
  if (userId) userSocketMap[userId] = socket.id;

  // --- CHAT EVENTS ---
  socket.on('join-room', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('send-message', (message) => {
    // Broadcast to everyone else in the room
    socket.to(message.conversationId).emit('new-message', message);
  });

  socket.on('typing', ({ conversationId }) => {
    socket.to(conversationId).emit('typing', { senderId: userId });
  });

  socket.on('stop-typing', ({ conversationId }) => {
    socket.to(conversationId).emit('stop-typing', { senderId: userId });
  });

  socket.on('message-read', ({ conversationId }) => {
    socket.to(conversationId).emit('messages-read', { conversationId });
  });

  // --- VIDEO CALL SIGNALING EVENTS ---
  socket.on('call:initiate', ({ targetUserId, callerName, conversationId }) => {
    const targetSocketId = userSocketMap[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:incoming', {
        from: userId,
        callerName,
        conversationId,
      });
    }
  });

  socket.on('call:offer', ({ targetUserId, offer }) => {
    const targetSocketId = userSocketMap[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:offer', { from: userId, offer });
    }
  });

  socket.on('call:answer', ({ targetUserId, answer }) => {
    const targetSocketId = userSocketMap[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:answer', { from: userId, answer });
    }
  });

  socket.on('call:ice-candidate', ({ targetUserId, candidate }) => {
    const targetSocketId = userSocketMap[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:ice-candidate', { from: userId, candidate });
    }
  });

  socket.on('call:end', ({ targetUserId }) => {
    const targetSocketId = userSocketMap[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:end');
    }
  });

  socket.on('call:reject', ({ targetUserId }) => {
    const targetSocketId = userSocketMap[targetUserId];
    if (targetSocketId) {
      io.to(targetSocketId).emit('call:rejected');
    }
  });

  socket.on('disconnect', () => {
    if (userId) delete userSocketMap[userId];
  });
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('dev'));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/records', require('./routes/medicalRecordRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/faqs', require('./routes/faqRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Healthcare Workflow System API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
