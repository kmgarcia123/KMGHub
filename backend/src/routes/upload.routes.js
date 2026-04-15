// src/routes/upload.routes.js
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
});

// POST /api/upload/image
router.post('/image', authenticate, authorize('ADMIN', 'SELLER'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });

  const url = `${process.env.API_URL}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// POST /api/upload/images (múltiples)
router.post('/images', authenticate, authorize('ADMIN', 'SELLER'), upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No se subieron imágenes' });

  const urls = req.files.map(f => ({
    url: `${process.env.API_URL}/uploads/${f.filename}`,
    filename: f.filename,
  }));
  res.json({ urls });
});

module.exports = router;
