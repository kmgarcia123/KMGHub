// src/controllers/product.controller.js
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// GET /api/products - Listar con filtros, búsqueda y paginación
const getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, category,
      minPrice, maxPrice, sort = 'createdAt', order = 'desc',
      featured,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(minPrice || maxPrice ? {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      } : {}),
      ...(featured === 'true' && { isFeatured: true }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: order },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        variants: true,
        seller: { select: { storeName: true, storeSlug: true, logo: true } },
        reviews: {
          include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    // Rating promedio
    const avgRating = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });

    res.json({ ...product, avgRating: avgRating._avg.rating || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

// POST /api/admin/products - Crear producto (Admin/Seller)
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      name, description, shortDesc, price, comparePrice,
      cost, sku, stock, categoryId, tags, images,
      variants, isFeatured, weight,
    } = req.body;

    // Generar slug único
    let slug = name.toLowerCase()
      .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
      .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');

    // Asegurar slug único
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name, description, shortDesc, price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        cost: cost ? parseFloat(cost) : null,
        sku, stock: parseInt(stock) || 0,
        categoryId, tags: tags || [],
        isFeatured: isFeatured || false,
        weight: weight ? parseFloat(weight) : null,
        slug,
        sellerId: req.user.role === 'SELLER' ? req.user.sellerId : null,
        images: {
          create: (images || []).map((img, i) => ({
            url: img.url, alt: img.alt || name,
            isPrimary: i === 0, order: i,
          })),
        },
        variants: {
          create: (variants || []).map(v => ({
            name: v.name, value: v.value,
            price: v.price ? parseFloat(v.price) : null,
            stock: parseInt(v.stock) || 0, sku: v.sku,
          })),
        },
      },
      include: { images: true, variants: true },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.price && { price: parseFloat(data.price) }),
        ...(data.stock !== undefined && { stock: parseInt(data.stock) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      },
      include: { images: true },
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// DELETE /api/admin/products/:id (soft delete)
const deleteProduct = async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
