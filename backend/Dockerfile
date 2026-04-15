# backend/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Build (generar Prisma client)
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

# Imagen final
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps    /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY . .

# Crear carpeta de uploads
RUN mkdir -p uploads

EXPOSE 4000

# Migrar DB y luego arrancar
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
