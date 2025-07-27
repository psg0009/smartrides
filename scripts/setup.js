#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SmartRides Setup Script');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', 'backend', '.env');
const envExamplePath = path.join(__dirname, '..', 'backend', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  // Create .env file with default values
  const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/smartrides"

# JWT Configuration
JWT_SECRET="smartrides-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="smartrides-uploads"

# Server Configuration
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:8081"

# App URLs
FRONTEND_URL="http://localhost:8081"
EXPO_PUBLIC_API_URL="http://localhost:3000/api/trpc"
EXPO_PUBLIC_WS_URL="ws://localhost:3000/ws"

# Google Services
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY="your_google_places_api_key"
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_email_password"

# Push Notifications
EXPO_ACCESS_TOKEN="your_expo_access_token"

# Redis
REDIS_URL="redis://localhost:6379"

# Sentry
SENTRY_DSN="your_sentry_dsn"
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the .env file with your actual API keys and credentials.\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if PostgreSQL is running
console.log('🔍 Checking PostgreSQL connection...');
try {
  // Try to connect to PostgreSQL
  execSync('psql --version', { stdio: 'pipe' });
  console.log('✅ PostgreSQL is installed');
} catch (error) {
  console.log('❌ PostgreSQL is not installed or not in PATH');
  console.log('📦 Please install PostgreSQL: https://www.postgresql.org/download/');
  console.log('   Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.log('❌ Failed to install dependencies');
  process.exit(1);
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully\n');
} catch (error) {
  console.log('❌ Failed to generate Prisma client');
  process.exit(1);
}

// Push database schema
console.log('🗄️  Setting up database...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed successfully\n');
} catch (error) {
  console.log('❌ Failed to push database schema');
  console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is correct in .env file\n');
}

console.log('🎉 Setup completed!');
console.log('\n📋 Next steps:');
console.log('1. Update the .env file with your actual API keys');
console.log('2. Start the backend: npm run dev:backend');
console.log('3. Start the frontend: npm run dev:frontend');
console.log('4. Test the application\n');

console.log('🔗 Useful commands:');
console.log('- npm run dev:backend    # Start backend server');
console.log('- npm run dev:frontend   # Start frontend development server');
console.log('- npm run build          # Build for production');
console.log('- npx prisma studio      # Open database GUI');
console.log('- npx prisma db push     # Push schema changes');
console.log('- npx prisma generate    # Regenerate Prisma client'); 