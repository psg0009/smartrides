# 🚀 SmartRides Deployment Guide

This guide will walk you through deploying SmartRides to production, from initial setup to app store submission.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Service Integrations](#service-integrations)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [Mobile App Deployment](#mobile-app-deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **Git** for version control
- **Docker** (optional, for local development)
- **Domain name** for your production app
- **Cloud hosting** account (Vercel, Railway, etc.)
- **Mobile app store** developer accounts (iOS/Android)

## ⚡ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/smartrides.git
cd smartrides

# Run the automated setup script
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

### 2. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit with your actual values
nano .env
```

### 3. Start Development

```bash
# Install dependencies
npm install

# Start database (requires Docker)
npm run docker:up

# Run migrations
npx prisma db push

# Start development server
npm run dev
```

## 🌍 Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Stripe (Payment Processing)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="smartrides-uploads"

# Google Services
GOOGLE_MAPS_API_KEY="AIza..."
GOOGLE_PLACES_API_KEY="AIza..."

# Email (SendGrid)
SENDGRID_API_KEY="SG..."
SENDGRID_FROM_EMAIL="noreply@smartrides.app"

# Expo Push Notifications
EXPO_ACCESS_TOKEN="..."
EXPO_PROJECT_ID="..."
```

### Getting API Keys

#### 1. Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your publishable and secret keys
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

#### 2. AWS S3
1. Create AWS account
2. Create S3 bucket for file uploads
3. Create IAM user with S3 permissions
4. Get access key and secret

#### 3. Google Maps
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project and enable Maps JavaScript API
3. Create API key with restrictions

#### 4. SendGrid
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Verify your sender domain
3. Create API key with mail send permissions

## 🗄️ Database Setup

### Option 1: Cloud Database (Recommended)

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init

# Add PostgreSQL service
railway add

# Get connection string
railway variables
```

#### Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string

#### Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard

### Option 2: Self-Hosted PostgreSQL

```bash
# Using Docker
docker run --name smartrides-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=smartrides \
  -p 5432:5432 \
  -d postgres:15

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/smartrides"
```

### Run Migrations

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

## 🔗 Service Integrations

### 1. Stripe Connect Setup

For driver payments, set up Stripe Connect:

```bash
# In your Stripe dashboard:
# 1. Go to Connect → Settings
# 2. Configure account types (Express recommended)
# 3. Set up webhook endpoints
# 4. Configure payout schedules
```

### 2. Push Notifications

```bash
# Install Expo CLI
npm install -g @expo/cli

# Login to Expo
expo login

# Configure push notifications
expo push:android:upload --api-key YOUR_FCM_KEY
expo push:ios:upload --key-id YOUR_KEY_ID --team-id YOUR_TEAM_ID
```

### 3. Email Templates

Create email templates in SendGrid:

- Welcome email
- Ride confirmation
- Payment receipt
- Safety alerts

## 🖥️ Backend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... add all other variables
```

### Option 2: Railway

```bash
# Deploy to Railway
railway up

# Set environment variables
railway variables set DATABASE_URL="your-database-url"
railway variables set JWT_SECRET="your-jwt-secret"
```

### Option 3: DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

### Option 4: Self-Hosted (VPS)

```bash
# On your VPS
git clone https://github.com/yourusername/smartrides.git
cd smartrides

# Run setup script
./scripts/setup-production.sh

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📱 Frontend Deployment

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for development
eas build --platform all --profile development

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### EAS Configuration

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/service-account.json",
        "track": "production"
      }
    }
  }
}
```

## 📲 Mobile App Deployment

### iOS App Store

1. **Prepare App Store Connect**
   - Create app in App Store Connect
   - Configure app information
   - Set up pricing and availability

2. **Build and Submit**
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

3. **Review Process**
   - Wait for Apple review (1-7 days)
   - Address any issues
   - Release to App Store

### Google Play Store

1. **Prepare Google Play Console**
   - Create app in Play Console
   - Configure store listing
   - Set up pricing and distribution

2. **Build and Submit**
   ```bash
   eas build --platform android --profile production
   eas submit --platform android
   ```

3. **Review Process**
   - Wait for Google review (1-3 days)
   - Address any issues
   - Release to Play Store

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2
npm install -g @sentry/cli

# Set up PM2 monitoring
pm2 install pm2-server-monit
pm2 install pm2-logrotate
```

### 2. Database Monitoring

```bash
# Set up database backups
# Add to crontab
0 2 * * * pg_dump $DATABASE_URL > /backups/smartrides-$(date +%Y%m%d).sql
```

### 3. Log Management

```bash
# Configure log rotation
pm2 install pm2-logrotate

# Set up log aggregation (optional)
# Consider services like Loggly, Papertrail, or ELK stack
```

### 4. Health Checks

```bash
# Create health check endpoint
# Add to your backend API
GET /health

# Set up monitoring
# Use services like UptimeRobot, Pingdom, or StatusCake
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connectivity
npx prisma db pull

# Reset database (development only)
npx prisma db push --force-reset
```

#### 2. Build Failures
```bash
# Clear cache
npm run clean
rm -rf node_modules
npm install

# Check for dependency conflicts
npm ls
```

#### 3. Environment Variables
```bash
# Verify environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Check .env file syntax
cat .env | grep -v '^#' | grep -v '^$'
```

#### 4. Push Notifications
```bash
# Test push notifications
expo push:send --to "ExponentPushToken[...]" --title "Test" --body "Test message"
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_rides_created_at ON rides(created_at);
```

#### 2. API Optimization
- Implement caching with Redis
- Add rate limiting
- Optimize database queries
- Use CDN for static assets

#### 3. Mobile App Optimization
- Implement lazy loading
- Optimize images
- Use efficient navigation
- Minimize bundle size

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Stripe Documentation](https://stripe.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review application logs
3. Check service status pages
4. Create an issue in the GitHub repository
5. Contact the development team

---

**🎉 Congratulations!** Your SmartRides application is now deployed and ready to serve students worldwide! 🚗✨ 