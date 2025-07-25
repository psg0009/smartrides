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

app.route('/payments/webhook', stripeWebhookHandler);

export default app;