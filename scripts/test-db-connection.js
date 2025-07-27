#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Database version:', result[0].version);
    
    // Check if tables exist (this will fail if schema isn't pushed yet)
    try {
      const userCount = await prisma.user.count();
      console.log('👥 Current user count:', userCount);
    } catch (error) {
      console.log('⚠️  Tables not found - you need to run: npx prisma db push');
    }
    
    console.log('🎉 Database setup is working correctly!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check your DATABASE_URL in .env file');
      console.log('2. Ensure your database server is running');
      console.log('3. Verify network connectivity');
      console.log('4. Check firewall settings');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection();