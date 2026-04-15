// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ─── ADMIN USER ───────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mughero.com' },
    update: {},
    create: {
      email: 'admin@mughero.com',
      password: adminPass,
      firstName: 'Admin',
      lastName: 'MugHero',
      role: 'ADMIN',
      isVerified: true,
      cart: { create: {} },
    },
  });
  console.log('✅ Admin creado:', admin.email);

  // ─── TEST CUSTOMER ────────────────────────────────────────────────────────
  const customerPass = await bcrypt.hash('Cliente123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      email: 'cliente@test.com',
      password: customerPass,
      firstName: 'Carlos',
      lastName: 'Gómez',
      role: 'CUSTOMER',
      isVerified: true,
      cart: { create: {} },
      addresses: {
        create: {
          label: 'Casa',
          fullName: 'Carlos Gómez',
          phone: '3001234567',
          street: 'Calle 123 # 45-67',
          city: 'Bogotá',
          department: 'Cundinamarca',
          isDefault: true,
        },
      },
    },
  });
  console.log('✅ Cliente de prueba creado:', customer.email);

  // ─── CATEGORIES ───────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'dc-comics' },
      update: {},
      create: { name: 'DC Comics', slug: 'dc-comics', description: 'Superman, Batman, Wonder Woman y más' },
    }),
    prisma.category.upsert({
      where: { slug: 'marvel' },
      update: {},
      create: { name: 'Marvel', slug: 'marvel', description: 'Spider-Man, Iron Man, Avengers y más' },
    }),
    prisma.category.upsert({
      where: { slug: 'anime' },
      update: {},
      create: { name: 'Anime', slug: 'anime', description: 'Dragon Ball, Naruto, One Piece y más' },
    }),
    prisma.category.upsert({
      where: { slug: 'retro-gaming' },
      update: {},
      create: { name: 'Retro Gaming', slug: 'retro-gaming', description: 'Clásicos de videojuegos' },
    }),
  ]);
  console.log('✅ Categorías creadas');

  const [dcCat, marvelCat, animeCat, retroCat] = categories;

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  const productsData = [
    {
      name: 'Pocillo Batman Dark Knight',
      slug: 'pocillo-batman-dark-knight',
      description: 'Pocillo de cerámica premium con la silueta icónica de Batman. Diseño en relieve del Caballero de la Noche sobre fondo negro mate. La elección favorita de los fans del Universo DC.',
      shortDesc: 'Cerámica 350ml · Relieve Batman · Apto microondas',
      price: 38000, comparePrice: 45000, cost: 15000,
      sku: 'MUG-DC-001', stock: 50, weight: 320,
      categoryId: dcCat.id, isFeatured: true,
      tags: ['batman', 'dc', 'superheroes', 'mugs'],
      images: [
        { url: 'https://via.placeholder.com/600x600/1a1a1a/FFD700?text=🦇+Batman', alt: 'Pocillo Batman', isPrimary: true, order: 0 },
      ],
    },
    {
      name: 'Pocillo Superman Man of Steel',
      slug: 'pocillo-superman-man-of-steel',
      description: 'El escudo S de Superman en tu pocillo diario. Diseño clásico en azul y rojo con acabado brillante. Edición coleccionable del Hombre de Acero.',
      shortDesc: 'Cerámica 350ml · Escudo S · Edición coleccionable',
      price: 36000, comparePrice: null, cost: 14000,
      sku: 'MUG-DC-002', stock: 45, weight: 320,
      categoryId: dcCat.id, isFeatured: true,
      tags: ['superman', 'dc', 'superheroes'],
      images: [
        { url: 'https://via.placeholder.com/600x600/003087/FFD700?text=💪+Superman', alt: 'Pocillo Superman', isPrimary: true, order: 0 },
      ],
    },
    {
      name: 'Pocillo Spider-Man Marvel Classic',
      slug: 'pocillo-spiderman-marvel-classic',
      description: 'El hombre araña trepando por tu taza. Diseño 3D del traje rojo y azul con telarañas en relieve. Perfecto para los fans del Universo Marvel.',
      shortDesc: 'Cerámica 350ml · Diseño 3D · Telarañas en relieve',
      price: 38000, comparePrice: null, cost: 15000,
      sku: 'MUG-MV-001', stock: 60, weight: 320,
      categoryId: marvelCat.id, isFeatured: true,
      tags: ['spiderman', 'marvel', 'superheroes'],
      images: [
        { url: 'https://via.placeholder.com/600x600/CC0000/003087?text=🕷️+Spider-Man', alt: 'Pocillo Spider-Man', isPrimary: true, order: 0 },
      ],
    },
    {
      name: 'Pocillo Iron Man Mark 50',
      slug: 'pocillo-iron-man-mark-50',
      description: 'El casco de Iron Man en cerámica dorada. Edición limitada Mark 50 con detalles en rojo y oro. Para los fans de Tony Stark.',
      shortDesc: 'Cerámica 350ml · Casco Mark 50 · Edición limitada',
      price: 42000, comparePrice: 50000, cost: 17000,
      sku: 'MUG-MV-002', stock: 30, weight: 320,
      categoryId: marvelCat.id, isFeatured: false,
      tags: ['ironman', 'marvel', 'avengers'],
      images: [
        { url: 'https://via.placeholder.com/600x600/8B0000/FFD700?text=🤖+Iron+Man', alt: 'Pocillo Iron Man', isPrimary: true, order: 0 },
      ],
    },
    {
      name: 'Pocillo Goku Super Saiyan',
      slug: 'pocillo-goku-super-saiyan',
      description: 'Goku en modo Super Saiyan con cabello dorado iluminado. Diseño épico de Dragon Ball Z para empezar el día con el poder de un guerrero Z.',
      shortDesc: 'Cerámica 350ml · Super Saiyan · Dragon Ball Z',
      price: 35000, comparePrice: null, cost: 13000,
      sku: 'MUG-AN-001', stock: 55, weight: 320,
      categoryId: animeCat.id, isFeatured: true,
      tags: ['goku', 'dragonball', 'anime', 'saiyan'],
      images: [
        { url: 'https://via.placeholder.com/600x600/FF8C00/FFFF00?text=⚡+Goku', alt: 'Pocillo Goku', isPrimary: true, order: 0 },
      ],
    },
    {
      name: 'Pocillo Naruto Hokage',
      slug: 'pocillo-naruto-hokage',
      description: 'Naruto Uzumaki en su forma Hokage con el símbolo del pergamino. Color naranja icónico sobre cerámica blanca. ¡Dattebayo!',
      shortDesc: 'Cerámica 350ml · Hokage Edition · Naruto Shippuden',
      price: 35000, comparePrice: 42000, cost: 13000,
      sku: 'MUG-AN-002', stock: 48, weight: 320,
      categoryId: animeCat.id, isFeatured: false,
      tags: ['naruto', 'anime', 'hokage'],
      images: [
        { url: 'https://via.placeholder.com/600x600/FF6600/FFFFFF?text=🍃+Naruto', alt: 'Pocillo Naruto', isPrimary: true, order: 0 },
      ],
    },
    {
      name: 'Pocillo Pac-Man Retro Arcade',
      slug: 'pocillo-pacman-retro-arcade',
      description: 'Diseño retro arcade con Pac-Man y los 4 fantasmas clásicos en fondo negro. Para los nostálgicos de los 80s y 90s que aman los videojuegos.',
      shortDesc: 'Cerámica 350ml · Retro Arcade · Años 80s',
      price: 32000, comparePrice: 38000, cost: 12000,
      sku: 'MUG-RT-001', stock: 40, weight: 320,
      categoryId: retroCat.id, isFeatured: false,
      tags: ['pacman', 'retro', 'gaming', 'arcade'],
      images: [
        { url: 'https://via.placeholder.com/600x600/000000/FFD700?text=🟡+Pac-Man', alt: 'Pocillo Pac-Man', isPrimary: true, order: 0 },
      ],
    },
    {
      name: 'Pocillo Mario Bros Nintendo',
      slug: 'pocillo-mario-bros-nintendo',
      description: 'El fontanero más famoso del mundo en cerámica premium. Con hongos rojos y monedas doradas en relieve. Un clásico eterno para cualquier gamer.',
      shortDesc: 'Cerámica 350ml · Super Mario · Nintendo Classic',
      price: 34000, comparePrice: null, cost: 13000,
      sku: 'MUG-RT-002', stock: 52, weight: 320,
      categoryId: retroCat.id, isFeatured: false,
      tags: ['mario', 'nintendo', 'retro', 'gaming'],
      images: [
        { url: 'https://via.placeholder.com/600x600/CC0000/FFFFFF?text=🍄+Mario', alt: 'Pocillo Mario', isPrimary: true, order: 0 },
      ],
    },
  ];

  for (const p of productsData) {
    const { images, ...productData } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productData,
        images: { create: images },
      },
    });
  }
  console.log('✅ Productos creados');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('─────────────────────────────────────');
  console.log('👤 Admin:   admin@mughero.com / Admin1234!');
  console.log('👤 Cliente: cliente@test.com  / Cliente123!');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
