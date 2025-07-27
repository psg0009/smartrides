#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'magenta');
}

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function checkCommandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkNodeVersion() {
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    if (majorVersion >= 18) {
      logSuccess(`Node.js version: ${version}`);
      return true;
    } else {
      logError(`Node.js version ${version} is too old. Please upgrade to Node.js 18+`);
      return false;
    }
  } catch (error) {
    logError('Node.js is not installed. Please install Node.js 18+');
    return false;
  }
}

function checkGitConfig() {
  try {
    const name = execSync('git config user.name', { encoding: 'utf8' }).trim();
    const email = execSync('git config user.email', { encoding: 'utf8' }).trim();
    if (name && email) {
      logSuccess(`Git configured: ${name} <${email}>`);
      return true;
    } else {
      logWarning('Git not fully configured. Please run:');
      logInfo('git config --global user.name "Your Name"');
      logInfo('git config --global user.email "your.email@example.com"');
      return false;
    }
  } catch (error) {
    logWarning('Git not configured. Please configure git user.name and user.email');
    return false;
  }
}

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  if (fs.existsSync(envPath)) {
    logWarning('.env file already exists. Skipping creation.');
    return true;
  }
  
  if (!fs.existsSync(envExamplePath)) {
    logError('env.example file not found. Please create it first.');
    return false;
  }
  
  try {
    fs.copyFileSync(envExamplePath, envPath);
    logSuccess('Created .env file from env.example');
    return true;
  } catch (error) {
    logError(`Failed to create .env file: ${error.message}`);
    return false;
  }
}

function updateEnvWithGeneratedSecrets() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    logError('.env file not found. Please run setup first.');
    return false;
  }
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Generate secrets if not already set
    const secrets = {
      JWT_SECRET: generateSecret(64),
      NEXTAUTH_SECRET: generateSecret(64),
      WEBHOOK_SECRET: generateSecret(32)
    };
    
    // Update or add secrets
    Object.entries(secrets).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}="${value}"`);
      } else {
        envContent += `\n${key}="${value}"`;
      }
    });
    
    fs.writeFileSync(envPath, envContent);
    logSuccess('Updated .env file with generated secrets');
    return true;
  } catch (error) {
    logError(`Failed to update .env file: ${error.message}`);
    return false;
  }
}

function printServiceSetupInstructions() {
  logHeader('Production Service Setup Instructions');
  
  logSection('1. Database Setup');
  logStep('1.1', 'Railway PostgreSQL (Recommended)');
  logInfo('Visit: https://railway.app');
  logInfo('1. Create account and login');
  logInfo('2. Create new project');
  logInfo('3. Add PostgreSQL service');
  logInfo('4. Copy connection string to DATABASE_URL');
  
  logStep('1.2', 'Alternative: Supabase');
  logInfo('Visit: https://supabase.com');
  logInfo('1. Create account and new project');
  logInfo('2. Go to Settings → Database');
  logInfo('3. Copy connection string');
  
  logSection('2. Stripe Payment Processing');
  logStep('2.1', 'Stripe Account Setup');
  logInfo('Visit: https://stripe.com');
  logInfo('1. Create account or login');
  logInfo('2. Complete business verification');
  logInfo('3. Go to Developers → API Keys');
  logInfo('4. Toggle to "Live data"');
  logInfo('5. Copy Publishable key (pk_live_...)');
  logInfo('6. Copy Secret key (sk_live_...)');
  
  logStep('2.2', 'Stripe Connect Setup');
  logInfo('1. Go to Connect → Settings');
  logInfo('2. Configure platform settings');
  logInfo('3. Copy Connect Client ID (ca_...)');
  
  logStep('2.3', 'Stripe Webhooks');
  logInfo('1. Go to Developers → Webhooks');
  logInfo('2. Add endpoint: https://yourdomain.com/api/webhooks/stripe');
  logInfo('3. Select events: payment_intent.succeeded, payment_intent.payment_failed');
  logInfo('4. Copy webhook secret (whsec_...)');
  
  logSection('3. AWS S3 File Storage');
  logStep('3.1', 'AWS Account Setup');
  logInfo('Visit: https://aws.amazon.com');
  logInfo('1. Create AWS account');
  logInfo('2. Go to S3 service');
  logInfo('3. Create bucket (e.g., "smartrides-prod-uploads")');
  logInfo('4. Configure bucket permissions for public read access');
  
  logStep('3.2', 'IAM User Setup');
  logInfo('1. Go to IAM → Users');
  logInfo('2. Create user "smartrides-s3-user"');
  logInfo('3. Attach policy: AmazonS3FullAccess');
  logInfo('4. Create access key for programmatic access');
  logInfo('5. Copy Access Key ID and Secret Access Key');
  
  logSection('4. Google Services');
  logStep('4.1', 'Google Cloud Setup');
  logInfo('Visit: https://console.cloud.google.com');
  logInfo('1. Create new project "SmartRides"');
  logInfo('2. Enable billing for the project');
  logInfo('3. Go to APIs & Services → Library');
  logInfo('4. Enable these APIs:');
  logInfo('   - Maps JavaScript API');
  logInfo('   - Places API');
  logInfo('   - Geocoding API');
  logInfo('   - Directions API');
  
  logStep('4.2', 'API Keys');
  logInfo('1. Go to APIs & Services → Credentials');
  logInfo('2. Create API Key');
  logInfo('3. Restrict key to your APIs and domains');
  logInfo('4. Copy the API key');
  
  logSection('5. SendGrid Email Service');
  logStep('5.1', 'SendGrid Setup');
  logInfo('Visit: https://sendgrid.com');
  logInfo('1. Create account');
  logInfo('2. Verify your domain');
  logInfo('3. Create API key with Mail Send permissions');
  logInfo('4. Copy API key');
  
  logSection('6. Expo Push Notifications');
  logStep('6.1', 'Expo Setup');
  logInfo('Visit: https://expo.dev');
  logInfo('1. Create account or login');
  logInfo('2. Create new project');
  logInfo('3. Go to Project Settings');
  logInfo('4. Copy Access Token and Project ID');
  
  logSection('7. Redis Cache');
  logStep('7.1', 'Redis Setup');
  logInfo('Option A: Redis Cloud');
  logInfo('Visit: https://redis.com');
  logInfo('1. Create free account');
  logInfo('2. Create database');
  logInfo('3. Copy connection URL');
  
  logInfo('Option B: Railway Redis');
  logInfo('1. In Railway project');
  logInfo('2. Add Redis service');
  logInfo('3. Copy REDIS_URL');
  
  logSection('8. Optional Services');
  logStep('8.1', 'Twilio (SMS)');
  logInfo('Visit: https://twilio.com');
  logInfo('1. Create account');
  logInfo('2. Get Account SID and Auth Token');
  logInfo('3. Purchase phone number');
  
  logStep('8.2', 'Sentry (Error Monitoring)');
  logInfo('Visit: https://sentry.io');
  logInfo('1. Create project');
  logInfo('2. Copy DSN');
  
  logSection('9. Environment Variables');
  logInfo('Update your .env file with all the values from the services above.');
  logInfo('Then run: npm run validate-env:prod');
}

function printNextSteps() {
  logHeader('Next Steps After Service Setup');
  
  logSection('1. Update Environment Variables');
  logInfo('Edit your .env file with all the service credentials');
  
  logSection('2. Validate Configuration');
  logInfo('Run: npm run validate-env:prod');
  
  logSection('3. Database Setup');
  logInfo('Run: npx prisma db push');
  logInfo('Run: npx prisma generate');
  
  logSection('4. Test Application');
  logInfo('Run: npm run dev');
  logInfo('Test all features end-to-end');
  
  logSection('5. Deploy to Production');
  logInfo('Backend: Deploy to Vercel/Railway');
  logInfo('Mobile: Build with Expo Application Services');
  
  logSection('6. Security Checklist');
  logInfo('✅ Enable 2FA on all service accounts');
  logInfo('✅ Set up billing alerts');
  logInfo('✅ Configure monitoring and logging');
  logInfo('✅ Set up SSL certificates');
  logInfo('✅ Configure backup strategies');
  logInfo('✅ Set up rate limiting');
}

function main() {
  logHeader('SmartRides Production Setup Guide');
  
  logInfo('This script will help you set up all required services for production deployment.');
  
  // Check prerequisites
  logSection('Checking Prerequisites');
  
  const nodeOk = checkNodeVersion();
  const gitOk = checkGitConfig();
  
  if (!nodeOk) {
    logError('Please install Node.js 18+ and try again.');
    process.exit(1);
  }
  
  // Create .env file
  logSection('Environment Setup');
  const envCreated = createEnvFile();
  if (envCreated) {
    updateEnvWithGeneratedSecrets();
  }
  
  // Print service setup instructions
  printServiceSetupInstructions();
  
  // Print next steps
  printNextSteps();
  
  logHeader('Setup Complete!');
  logSuccess('Follow the instructions above to configure all services.');
  logInfo('After setting up services, run: npm run validate-env:prod');
}

if (require.main === module) {
  main();
}

module.exports = { main }; 