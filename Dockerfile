# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd backend && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build backend
RUN cd backend && npm run build

# Generate Prisma client in the backend directory
RUN cd backend && npx prisma generate --schema=../prisma/schema.prisma

# Expose port
EXPOSE 3000

# Start the backend
CMD ["npm", "run", "start:backend"] 