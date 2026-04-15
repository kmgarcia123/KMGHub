// src/controllers/cart.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    res.json({ ...cart, subtotal });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variantId } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) return res.status(404).json({ error: 'Producto no disponible' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Stock insuficiente' });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId: variantId || null } },
    });

    let item;
    if (existingItem) {
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, variantId: variantId || null },
      });
    }

    res.json({ message: 'Producto agregado al carrito', item });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ message: 'Item eliminado' });
    }

    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar carrito' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    res.json({ message: 'Item eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar item' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Carrito vaciado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al vaciar carrito' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
