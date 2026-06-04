FROM node:20-alpine

WORKDIR /app

# Needed for Prisma on Alpine linux
RUN apk add --no-cache libc6-compat

# Copy workspace package manifests
COPY package.json ./
COPY package-lock.json ./

# Install all dependencies (including Prisma CLI for migrations)
RUN npm ci

# Copy Prisma schema and your Prisma 7 configuration file
COPY apps/auth-microservice/prisma ./prisma
COPY apps/auth-microservice/prisma.config.ts ./prisma.config.ts


ENV DATABASE_URL="postgresql://postgres:password@auth-db:5432/auth-db"
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy your built application source files
COPY apps/auth-microservice/dist ./
COPY apps/auth-microservice/keys ./keys

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma --config=prisma.config.ts && node main.js"]