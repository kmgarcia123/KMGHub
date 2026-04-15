// src/server.js
require('dotenv').config();
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL conectado via Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 MugHero API corriendo en http://localhost:${PORT}`);
      console.log(`📚 Ambiente: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Servidor apagado correctamente');
  process.exit(0);
});

startServer();
