# 🚀 SmartRides Production Setup Guide

This guide will walk you through setting up all required services for production deployment of SmartRides.

## 📋 Quick Start

```bash
# Run the automated setup guide
npm run setup:prod

# Validate your environment after setup
npm run validate-env:prod
```

## 🔧 Required Services Setup

### 1. Database Setup 🗄️

#### Option A: Railway (Recommended)
1. Visit [Railway](https://railway.app)
2. Create account and login
3. Create new project "SmartRides"
4. Add PostgreSQL service
5. Copy connection string to `DATABASE_URL`

#### Option B: Supabase
1. Visit [Supabase](https://supabase.com)
2. Create account and new project
3. Go to Settings → Database
4. Copy connection string

**Environment Variables:**
```env
DATABASE_URL="postgresql://username:password@host:port/database_name"
DIRECT_URL="postgresql://username:password@host:port/database_name"
```

### 2. Stripe Payment Processing 💳

#### Account Setup
1. Visit [Stripe](https://stripe.com)
2. Create account or login
3. Complete business verification
4. Go to Developers → API Keys
5. Toggle to "Live data"
6. Copy Publishable key (`pk_live_...`)
7. Copy Secret key (`sk_live_...`)

#### Connect Setup
1. Go to Connect → Settings
2. Configure platform settings
3. Copy Connect Client ID (`ca_...`)

#### Webhooks
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret (`whsec_...`)

**Environment Variables:**
```env
STRIPE_SECRET_KEY="sk_live_your_actual_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_actual_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_actual_webhook_secret"
STRIPE_CONNECT_CLIENT_ID="ca_your_actual_connect_client_id"
```

### 3. AWS S3 File Storage ☁️

#### Account Setup
1. Visit [AWS](https://aws.amazon.com)
2. Create AWS account
3. Go to S3 service
4. Create bucket (e.g., "smartrides-prod-uploads")
5. Configure bucket permissions for public read access

#### IAM User Setup
1. Go to IAM → Users
2. Create user "smartrides-s3-user"
3. Attach policy: `AmazonS3FullAccess`
4. Create access key for programmatic access
5. Copy Access Key ID and Secret Access Key

**Environment Variables:**
```env
AWS_ACCESS_KEY_ID="AKIA_your_actual_access_key"
AWS_SECRET_ACCESS_KEY="your_actual_secret_access_key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="smartrides-prod-uploads"
AWS_S3_BUCKET_REGION="us-east-1"
```

### 4. Google Services 🗺️

#### Google Cloud Setup
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create new project "SmartRides"
3. Enable billing for the project
4. Go to APIs & Services → Library
5. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API

#### API Keys
1. Go to APIs & Services → Credentials
2. Create API Key
3. Restrict key to your APIs and domains
4. Copy the API key

**Environment Variables:**
```env
GOOGLE_MAPS_API_KEY="AIza_your_actual_maps_api_key"
GOOGLE_PLACES_API_KEY="AIza_your_actual_places_api_key"
GOOGLE_CLIENT_ID="your_oauth_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_oauth_client_secret"
```

### 5. SendGrid Email Service 📧

#### Setup
1. Visit [SendGrid](https://sendgrid.com)
2. Create account
3. Verify your domain
4. Create API key with Mail Send permissions
5. Copy API key

**Environment Variables:**
```env
SENDGRID_API_KEY="SG.your_actual_sendgrid_api_key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="SmartRides"
```

### 6. Expo Push Notifications 📱

#### Setup
1. Visit [Expo](https://expo.dev)
2. Create account or login
3. Create new project
4. Go to Project Settings
5. Copy Access Token and Project ID

**Environment Variables:**
```env
EXPO_ACCESS_TOKEN="your_actual_expo_access_token"
EXPO_PROJECT_ID="your_actual_expo_project_id"
```

### 7. Redis Cache 🚀

#### Option A: Redis Cloud
1. Visit [Redis Cloud](https://redis.com)
2. Create free account
3. Create database
4. Copy connection URL

#### Option B: Railway Redis
1. In Railway project
2. Add Redis service
3. Copy REDIS_URL

**Environment Variables:**
```env
REDIS_URL="redis://username:password@host:port"
REDIS_PASSWORD="your_redis_password"
```

## 🔐 Security Setup

### Generate Strong Secrets
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment Variables
```env
JWT_SECRET="your-generated-64-character-hex-string"
NEXTAUTH_SECRET="another-strong-random-secret"
WEBHOOK_SECRET="your_generated_webhook_secret"
```

## 🌐 Production Configuration

### App URLs
```env
NODE_ENV="production"
PORT=3000
CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"
APP_URL="https://yourdomain.com"
WS_URL="wss://yourdomain.com"
```

## 📝 Optional Services

### Twilio (SMS)
1. Visit [Twilio](https://twilio.com)
2. Create account
3. Get Account SID and Auth Token
4. Purchase phone number

```env
TWILIO_ACCOUNT_SID="AC_your_actual_account_sid"
TWILIO_AUTH_TOKEN="your_actual_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Sentry (Error Monitoring)
1. Visit [Sentry](https://sentry.io)
2. Create project
3. Copy DSN

```env
SENTRY_DSN="https://your_actual_sentry_dsn"
```

## ✅ Validation & Testing

### 1. Validate Environment
```bash
# Test development environment
npm run validate-env

# Test production environment
npm run validate-env:prod
```

### 2. Database Setup
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3. Test Application
```bash
# Start development server
npm run dev

# Test all features end-to-end
```

## 🚀 Deployment

### Backend Deployment
- **Vercel**: Connect GitHub repo, set environment variables
- **Railway**: Deploy directly from GitHub
- **DigitalOcean**: Use App Platform or Droplets

### Mobile App Deployment
- **Expo Application Services**: Build and submit to app stores
- **EAS Build**: `eas build --platform all`

## 🔒 Security Checklist

- [ ] Enable 2FA on all service accounts
- [ ] Set up billing alerts for all services
- [ ] Configure monitoring and logging
- [ ] Set up SSL certificates
- [ ] Configure backup strategies
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Monitor API usage

## 📊 Monitoring & Analytics

### Essential Monitoring
- **Application Performance**: New Relic, DataDog
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Database Monitoring**: pgAdmin, Prisma Studio
- **Log Management**: LogRocket, Loggly

### Analytics
- **User Analytics**: Google Analytics, Mixpanel
- **Business Metrics**: Stripe Dashboard, Custom Analytics
- **Performance**: Lighthouse, WebPageTest

## 🆘 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test database connection
npx prisma db push --preview-feature

# Check connection string format
echo $DATABASE_URL
```

#### Stripe Integration
```bash
# Test Stripe connection
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" https://api.stripe.com/v1/account
```

#### Environment Variables
```bash
# Check all environment variables
npm run validate-env:prod

# Test specific service
node -e "console.log(process.env.STRIPE_SECRET_KEY ? 'Stripe configured' : 'Stripe missing')"
```

## 📞 Support

If you encounter issues during setup:

1. Check the validation script output
2. Verify all environment variables are set correctly
3. Ensure all services are properly configured
4. Check service-specific documentation
5. Review error logs and monitoring

## 🎯 Next Steps

After completing the setup:

1. **Test thoroughly** in development environment
2. **Deploy to staging** environment first
3. **Perform security audit** before production
4. **Set up monitoring** and alerting
5. **Create backup strategies**
6. **Plan for scaling** as user base grows

---

**Remember**: Never commit `.env` files to version control. Use environment-specific configurations and rotate secrets regularly. 