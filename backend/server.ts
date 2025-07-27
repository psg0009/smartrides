import { serve } from '@hono/node-server';
import app from './hono';

const port = process.env.PORT || 3000;

console.log(`🚀 Server starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port: parseInt(port.toString()),
});

console.log(`✅ Server running on http://localhost:${port}`); 