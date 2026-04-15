// src/controllers/order.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `MH-${year}-${random}`;
};

// POST /api/orders - Crear orden desde carrito
const createOrder = async (req, res) => {
  try {
    const { addressId, notes, paymentMethod = 'WOMPI' } = req.body;

    // Obtener carrito con items
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Verificar stock de todos los productos
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${item.product.name}`,
        });
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shippingCost = subtotal >= 100000 ? 0 : 8000; // Envío gratis +100k
    const tax = 0; // IVA ya incluido en Colombia
    const total = subtotal + shippingCost - tax;

    // Crear orden en transacción
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user.id,
          addressId,
          subtotal, shippingCost, tax, total,
          notes,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              productName: item.product.name,
              productImg: item.product.images[0]?.url || null,
              quantity: item.quantity,
              unitPrice: item.product.price,
              total: item.product.price * item.quantity,
            })),
          },
          payment: {
            create: {
              method: paymentMethod,
              amount: total,
              currency: 'COP',
            },
          },
        },
        include: { items: true, payment: true, address: true },
      });

      // Reducir stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Limpiar carrito
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear orden' });
  }
};

// GET /api/orders - Mis órdenes
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payment: { select: { status: true, method: true } },
        },
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
    ]);

    res.json({ orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true, payment: true, address: true },
    });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener orden' });
  }
};

// PATCH /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, ...(trackingNumber && { trackingNumber }) },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };
