#!/bin/bash

# =============================================================================
# SMART RIDES - PRODUCTION SETUP SCRIPT
# =============================================================================
# This script automates the complete production setup for SmartRides
# Run this script on your production server or CI/CD environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# =============================================================================
# CHECK PREREQUISITES
# =============================================================================
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if Docker is installed (for local development)
if command -v docker &> /dev/null; then
    print_success "Docker is available"
else
    print_warning "Docker is not installed. Some features may not work."
fi

print_success "Prerequisites check completed"

# =============================================================================
# ENVIRONMENT SETUP
# =============================================================================
print_status "Setting up environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f env.example ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your actual API keys and configuration"
    else
        print_error "env.example file not found. Please create a .env file manually."
        exit 1
    fi
else
    print_success ".env file already exists"
fi

# =============================================================================
# INSTALL DEPENDENCIES
# =============================================================================
print_status "Installing dependencies..."

# Install root dependencies
npm ci

# Install backend dependencies
if [ -d "backend" ]; then
    cd backend
    npm ci
    cd ..
    print_success "Backend dependencies installed"
fi

print_success "All dependencies installed"

# =============================================================================
# DATABASE SETUP
# =============================================================================
print_status "Setting up database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_warning "DATABASE_URL not set. Please set it in your .env file"
    print_status "You can use a local PostgreSQL instance or a cloud service like:"
    print_status "- Railway: https://railway.app"
    print_status "- Supabase: https://supabase.com"
    print_status "- Neon: https://neon.tech"
else
    # Run database migrations
    print_status "Running database migrations..."
    npx prisma db push
    print_success "Database migrations completed"
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
fi

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

# Build frontend (if using Expo)
if [ -f "eas.json" ]; then
    print_status "Building Expo app..."
    npx eas build --platform all --non-interactive
    print_success "Expo app built successfully"
fi

print_success "Project build completed"

# =============================================================================
# SECURITY CHECKS
# =============================================================================
print_status "Running security checks..."

# Check for common security issues
if grep -q "password\|secret\|key" .env; then
    print_warning "Found potential secrets in .env file. Make sure it's not committed to version control."
fi

# Check if .env is in .gitignore
if ! grep -q "\.env" .gitignore 2>/dev/null; then
    print_warning ".env file is not in .gitignore. Please add it to prevent committing secrets."
fi

print_success "Security checks completed"

# =============================================================================
# SERVICE CONFIGURATION
# =============================================================================
print_status "Configuring services..."

# Create systemd service file for production
if [ "$EUID" -eq 0 ]; then
    cat > /etc/systemd/system/smartrides.service << EOF
[Unit]
Description=SmartRides Backend
After=network.target

[Service]
Type=simple
User=smartrides
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
ExecStart=/usr/bin/node backend/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    print_success "Systemd service file created"
    print_status "To enable the service, run:"
    print_status "sudo systemctl enable smartrides"
    print_status "sudo systemctl start smartrides"
else
    print_warning "Not running as root. Skipping systemd service creation."
fi

# =============================================================================
# MONITORING SETUP
# =============================================================================
print_status "Setting up monitoring..."

# Create log directory
mkdir -p logs

# Create PM2 ecosystem file for process management
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'smartrides-backend',
    script: 'backend/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

print_success "Monitoring configuration created"

# =============================================================================
# SSL CERTIFICATE SETUP
# =============================================================================
print_status "Setting up SSL certificates..."

# Check if certbot is available
if command -v certbot &> /dev/null; then
    print_status "Certbot is available. You can set up SSL certificates with:"
    print_status "sudo certbot --nginx -d yourdomain.com"
else
    print_warning "Certbot not found. Please install it for SSL certificate management:"
    print_status "sudo apt install certbot python3-certbot-nginx"
fi

# =============================================================================
# FINAL SETUP
# =============================================================================
print_status "Finalizing setup..."

# Create startup script
cat > start.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting SmartRides..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the application
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js
else
    npm start
fi

echo "SmartRides started successfully!"
EOF

chmod +x start.sh

# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash

# Health check endpoint
HEALTH_URL="http://localhost:3000/health"

if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    echo "✅ SmartRides is healthy"
    exit 0
else
    echo "❌ SmartRides health check failed"
    exit 1
fi
EOF

chmod +x health-check.sh

print_success "Setup completed successfully!"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "🎉 SmartRides Production Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file with your actual API keys"
echo "2. Set up your database (PostgreSQL)"
echo "3. Configure your domain and SSL certificates"
echo "4. Set up monitoring and logging"
echo "5. Test the application thoroughly"
echo ""
echo "🚀 To start the application:"
echo "   ./start.sh"
echo ""
echo "🔍 To check health:"
echo "   ./health-check.sh"
echo ""
echo "📚 Documentation:"
echo "   - README.md for detailed setup instructions"
echo "   - DEPLOYMENT.md for deployment guides"
echo ""
echo "⚠️  Important Security Notes:"
echo "   - Keep your .env file secure and never commit it"
echo "   - Regularly update dependencies"
echo "   - Monitor logs for any issues"
echo "   - Set up automated backups"
echo ""

print_success "SmartRides is ready for production! 🚗✨" 