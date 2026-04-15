# KMGHub — Marketplace de todo


Plataforma ecommerce tipo Mercado Libre construida con Next.js + Node.js + PostgreSQL.

## Levantar el proyecto

### Requisitos
- Docker Desktop instalado y corriendo

### Pasos

```bash
# 1. Crear archivos de configuración
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local

# 2. Levantar todo
docker-compose up --build

# 3. En otra terminal, cargar datos de prueba (solo la primera vez)
docker exec kmghub_backend node prisma/seed.js
```

### URLs
- Tienda:      http://localhost:3000
- Admin:       http://localhost:3000/admin
- API:         http://localhost:4000/health

### Credenciales de prueba
- Admin:   admin@kmghub.com  / Admin1234!
- Cliente: cliente@test.com  / Cliente123!

## Estructura
```
KMGHub/
├── backend/        Node.js + Express + Prisma
├── frontend/       Next.js 14 + Tailwind
└── docker-compose.yml
```

Hecho con ♥ — KMGHub Colombia 🇨🇴
