// @desc    Upload profile avatar image
// @route   POST /api/uploads/avatar
exports.uploadAvatar = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }
  const url = `/uploads/avatars/${req.file.filename}`;
  res.status(200).json({ success: true, url });
};

// @desc    Upload PDF document (test report, etc.)
// @route   POST /api/uploads/document
exports.uploadDocument = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
  }
  const url = `/uploads/documents/${req.file.filename}`;
  res.status(200).json({ success: true, url });
};
