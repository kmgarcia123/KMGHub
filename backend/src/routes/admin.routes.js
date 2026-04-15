// src/routes/admin.routes.js
const router = require('express').Router();
const { createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { updateOrderStatus } = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(authenticate, authorize('ADMIN'));

// Productos
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Órdenes
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: true, payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);
    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalProducts,
      totalUsers,
    });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

module.exports = router;
