// src/routes/user.routes.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.use(authenticate);

// GET /api/users/addresses
router.get('/addresses', async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
  res.json(addresses);
});

// POST /api/users/addresses
router.post('/addresses', async (req, res) => {
  try {
    const address = await prisma.address.create({
      data: { ...req.body, userId: req.user.id },
    });
    res.status(201).json(address);
  } catch (e) { res.status(500).json({ error: 'Error al crear dirección' }); }
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', async (req, res) => {
  await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ message: 'Dirección eliminada' });
});

module.exports = router;
