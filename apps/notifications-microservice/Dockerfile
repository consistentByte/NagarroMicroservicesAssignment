FROM node:20-alpine
WORKDIR /app

# 1. Copy the root package files
COPY package*.json ./

# 2. Copy the microservice package.json
COPY apps/notifications-microservice/package.json ./apps/notifications-microservice/package.json

# 3. Copy the dist folder from its specific location
# We copy the contents of your dist folder to the /app/dist folder in the container
COPY apps/notifications-microservice/dist/ ./dist/

# 4. Install production dependencies
RUN npm install --omit=dev

ENV NODE_ENV=production

# 5. Run the app
CMD ["node", "dist/main.js"]