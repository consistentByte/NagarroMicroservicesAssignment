FROM node:20-alpine

# Required for Prisma engine binaries and native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 1. Copy the build artifacts (dist folder)
COPY apps/leave-manager-microservice/dist .

# 2. Copy dependencies and lockfiles to ensure perfect environment
COPY package.json package-lock.json ./

# 3. Install production dependencies (including @nestjs/passport and others)
RUN npm install --omit=dev

# 4. Copy Prisma artifacts and configuration
COPY apps/leave-manager-microservice/prisma ./prisma
COPY apps/leave-manager-microservice/prisma.config.ts .

# 5. Generate Prisma Client (builds binaries for Alpine)
RUN npx prisma generate --schema=prisma/schema.prisma

ENV NODE_ENV=production

EXPOSE 3000

# 6. Run migration and start the app
CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma --config=prisma.config.ts && node main.js"]