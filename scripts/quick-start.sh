#!/bin/bash

# =============================================================================
# SMART RIDES - QUICK START SCRIPT
# =============================================================================
# This script gets SmartRides running in development mode quickly
# Perfect for developers who want to start coding immediately

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚗 SmartRides Quick Start"
echo "=========================="
echo ""

# =============================================================================
# CHECK PREREQUISITES
# =============================================================================
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    print_status "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm $(npm -v) detected"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    print_success "Docker detected - will use for database"
    USE_DOCKER=true
else
    print_warning "Docker not found - you'll need to set up PostgreSQL manually"
    USE_DOCKER=false
fi

# =============================================================================
# INSTALL DEPENDENCIES
# =============================================================================
print_status "Installing dependencies..."

if [ ! -d "node_modules" ]; then
    npm install
    print_success "Root dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Install backend dependencies
if [ -d "backend" ] && [ ! -d "backend/node_modules" ]; then
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
fi

# =============================================================================
# ENVIRONMENT SETUP
# =============================================================================
print_status "Setting up environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f env.example ]; then
        cp env.example .env
        print_success "Created .env file from template"
        
        # Set up development database URL
        if [ "$USE_DOCKER" = true ]; then
            sed -i.bak 's|DATABASE_URL="postgresql://username:password@localhost:5432/smartrides"|DATABASE_URL="postgresql://postgres:password@localhost:5432/smartrides_dev"|' .env
            sed -i.bak 's|REDIS_URL="redis://localhost:6379"|REDIS_URL="redis://localhost:6379"|' .env
        fi
        
        # Set development JWT secret
        sed -i.bak 's|JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"|JWT_SECRET="dev-secret-key-for-development-only"|' .env
        
        print_warning "Please edit .env file with your actual API keys for full functionality"
    else
        print_error "env.example file not found. Please create a .env file manually."
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# =============================================================================
# DATABASE SETUP
# =============================================================================
print_status "Setting up database..."

if [ "$USE_DOCKER" = true ]; then
    # Start Docker services
    if [ -f "docker-compose.yml" ]; then
        print_status "Starting Docker services..."
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        print_success "Docker services started"
    else
        print_warning "docker-compose.yml not found. Please start PostgreSQL manually."
    fi
else
    print_warning "Please ensure PostgreSQL is running on localhost:5432"
fi

# Run database migrations
print_status "Setting up database schema..."
npx prisma db push --accept-data-loss
npx prisma generate
print_success "Database schema created"

# =============================================================================
# BUILD PROJECT
# =============================================================================
print_status "Building project..."

# Build backend
if [ -d "backend" ]; then
    cd backend
    npm run build
    cd ..
    print_success "Backend built successfully"
fi

# =============================================================================
# START DEVELOPMENT SERVER
# =============================================================================
print_success "Setup completed successfully!"
echo ""
echo "🎉 SmartRides is ready for development!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys (optional for basic development)"
echo "2. Start the development server: npm run dev"
echo "3. Open your browser to: http://localhost:3000"
echo "4. For mobile development: npm run expo"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run expo         - Start Expo development server"
echo "  npm run docker:up    - Start Docker services"
echo "  npm run docker:down  - Stop Docker services"
echo "  npm run db:reset     - Reset database"
echo "  npm run test         - Run tests"
echo ""
echo "📚 Documentation:"
echo "  - README.md for detailed setup"
echo "  - DEPLOYMENT.md for production deployment"
echo "  - scripts/deployment-checklist.md for deployment tracking"
echo ""

# Ask if user wants to start the development server
read -p "Would you like to start the development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting development server..."
    npm run dev
else
    print_status "You can start the server later with: npm run dev"
fi

print_success "Happy coding! 🚗✨" 