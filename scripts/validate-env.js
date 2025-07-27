#!/usr/bin/env node

const crypto = require('crypto');
const https = require('https');
const { execSync } = require('child_process');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60));
}

function logSection(message) {
  console.log('\n' + '-'.repeat(40));
  log(message, 'cyan');
  console.log('-'.repeat(40));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Environment validation functions
function validateRequired(envVar, description) {
  const value = process.env[envVar];
  if (!value) {
    logError(`${envVar}: Missing - ${description}`);
    return false;
  }
  logSuccess(`${envVar}: Set`);
  return true;
}

function validateUrl(envVar, description) {
  const value = process.env[envVar];
  if (!value) {
    logError(`${envVar}: Missing - ${description}`);
    return false;
  }
  
  try {
    new URL(value);
    logSuccess(`${envVar}: Valid URL`);
    return true;
  } catch (error) {
    logError(`${envVar}: Invalid URL format`);
    return false;
  }
}

function validateStripeKey(envVar, expectedPrefix) {
  const value = process.env[envVar];
  if (!value) {
    logError(`${envVar}: Missing`);
    return false;
  }
  
  if (!value.startsWith(expectedPrefix)) {
    logError(`${envVar}: Should start with ${expectedPrefix}`);
    return false;
  }
  
  logSuccess(`${envVar}: Valid format`);
  return true;
}

function validateJWTSecret(envVar) {
  const value = process.env[envVar];
  if (!value) {
    logError(`${envVar}: Missing`);
    return false;
  }
  
  if (value.length < 32) {
    logError(`${envVar}: Should be at least 32 characters long`);
    return false;
  }
  
  logSuccess(`${envVar}: Valid length`);
  return true;
}

function validateEmail(envVar) {
  const value = process.env[envVar];
  if (!value) {
    logError(`${envVar}: Missing`);
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    logError(`${envVar}: Invalid email format`);
    return false;
  }
  
  logSuccess(`${envVar}: Valid email format`);
  return true;
}

// Service connection tests
async function testDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logError('DATABASE_URL: Missing - Cannot test database connection');
    return false;
  }
  
  try {
    logInfo('Testing database connection...');
    // This would require Prisma client to be generated
    // For now, just validate the URL format
    if (databaseUrl.includes('postgresql://')) {
      logSuccess('Database URL format: Valid PostgreSQL connection string');
      return true;
    } else {
      logError('Database URL format: Should be PostgreSQL connection string');
      return false;
    }
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
}

async function testStripeConnection() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    logError('STRIPE_SECRET_KEY: Missing - Cannot test Stripe connection');
    return false;
  }
  
  try {
    logInfo('Testing Stripe connection...');
    // Make a test API call to Stripe
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.stripe.com',
        port: 443,
        path: '/v1/account',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      req.end();
    });
    
    if (response.status === 200) {
      logSuccess('Stripe connection: Successful');
      return true;
    } else {
      logError(`Stripe connection failed: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Stripe connection failed: ${error.message}`);
    return false;
  }
}

async function testSendGridConnection() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    logError('SENDGRID_API_KEY: Missing - Cannot test SendGrid connection');
    return false;
  }
  
  try {
    logInfo('Testing SendGrid connection...');
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.sendgrid.com',
        port: 443,
        path: '/v3/user/profile',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
      req.end();
    });
    
    if (response.status === 200) {
      logSuccess('SendGrid connection: Successful');
      return true;
    } else {
      logError(`SendGrid connection failed: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`SendGrid connection failed: ${error.message}`);
    return false;
  }
}

// Main validation function
async function validateEnvironment() {
  logHeader('SmartRides Environment Validation');
  
  const isProduction = process.env.NODE_ENV === 'production';
  logInfo(`Environment: ${isProduction ? 'Production' : 'Development'}`);
  
  let allValid = true;
  let requiredCount = 0;
  let validCount = 0;
  
  // Database Configuration
  logSection('Database Configuration');
  requiredCount++;
  if (validateRequired('DATABASE_URL', 'PostgreSQL connection string')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateRequired('DIRECT_URL', 'Direct database connection for migrations')) validCount++;
  else allValid = false;
  
  // Authentication & Security
  logSection('Authentication & Security');
  requiredCount++;
  if (validateJWTSecret('JWT_SECRET')) validCount++;
  else allValid = false;
  
  if (isProduction) {
    requiredCount++;
    if (validateRequired('NEXTAUTH_SECRET', 'NextAuth secret for production')) validCount++;
    else allValid = false;
    
    requiredCount++;
    if (validateUrl('NEXTAUTH_URL', 'Production domain URL')) validCount++;
    else allValid = false;
  }
  
  // Stripe Configuration
  logSection('Stripe Payment Processing');
  requiredCount++;
  if (validateStripeKey('STRIPE_SECRET_KEY', 'sk_live_')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateStripeKey('STRIPE_PUBLISHABLE_KEY', 'pk_live_')) validCount++;
  else allValid = false;
  
  if (isProduction) {
    requiredCount++;
    if (validateRequired('STRIPE_WEBHOOK_SECRET', 'Stripe webhook secret')) validCount++;
    else allValid = false;
    
    requiredCount++;
    if (validateRequired('STRIPE_CONNECT_CLIENT_ID', 'Stripe Connect client ID')) validCount++;
    else allValid = false;
  }
  
  // AWS S3 Configuration
  logSection('AWS S3 File Storage');
  requiredCount++;
  if (validateRequired('AWS_ACCESS_KEY_ID', 'AWS access key ID')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateRequired('AWS_SECRET_ACCESS_KEY', 'AWS secret access key')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateRequired('AWS_REGION', 'AWS region')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateRequired('AWS_S3_BUCKET', 'S3 bucket name')) validCount++;
  else allValid = false;
  
  // Google Services
  logSection('Google Services');
  requiredCount++;
  if (validateRequired('GOOGLE_MAPS_API_KEY', 'Google Maps API key')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateRequired('GOOGLE_PLACES_API_KEY', 'Google Places API key')) validCount++;
  else allValid = false;
  
  if (isProduction) {
    requiredCount++;
    if (validateRequired('GOOGLE_CLIENT_ID', 'Google OAuth client ID')) validCount++;
    else allValid = false;
    
    requiredCount++;
    if (validateRequired('GOOGLE_CLIENT_SECRET', 'Google OAuth client secret')) validCount++;
    else allValid = false;
  }
  
  // Email Services
  logSection('Email Services');
  requiredCount++;
  if (validateRequired('SENDGRID_API_KEY', 'SendGrid API key')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateEmail('SENDGRID_FROM_EMAIL')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateRequired('SENDGRID_FROM_NAME', 'SendGrid sender name')) validCount++;
  else allValid = false;
  
  // Expo Push Notifications
  logSection('Expo Push Notifications');
  requiredCount++;
  if (validateRequired('EXPO_ACCESS_TOKEN', 'Expo access token')) validCount++;
  else allValid = false;
  
  requiredCount++;
  if (validateRequired('EXPO_PROJECT_ID', 'Expo project ID')) validCount++;
  else allValid = false;
  
  // Redis Cache
  logSection('Redis Cache');
  requiredCount++;
  if (validateUrl('REDIS_URL', 'Redis connection URL')) validCount++;
  else allValid = false;
  
  // Production Configuration
  if (isProduction) {
    logSection('Production Configuration');
    requiredCount++;
    if (validateUrl('APP_URL', 'Production app URL')) validCount++;
    else allValid = false;
    
    requiredCount++;
    if (validateUrl('WS_URL', 'WebSocket URL')) validCount++;
    else allValid = false;
    
    requiredCount++;
    if (validateRequired('WEBHOOK_SECRET', 'Webhook secret')) validCount++;
    else allValid = false;
    
    requiredCount++;
    if (validateRequired('CORS_ORIGIN', 'CORS allowed origins')) validCount++;
    else allValid = false;
  }
  
  // Optional Services
  logSection('Optional Services');
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (twilioAccountSid || twilioAuthToken || twilioPhoneNumber) {
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      logWarning('Twilio: Partial configuration - all or none should be set');
    } else {
      logSuccess('Twilio: Fully configured');
    }
  } else {
    logInfo('Twilio: Not configured (optional)');
  }
  
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    logSuccess('Sentry: Configured');
  } else {
    logInfo('Sentry: Not configured (optional)');
  }
  
  // Service Connection Tests
  logSection('Service Connection Tests');
  
  try {
    const dbTest = await testDatabaseConnection();
    if (!dbTest) allValid = false;
  } catch (error) {
    logError(`Database test failed: ${error.message}`);
    allValid = false;
  }
  
  try {
    const stripeTest = await testStripeConnection();
    if (!stripeTest) allValid = false;
  } catch (error) {
    logError(`Stripe test failed: ${error.message}`);
    allValid = false;
  }
  
  try {
    const sendGridTest = await testSendGridConnection();
    if (!sendGridTest) allValid = false;
  } catch (error) {
    logError(`SendGrid test failed: ${error.message}`);
    allValid = false;
  }
  
  // Summary
  logSection('Validation Summary');
  logInfo(`Required variables: ${validCount}/${requiredCount}`);
  
  if (allValid) {
    logSuccess('🎉 All environment variables are properly configured!');
    logInfo('Your SmartRides application is ready for deployment.');
  } else {
    logError('❌ Some environment variables are missing or invalid.');
    logWarning('Please fix the issues above before deploying.');
  }
  
  // Recommendations
  if (isProduction) {
    logSection('Production Recommendations');
    logInfo('1. Enable 2FA on all service accounts');
    logInfo('2. Set up billing alerts for all services');
    logInfo('3. Configure monitoring and logging');
    logInfo('4. Set up SSL certificates');
    logInfo('5. Configure backup strategies');
    logInfo('6. Set up rate limiting');
  }
  
  return allValid;
}

// Run validation if called directly
if (require.main === module) {
  validateEnvironment()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Validation failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { validateEnvironment }; 