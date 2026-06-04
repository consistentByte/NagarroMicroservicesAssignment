FROM node:20-alpine

# # Required for Prisma engine binaries and native modules
# RUN apk add --no-cache libc6-compat

WORKDIR /app

# 1. Copy the build artifacts (dist folder)
COPY apps/api-gateway/dist .

# 2. Copy dependencies and lockfiles to ensure perfect environment
COPY package.json package-lock.json ./

# 3. Install production dependencies (including @nestjs/passport and others)
# This solves your "MODULE_NOT_FOUND" error without manual tracking
RUN npm install --omit=dev

# 4. Copy Prisma artifacts and configuration
# COPY apps/api-gateway/prisma ./prisma
# COPY apps/api-gateway/prisma.config.ts .

# 5. Generate Prisma Client (builds binaries for Alpine)
# RUN npx prisma generate --schema=prisma/schema.prisma

ENV NODE_ENV=production

EXPOSE 3000

# 6. Run migration and start the app
CMD ["sh", "-c", "node main.js"]