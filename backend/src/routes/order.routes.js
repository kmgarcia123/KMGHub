// src/routes/order.routes.js
const router = require('express').Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
