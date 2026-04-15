// src/routes/product.routes.js
const router = require('express').Router();
const { getProducts, getProductBySlug } = require('../controllers/product.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

router.get('/', optionalAuth, getProducts);
router.get('/:slug', optionalAuth, getProductBySlug);

module.exports = router;
