import { serve } from '@hono/node-server';
import app from './hono';

const port = process.env.PORT || 3000;

console.log(`🚀 Server starting on port ${port}...`);
console.log(`📡 Environment: ${process.env.NODE_ENV}`);
console.log(`🔧 Port: ${port}`);

try {
  serve({
    fetch: app.fetch,
    port: parseInt(port.toString()),
  });
  
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`🏥 Health check available at: http://localhost:${port}/api`);
} catch (error) {
  console.error(`❌ Server failed to start:`, error);
  process.exit(1);
} 