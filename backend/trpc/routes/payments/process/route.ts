import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import Stripe from 'stripe';
import 'dotenv/config';
import { Hono } from 'hono';

const processPaymentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(["card", "university", "paypal"]),
  amount: z.number().positive(),
  driverFare: z.number().positive(),
  serviceFee: z.number().positive(),
  driverStripeAccountId: z.string(),
  cardDetails: z.object({
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    cardholderName: z.string().optional(),
  }).optional(),
  universityAccount: z.object({
    studentId: z.string().optional(),
    accountNumber: z.string().optional(),
  }).optional(),
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' as Stripe.StripeConfig['apiVersion'] });

export default publicProcedure
  .input(processPaymentSchema)
  .mutation(async ({ input }) => {
    if (input.paymentMethod !== 'card') {
      throw new Error('Only card payments are supported via Stripe at this time.');
    }
    // Create a PaymentIntent with Stripe Connect split
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100), // total amount (driver fare + fee)
      currency: 'usd',
      application_fee_amount: Math.round(input.serviceFee * 100),
      transfer_data: {
        destination: input.driverStripeAccountId,
      },
      metadata: {
        bookingId: input.bookingId,
        driverFare: input.driverFare.toString(),
        serviceFee: input.serviceFee.toString(),
      },
    });
    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      message: 'Stripe payment intent created',
    };
  });

export const onboardDriverProcedure = publicProcedure
  .input(z.object({ driverId: z.string() }))
  .mutation(async ({ input }) => {
    // In a real app, you would look up or create a Stripe account for the driver
    // For demo, always create a new account
    const account = await stripe.accounts.create({
      type: 'express',
      metadata: { driverId: input.driverId },
    });
    const origin = process.env.PLATFORM_URL || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/driver/onboard/refresh`,
      return_url: `${origin}/driver/onboard/return`,
      type: 'account_onboarding',
    });
    return {
      url: accountLink.url,
      accountId: account.id,
    };
  });

export const initiatePayoutProcedure = publicProcedure
  .input(z.object({ accountId: z.string(), amount: z.number().positive() }))
  .mutation(async ({ input }) => {
    // In a real app, validate account ownership and balance
    const payout = await stripe.payouts.create({
      amount: Math.round(input.amount * 100),
      currency: 'usd',
      destination: input.accountId,
    });
    return {
      payoutId: payout.id,
      status: payout.status,
    };
  });

export const stripeWebhookHandler = new Hono().post('/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return c.json({ error: `Webhook Error: ${(err as Error).message}` }, 400);
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // TODO: Mark booking as paid in your DB
      break;
    case 'payment_intent.payment_failed':
      // TODO: Handle failed payment
      break;
    // ... handle other event types
    default:
      break;
  }
  return c.json({ received: true });
});