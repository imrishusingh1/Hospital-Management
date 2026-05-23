const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const auditLogger = require('../middleware/audit');

const router = express.Router();

router.post('/register', auditLogger('REGISTER', 'User'), register);
router.post('/login', auditLogger('LOGIN', 'User'), login);
router.get('/me', protect, getMe);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
