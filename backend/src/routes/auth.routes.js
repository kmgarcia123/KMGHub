// src/routes/auth.routes.js
const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, refreshToken, logout, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

module.exports = router;
