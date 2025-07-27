# 🚗 SmartRides - Student Transportation Platform

A comprehensive ride-sharing platform designed specifically for university students, connecting drivers and passengers for safe, affordable campus transportation.

## 🌟 Features

### 🚀 Core Features
- **Real-time Ride Tracking** - Live GPS tracking for drivers and passengers
- **Smart Matching** - AI-powered driver-passenger matching
- **Secure Payments** - Stripe integration with driver payouts
- **Safety Features** - Emergency contacts, ride sharing, safety alerts
- **Push Notifications** - Real-time updates for ride status changes

### 🎓 University-Specific Features
- **Student Verification** - .edu email verification and ID upload
- **Campus Integration** - University-specific pickup/drop-off points
- **Group Rides** - Share rides with classmates
- **Scheduled Rides** - Book rides in advance for classes
- **Rating System** - Multi-category ratings for safety and experience

### 💬 Communication
- **Real-time Chat** - In-app messaging between drivers and passengers
- **Voice Calls** - Integrated calling feature
- **Location Sharing** - Share real-time location with trusted contacts

## 🏗️ Architecture

### Frontend
- **React Native/Expo** - Cross-platform mobile app
- **TypeScript** - Type-safe development
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **NativeWind** - Tailwind CSS for React Native

### Backend
- **Hono.js** - Fast, lightweight web framework
- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and WebSocket sessions
- **JWT** - Authentication

### Infrastructure
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Vercel/Railway** - Backend deployment
- **Expo Application Services** - Mobile app deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional, for local database)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/smartrides.git
cd smartrides
```

### 2. Quick Setup (Recommended)
```bash
# Run the automated setup script
./scripts/quick-start.sh
```

### 3. Manual Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit environment variables
nano .env

# Start database (requires Docker)
npm run docker:up

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### 4. Mobile Development
```bash
# Start Expo development server
npm run expo

# Install Expo Go app on your phone
# Scan the QR code to run the app
```

## 📱 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run expo         # Start Expo development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Database
```bash
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services
npm run db:push      # Push schema to database
npm run db:reset     # Reset database
npm run db:seed      # Seed database with sample data
```

### Deployment
```bash
./scripts/setup-production.sh  # Production setup
./scripts/quick-start.sh       # Development setup
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smartrides"

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

### Service Setup

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

## 🗄️ Database Schema

### Core Models
- **User** - Students and drivers with verification
- **Ride** - Ride offers and requests
- **Booking** - Ride reservations
- **Payment** - Stripe payment records
- **Rating** - Multi-category ratings
- **ChatRoom/ChatMessage** - Real-time messaging
- **Notification** - Push notifications
- **EmergencyContact** - Safety features

### Key Features
- **Real-time tracking** with location updates
- **Payment processing** with Stripe Connect
- **Safety features** with emergency contacts
- **University verification** with student IDs
- **Group rides** with multiple passengers

## 🚀 Deployment

### Backend Deployment

#### Option 1: Vercel (Recommended)
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

#### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway up

# Set environment variables
railway variables set DATABASE_URL="your-database-url"
railway variables set JWT_SECRET="your-jwt-secret"
```

### Mobile App Deployment

#### Using Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Production Setup
```bash
# Run production setup script
./scripts/setup-production.sh
```

## 📊 API Documentation

### Authentication
```typescript
// Login
POST /api/trpc/auth.login
{
  email: string
  password: string
}

// Signup
POST /api/trpc/auth.signup
{
  email: string
  password: string
  name: string
  role: 'PASSENGER' | 'DRIVER'
}
```

### Rides
```typescript
// Create ride
POST /api/trpc/rides.create
{
  origin: string
  destination: string
  departureTime: Date
  price: number
  seats: number
}

// Search rides
GET /api/trpc/rides.search
{
  origin: string
  destination: string
  date: Date
}
```

### Bookings
```typescript
// Book ride
POST /api/trpc/bookings.create
{
  rideId: string
  seats: number
}

// Get user bookings
GET /api/trpc/bookings.getUserBookings
```

### Real-time Features
```typescript
// WebSocket connection
ws://yourdomain.com/ws

// Chat messages
POST /api/trpc/chat.sendMessage
{
  chatRoomId: string
  content: string
  messageType: 'text' | 'image' | 'location'
}

// Location updates
POST /api/trpc/rideTracking.updateLocation
{
  rideId: string
  latitude: number
  longitude: number
}
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run tests with coverage
npm run test:coverage
```

### Test Database
```bash
# Reset test database
npm run test:db:reset

# Seed test data
npm run test:db:seed
```

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** with bcrypt
- **Rate Limiting** to prevent abuse
- **Input Validation** with Zod schemas
- **CORS Protection** for cross-origin requests
- **SQL Injection Prevention** with Prisma ORM
- **XSS Protection** with proper sanitization

## 📈 Performance Optimization

- **Database Indexing** for fast queries
- **Redis Caching** for frequently accessed data
- **Image Optimization** with AWS S3
- **Bundle Optimization** for mobile apps
- **CDN Integration** for static assets
- **Connection Pooling** for database efficiency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Add proper error handling

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- [API Reference](docs/api.md) - Detailed API documentation
- [Database Schema](docs/schema.md) - Database design and relationships
- [Security Guide](docs/security.md) - Security best practices
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## 🆘 Support

- **Documentation**: [docs.smartrides.com](https://docs.smartrides.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/smartrides/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/smartrides/discussions)
- **Email**: support@smartrides.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo** for the amazing React Native development platform
- **Vercel** for seamless deployment
- **Stripe** for secure payment processing
- **Prisma** for the excellent database toolkit
- **tRPC** for end-to-end typesafe APIs

---

**🎉 SmartRides - Revolutionizing student transportation, one ride at a time! 🚗✨**

*Built with ❤️ for students worldwide*
