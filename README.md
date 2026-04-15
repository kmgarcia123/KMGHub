# 🦸 MugHero Marketplace

Plataforma de ecommerce tipo Mercado Libre / Amazon construida con **Next.js + Node.js + PostgreSQL**, lista para escalar a múltiples productos y vendedores.

---

## 🏗️ Arquitectura

```
mughero/
├── backend/                  # API Node.js + Express + Prisma
│   ├── src/
│   │   ├── app.js            # Express config, middlewares, rutas
│   │   ├── server.js         # Entry point
│   │   ├── controllers/      # Lógica de negocio
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── cart.controller.js
│   │   │   └── order.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT verify + roles
│   │   ├── routes/           # Endpoints REST
│   │   └── config/
│   ├── prisma/
│   │   ├── schema.prisma     # Modelo de datos completo
│   │   └── seed.js           # Datos de prueba
│   ├── uploads/              # Imágenes locales
│   └── Dockerfile
│
├── frontend/                 # Next.js 14 + Tailwind + Zustand
│   └── src/
│       ├── app/              # App Router (páginas)
│       │   ├── page.tsx      # Inicio
│       │   ├── products/     # Catálogo
│       │   ├── checkout/     # Pago
│       │   ├── orders/       # Mis pedidos
│       │   ├── auth/         # Login / Registro
│       │   └── admin/        # Panel administrador
│       ├── components/
│       │   ├── layout/       # Navbar, WhatsAppBot
│       │   ├── product/      # ProductCard
│       │   └── cart/         # CartSidebar
│       ├── store/            # Zustand (auth, cart)
│       └── lib/api.ts        # Axios + interceptores JWT
│
├── docker-compose.yml        # PostgreSQL + Backend + Frontend
└── README.md
```

---

## 🗄️ Modelo de datos

```
User ──── Cart ──── CartItem ──── Product ──── ProductImage
 │                                   │
 ├── Address ←── Order ──── OrderItem
 │                  └── Payment
 └── Seller ──── Product   (multi-vendor futuro)
```

**Roles:** `CUSTOMER` · `SELLER` · `ADMIN`

---

## 🚀 Cómo correr el proyecto

### Opción A — Con Docker (recomendado, más fácil)

**Requisito:** Tener Docker Desktop instalado → https://docker.com/get-started

```bash
# 1. Clonar o descomprimir el proyecto
cd mughero

# 2. Levantar todo (DB + backend + frontend)
docker-compose up --build

# 3. En otra terminal, poblar la base de datos
docker exec mughero_backend node prisma/seed.js

# 4. Abrir en el navegador
#    Tienda:  http://localhost:3000
#    API:     http://localhost:4000/health
```

---

### Opción B — Sin Docker (desarrollo local)

#### Paso 1 — Requisitos
- Node.js 20+ → https://nodejs.org
- PostgreSQL 15+ → https://postgresql.org/download

#### Paso 2 — Base de datos
```sql
-- En psql o pgAdmin, crear la base de datos:
CREATE DATABASE mughero_db;
CREATE USER mughero WITH PASSWORD 'mughero_pass';
GRANT ALL ON DATABASE mughero_db TO mughero;
```

#### Paso 3 — Backend
```bash
cd backend

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL y secretos JWT

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Crear tablas en la base de datos
npm run prisma:migrate

# Poblar con datos de prueba
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
# → API en http://localhost:4000
```

#### Paso 4 — Frontend
```bash
cd frontend

# Copiar variables de entorno
cp .env.local.example .env.local
# Verificar que NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Instalar dependencias
npm install

# Iniciar Next.js
npm run dev
# → Tienda en http://localhost:3000
```

---

## 🔑 Credenciales de prueba

| Rol     | Email                | Contraseña    |
|---------|----------------------|---------------|
| Admin   | admin@mughero.com    | Admin1234!    |
| Cliente | cliente@test.com     | Cliente123!   |

---

## 📡 Endpoints de la API

### Autenticación
| Método | Endpoint              | Descripción           |
|--------|-----------------------|-----------------------|
| POST   | /api/auth/register    | Registro de usuario   |
| POST   | /api/auth/login       | Inicio de sesión      |
| POST   | /api/auth/refresh     | Renovar access token  |
| POST   | /api/auth/logout      | Cerrar sesión         |
| GET    | /api/auth/me          | Usuario autenticado   |

### Productos
| Método | Endpoint                       | Descripción              |
|--------|--------------------------------|--------------------------|
| GET    | /api/products                  | Listar (filtros, búsqueda, paginación) |
| GET    | /api/products/:slug            | Detalle de producto      |

### Carrito (requiere auth)
| Método | Endpoint                    | Descripción         |
|--------|-----------------------------|---------------------|
| GET    | /api/cart                   | Ver carrito         |
| POST   | /api/cart/items             | Agregar item        |
| PUT    | /api/cart/items/:id         | Cambiar cantidad    |
| DELETE | /api/cart/items/:id         | Eliminar item       |
| DELETE | /api/cart                   | Vaciar carrito      |

### Órdenes (requiere auth)
| Método | Endpoint        | Descripción      |
|--------|-----------------|------------------|
| POST   | /api/orders     | Crear orden      |
| GET    | /api/orders     | Mis órdenes      |
| GET    | /api/orders/:id | Detalle de orden |

### Admin (requiere rol ADMIN)
| Método | Endpoint                        | Descripción          |
|--------|---------------------------------|----------------------|
| GET    | /api/admin/stats                | Estadísticas         |
| GET    | /api/admin/orders               | Todas las órdenes    |
| PATCH  | /api/admin/orders/:id/status    | Cambiar estado       |
| POST   | /api/admin/products             | Crear producto       |
| PUT    | /api/admin/products/:id         | Editar producto      |
| DELETE | /api/admin/products/:id         | Eliminar producto    |
| POST   | /api/upload/image               | Subir imagen         |

---

## 📸 Cómo agregar fotos reales a los productos

### Método 1 — Subir desde el Panel Admin (recomendado)
1. Entra a `http://localhost:3000/admin`
2. Haz clic en **"Nuevo producto"**
3. En la sección **"Imágenes"**, haz clic en **"Subir foto"**
4. Selecciona la foto del pocillo desde tu computador
5. La imagen se sube automáticamente y queda lista

### Método 2 — URL externa (ImgBB, Cloudinary)
1. Ve a **imgbb.com** → sube tu foto → copia el **"Direct link"**
2. En el panel admin al crear/editar el producto, pega la URL
3. O edita directamente el archivo `backend/prisma/seed.js` y reemplaza el campo `url` de cada producto

### Consejos para las fotos
- Fondo blanco o negro para que se vea profesional
- Buena iluminación natural o lámpara
- El pocillo debe ocupar el 80% del encuadre
- Dimensiones recomendadas: **800x800px** (cuadrada)
- Formato: **JPG o WebP** (menor tamaño, mejor calidad)

---

## ☁️ Despliegue en producción

### Opción 1 — Railway (más fácil, gratuito para empezar)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Iniciar proyecto
railway init

# Agregar PostgreSQL
railway add postgresql

# Desplegar backend
cd backend && railway up

# Las variables de entorno se configuran en el dashboard de Railway
```

### Opción 2 — Render.com
- Backend: **Web Service** → conecta tu repo → `npm run start`
- Base de datos: **PostgreSQL** gratuito
- Frontend: **Static Site** o **Web Service** → `npm run build && npm start`

### Opción 3 — Vercel + Supabase
- Frontend: Conectar repo a **Vercel** (automático con Next.js)
- Backend: Desplegar en **Render** o **Railway**
- Base de datos: **Supabase** (PostgreSQL gratuito)

### Variables de entorno en producción
```bash
# Backend (en Railway/Render)
DATABASE_URL=postgresql://...    # URL de tu DB en la nube
JWT_SECRET=secreto_muy_largo_aqui
JWT_REFRESH_SECRET=otro_secreto
FRONTEND_URL=https://tu-tienda.com
ALLOWED_ORIGINS=https://tu-tienda.com

# Frontend (en Vercel)
NEXT_PUBLIC_API_URL=https://tu-api.railway.app/api
NEXT_PUBLIC_WA_NUMBER=573001234567  # Tu número real de WhatsApp
```

---

## 💬 Configurar WhatsApp

1. Abre el archivo `frontend/src/components/layout/WhatsAppBot.tsx`
2. Cambia el número en `.env.local`:
   ```
   NEXT_PUBLIC_WA_NUMBER=573001234567
   ```
   Formato: `57` (código Colombia) + número sin el 0 inicial

3. Para respuestas automáticas más avanzadas, puedes integrar **Twilio** o **WhatsApp Business API**

---

## 🔐 Seguridad implementada

- ✅ JWT con access token (15min) + refresh token rotativo (7 días)
- ✅ Contraseñas con bcrypt (12 rondas)
- ✅ Rate limiting en todas las rutas (100 req/15min, 10 en auth)
- ✅ Helmet.js (headers HTTP seguros)
- ✅ CORS configurado con lista blanca
- ✅ Validación de inputs con express-validator
- ✅ SQL injection imposible (Prisma ORM con prepared statements)
- ✅ Uploads con validación de tipo y tamaño

---

## 📈 Roadmap — Próximas funcionalidades

- [ ] Página de detalle de producto (`/products/[slug]`)
- [ ] Sistema de reseñas y ratings
- [ ] Integración Wompi (pagos reales)
- [ ] Notificaciones por email (Nodemailer)
- [ ] Multi-vendedor (activar modelo Seller)
- [ ] Cupones de descuento
- [ ] Búsqueda avanzada con ElasticSearch
- [ ] App móvil con React Native

---

## 🛠️ Stack tecnológico

| Capa       | Tecnología        | Por qué                                        |
|------------|-------------------|------------------------------------------------|
| Frontend   | Next.js 14        | SSR para SEO, App Router, tipado con TypeScript |
| UI         | Tailwind CSS      | Utilidades rápidas, diseño consistente          |
| Estado     | Zustand           | Simple, sin boilerplate, persistencia           |
| Backend    | Node.js + Express | Ecosistema npm, fácil de escalar               |
| ORM        | Prisma            | Tipado, migraciones, multi-DB                  |
| Base datos | PostgreSQL        | Relaciones complejas, ACID para pagos          |
| Auth       | JWT + Refresh     | Stateless, escalable, seguro                   |
| DevOps     | Docker Compose    | Entorno reproducible, fácil despliegue         |

---

Hecho con ♥ para **MugHero** · Bogotá, Colombia 🇨🇴
