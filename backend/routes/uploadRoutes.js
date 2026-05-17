const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadAvatar, uploadDocument } = require('../middleware/upload');
const { uploadAvatar: uploadAvatarHandler, uploadDocument: uploadDocumentHandler } = require('../controllers/uploadController');

const router = express.Router();

router.use(protect);

router.post('/avatar', uploadAvatar, uploadAvatarHandler);
router.post('/document', uploadDocument, uploadDocumentHandler);

module.exports = router;
