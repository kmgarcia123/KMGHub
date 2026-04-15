// src/routes/category.routes.js
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: true, _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

module.exports = router;

// ─────────────────────────────────────────────────────────────────────────────

// src/routes/payment.routes.js - Webhook Wompi
