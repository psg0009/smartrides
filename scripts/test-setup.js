#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 SmartRides Test Suite');
console.log('========================\n');

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

function runTest(testName, testFn) {
  testResults.total++;
  try {
    testFn();
    console.log(`✅ ${testName}`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
    testResults.failed++;
  }
}

// Test 1: Check if all required files exist
runTest('Required files exist', () => {
  const requiredFiles = [
    'package.json',
    'prisma/schema.prisma',
    'backend/hono.ts',
    'backend/trpc/app-router.ts',
    'app/_layout.tsx',
    'components/PaymentFlow.tsx',
    'components/RealTimeChat.tsx',
    'components/RatingSystem.tsx',
    'components/ScheduledRides.tsx',
    'components/NotificationCenter.tsx',
    'store/auth-store.ts',
    'store/rides-store.ts',
    'store/bookings-store.ts',
  ];

  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  });
});

// Test 2: Check if .env file exists
runTest('Environment file exists', () => {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('Backend .env file not found');
  }
});

// Test 3: Check if Prisma schema is valid
runTest('Prisma schema validation', () => {
  try {
    execSync('npx prisma validate', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Prisma schema validation failed');
  }
});

// Test 4: Check if TypeScript compilation works
runTest('TypeScript compilation', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('TypeScript compilation failed');
  }
});

// Test 5: Check if all dependencies are installed
runTest('Dependencies installed', () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const nodeModulesExists = fs.existsSync('node_modules');
  
  if (!nodeModulesExists) {
    throw new Error('node_modules directory not found');
  }
});

// Test 6: Check if backend dependencies are installed
runTest('Backend dependencies installed', () => {
  const backendPackageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const backendNodeModulesExists = fs.existsSync('backend/node_modules');
  
  if (!backendNodeModulesExists) {
    throw new Error('Backend node_modules directory not found');
  }
});

// Test 7: Check if Docker Compose file exists
runTest('Docker configuration', () => {
  if (!fs.existsSync('docker-compose.yml')) {
    throw new Error('docker-compose.yml not found');
  }
});

// Test 8: Check if setup script exists
runTest('Setup script exists', () => {
  if (!fs.existsSync('scripts/setup.js')) {
    throw new Error('Setup script not found');
  }
});

// Test 9: Check if all tRPC routes are properly exported
runTest('tRPC routes configuration', () => {
  const appRouterPath = path.join(__dirname, '..', 'backend', 'trpc', 'app-router.ts');
  const appRouterContent = fs.readFileSync(appRouterPath, 'utf8');
  
  const requiredRoutes = [
    'auth',
    'rides',
    'bookings',
    'payments',
    'ratings',
    'verification',
    'requests',
    's3',
    'admin',
    'chat',
    'rideTracking',
    'safety',
    'notifications',
  ];

  requiredRoutes.forEach(route => {
    if (!appRouterContent.includes(route)) {
      throw new Error(`Missing tRPC route: ${route}`);
    }
  });
});

// Test 10: Check if Prisma schema has all required models
runTest('Prisma schema models', () => {
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const requiredModels = [
    'User',
    'RideRequest',
    'RideOffer',
    'Booking',
    'Ride',
    'Verification',
    'Payment',
    'ComplianceLog',
    'ChatRoom',
    'ChatRoomParticipant',
    'ChatMessage',
    'RideLocation',
    'Notification',
    'EmergencyContact',
    'RideShare',
  ];

  requiredModels.forEach(model => {
    if (!schemaContent.includes(`model ${model}`)) {
      throw new Error(`Missing Prisma model: ${model}`);
    }
  });
});

// Test 11: Check if all components are properly structured
runTest('Component structure', () => {
  const componentsDir = path.join(__dirname, '..', 'components');
  const components = fs.readdirSync(componentsDir);
  
  const requiredComponents = [
    'PaymentFlow.tsx',
    'RealTimeChat.tsx',
    'RatingSystem.tsx',
    'ScheduledRides.tsx',
    'NotificationCenter.tsx',
  ];

  requiredComponents.forEach(component => {
    if (!components.includes(component)) {
      throw new Error(`Missing component: ${component}`);
    }
  });
});

// Test 12: Check if stores are properly configured
runTest('State management stores', () => {
  const storesDir = path.join(__dirname, '..', 'store');
  const stores = fs.readdirSync(storesDir);
  
  const requiredStores = [
    'auth-store.ts',
    'rides-store.ts',
    'bookings-store.ts',
  ];

  requiredStores.forEach(store => {
    if (!stores.includes(store)) {
      throw new Error(`Missing store: ${store}`);
    }
  });
});

console.log('\n📊 Test Results:');
console.log(`Total: ${testResults.total}`);
console.log(`Passed: ${testResults.passed}`);
console.log(`Failed: ${testResults.failed}`);
console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 All tests passed! SmartRides is ready for development.');
  console.log('\n📋 Next steps:');
  console.log('1. Start Docker services: npm run docker:up');
  console.log('2. Set up database: npm run db:push');
  console.log('3. Start development: npm run dev');
  console.log('4. Run tests: npm test');
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues before proceeding.');
  process.exit(1);
} 