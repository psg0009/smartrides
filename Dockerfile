# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Copy Prisma schema (needed for postinstall scripts)
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd backend && npm install --legacy-peer-deps

# Copy remaining source code
COPY . .

# Build backend
RUN cd backend && npm run build

# Generate Prisma client in the backend directory
RUN cd backend && npx prisma generate --schema=../prisma/schema.prisma
RUN ls -la backend/node_modules/@prisma/client || echo "Prisma client not found in expected location"

# Expose port
EXPOSE 3000

# Start the backend
CMD ["npm", "run", "start:backend"] 