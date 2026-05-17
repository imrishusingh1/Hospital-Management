const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadRoot = path.join(__dirname, '../uploads');
['avatars', 'documents'].forEach((sub) => {
  const dir = path.join(uploadRoot, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(uploadRoot, subfolder)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '';
      const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, safe);
    },
  });
}

const imageFilter = (_req, file, cb) => {
  if (/^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
};

const pdfFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'));
};

exports.uploadAvatar = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('avatar');

exports.uploadDocument = multer({
  storage: makeStorage('documents'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: pdfFilter,
}).single('file');
