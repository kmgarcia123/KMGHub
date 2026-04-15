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
      console.log(`🚀 KMGHub API corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
startServer();
