const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const adminPass = await bcrypt.hash('Admin1234!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@kmghub.com' },
    update: {},
    create: {
      email: 'admin@kmghub.com', password: adminPass,
      firstName: 'Admin', lastName: 'KMGHub',
      role: 'ADMIN', isVerified: true,
      cart: { create: {} },
    },
  });

  const clientePass = await bcrypt.hash('Cliente123!', 12);
  await prisma.user.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      email: 'cliente@test.com', password: clientePass,
      firstName: 'Kevin', lastName: 'García',
      role: 'CUSTOMER', isVerified: true,
      cart: { create: {} },
    },
  });

  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'dc-comics' }, update: {}, create: { name: 'DC Comics', slug: 'dc-comics' } }),
    prisma.category.upsert({ where: { slug: 'marvel' },    update: {}, create: { name: 'Marvel',    slug: 'marvel' } }),
    prisma.category.upsert({ where: { slug: 'anime' },     update: {}, create: { name: 'Anime',     slug: 'anime' } }),
    prisma.category.upsert({ where: { slug: 'gaming' },    update: {}, create: { name: 'Gaming',    slug: 'gaming' } }),
  ]);
  const [dc, marvel, anime, gaming] = cats;

  const products = [
    { name: 'Pocillo Batman Dark Knight', slug: 'pocillo-batman-dark-knight', description: 'Pocillo cerámica premium con silueta de Batman en relieve. 350ml. Apto microondas.', price: 38000, comparePrice: 45000, sku: 'MUG-DC-001', stock: 50, categoryId: dc.id, isFeatured: true, tags: ['batman','dc'], img: 'https://via.placeholder.com/600x600/1a1a1a/FFD700?text=Batman' },
    { name: 'Pocillo Superman',           slug: 'pocillo-superman',           description: 'Escudo S de Superman en cerámica. Edición coleccionable. 350ml.',                   price: 36000, comparePrice: null,  sku: 'MUG-DC-002', stock: 45, categoryId: dc.id, isFeatured: true, tags: ['superman','dc'], img: 'https://via.placeholder.com/600x600/003087/FFD700?text=Superman' },
    { name: 'Pocillo Spider-Man',         slug: 'pocillo-spiderman',          description: 'El hombre araña en cerámica 3D. Traje rojo y azul con telarañas en relieve.',        price: 38000, comparePrice: null,  sku: 'MUG-MV-001', stock: 60, categoryId: marvel.id, isFeatured: true, tags: ['spiderman','marvel'], img: 'https://via.placeholder.com/600x600/CC0000/003087?text=Spider-Man' },
    { name: 'Pocillo Iron Man Mark 50',   slug: 'pocillo-iron-man',           description: 'Casco de Iron Man en cerámica dorada. Edición limitada Mark 50.',                    price: 42000, comparePrice: 50000, sku: 'MUG-MV-002', stock: 30, categoryId: marvel.id, isFeatured: false, tags: ['ironman','marvel'], img: 'https://via.placeholder.com/600x600/8B0000/FFD700?text=Iron+Man' },
    { name: 'Pocillo Goku Super Saiyan',  slug: 'pocillo-goku',               description: 'Goku en modo Super Saiyan. Diseño épico Dragon Ball Z. 350ml.',                      price: 35000, comparePrice: null,  sku: 'MUG-AN-001', stock: 55, categoryId: anime.id, isFeatured: true, tags: ['goku','dragonball'], img: 'https://via.placeholder.com/600x600/FF8C00/FFFF00?text=Goku' },
    { name: 'Pocillo Naruto Hokage',      slug: 'pocillo-naruto',             description: 'Naruto Uzumaki en su forma Hokage. Color naranja icónico.',                           price: 35000, comparePrice: 42000, sku: 'MUG-AN-002', stock: 48, categoryId: anime.id, isFeatured: false, tags: ['naruto','anime'], img: 'https://via.placeholder.com/600x600/FF6600/FFFFFF?text=Naruto' },
    { name: 'Pocillo Pac-Man Retro',      slug: 'pocillo-pacman',             description: 'Diseño retro arcade Pac-Man y fantasmas. Para nostálgicos de los 80s.',               price: 32000, comparePrice: 38000, sku: 'MUG-GM-001', stock: 40, categoryId: gaming.id, isFeatured: false, tags: ['pacman','retro'], img: 'https://via.placeholder.com/600x600/000000/FFD700?text=Pac-Man' },
    { name: 'Pocillo Mario Bros',         slug: 'pocillo-mario',              description: 'Super Mario en cerámica. Con hongos y monedas en relieve.',                            price: 34000, comparePrice: null,  sku: 'MUG-GM-002', stock: 52, categoryId: gaming.id, isFeatured: false, tags: ['mario','nintendo'], img: 'https://via.placeholder.com/600x600/CC0000/FFFFFF?text=Mario' },
  ];

  for (const p of products) {
    const { img, ...data } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...data, images: { create: [{ url: img, alt: p.name, isPrimary: true, order: 0 }] } },
    });
  }

  console.log('\n🎉 Seed completado!');
  console.log('─────────────────────────────────');
  console.log('👤 Admin:   admin@kmghub.com  / Admin1234!');
  console.log('👤 Cliente: cliente@test.com  / Cliente123!');
  console.log('─────────────────────────────────\n');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
