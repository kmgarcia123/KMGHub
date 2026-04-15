// src/routes/payment.routes.js
const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Webhook de Wompi - confirmar pago
router.post('/webhook/wompi', async (req, res) => {
  try {
    const { event, data, signature } = req.body;

    // Verificar firma del webhook
    const expectedSig = crypto
      .createHmac('sha256', process.env.WOMPI_EVENTS_SECRET || '')
      .update(JSON.stringify(req.body))
      .digest('hex');

    // En producción verifica: if (signature !== expectedSig) return res.status(401).end();

    if (event === 'transaction.updated') {
      const { transaction } = data;
      const orderId = transaction.reference; // referencia = orderId

      if (transaction.status === 'APPROVED') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { orderId },
            data: {
              status: 'PAID',
              transactionId: transaction.id,
              gatewayResponse: transaction,
              paidAt: new Date(),
            },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
          }),
        ]);
      } else if (transaction.status === 'DECLINED') {
        await prisma.payment.update({
          where: { orderId },
          data: { status: 'FAILED', gatewayResponse: transaction },
        });
      }
    }

    res.status(200).end();
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).end();
  }
});

// POST /api/payments/initiate - Iniciar pago con Wompi
router.post('/initiate', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    // Generar enlace de pago Wompi
    // En producción integras el SDK de Wompi aquí
    const paymentData = {
      publicKey: process.env.WOMPI_PUBLIC_KEY,
      currency: 'COP',
      amountInCents: Math.round(order.total * 100),
      reference: order.id,
      redirectUrl: `${process.env.FRONTEND_URL}/orders/${order.id}`,
    };

    res.json({ paymentData, orderNumber: order.orderNumber });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar pago' });
  }
});

module.exports = router;
