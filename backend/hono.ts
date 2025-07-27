import 'dotenv/config';
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import Stripe from 'stripe';
import { stripeWebhookHandler } from './trpc/routes/payments/process/route';

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' as Stripe.StripeConfig['apiVersion'] });

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Health check endpoint for Railway
app.get("/health", (c) => {
  return c.json({ status: "ok", message: "API is healthy" });
});

app.route('/payments/webhook', stripeWebhookHandler);

// Add server startup for Railway
const port = process.env.PORT || 3000;

if (require.main === module) {
  console.log(`🚀 Server starting on port ${port}...`);
  
  // Simple HTTP server setup
  const { createServer } = require('http');
  const server = createServer((req: any, res: any) => {
    app.fetch(req, res);
  });
  
  server.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

export default app;