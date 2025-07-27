#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const requiredVars = {
  // Database
  'DATABASE_URL': 'Database connection string',
  
  // Security
  'JWT_SECRET': 'JWT secret key (should be long and random)',
  
  // Stripe
  'STRIPE_SECRET_KEY': 'Stripe secret key (should start with sk_live_ for production)',
  'STRIPE_PUBLISHABLE_KEY': 'Stripe publishable key (should start with pk_live_ for production)',
  
  // AWS S3
  'AWS_ACCESS_KEY_ID': 'AWS access key ID',
  'AWS_SECRET_ACCESS_KEY': 'AWS secret access key',
  'AWS_S3_BUCKET': 'AWS S3 bucket name',
  
  // Google
  'GOOGLE_MAPS_API_KEY': 'Google Maps API key',
  
  // Email
  'SENDGRID_API_KEY': 'SendGrid API key',
  'SENDGRID_FROM_EMAIL': 'Sender email address',
  
  // Expo
  'EXPO_ACCESS_TOKEN': 'Expo access token',
  'EXPO_PROJECT_ID': 'Expo project ID'
};

const warnings = [];
const errors = [];

console.log('🔍 Validating Environment Variables...\n');

// Check required variables
Object.entries(requiredVars).forEach(([key, description]) => {
  const value = process.env[key];
  
  if (!value || value.includes('...') || value.includes('your_')) {
    errors.push(`❌ ${key}: ${description} - Missing or contains placeholder`);
  } else {
    console.log(`✅ ${key}: Configured`);
  }
});

// Production-specific checks
if (process.env.NODE_ENV === 'production') {
  // Check Stripe keys are live
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    warnings.push(`⚠️  STRIPE_SECRET_KEY: Using test key in production`);
  }
  
  if (process.env.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
    warnings.push(`⚠️  STRIPE_PUBLISHABLE_KEY: Using test key in production`);
  }
  
  // Check JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push(`⚠️  JWT_SECRET: Should be at least 32 characters long`);
  }
  
  // Check database is not SQLite
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
    errors.push(`❌ DATABASE_URL: Using SQLite in production - switch to PostgreSQL`);
  }
  
  // Check URLs are HTTPS
  if (process.env.APP_URL && !process.env.APP_URL.startsWith('https://')) {
    warnings.push(`⚠️  APP_URL: Should use HTTPS in production`);
  }
}

// Display results
console.log('\n' + '='.repeat(50));

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(warning));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach(error => console.log(error));
  console.log('\n🚨 Please fix the errors above before deploying to production.');
  process.exit(1);
} else {
  console.log('\n🎉 All required environment variables are configured!');
  
  if (warnings.length > 0) {
    console.log('⚠️  Please review the warnings above.');
  } else {
    console.log('✅ Ready for production deployment!');
  }
}