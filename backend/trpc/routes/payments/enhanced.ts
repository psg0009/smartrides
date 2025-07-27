import { z } from 'zod';
import { protectedProcedure } from '../../create-context';
import { prisma } from '../../../prisma';
import Stripe from 'stripe';
import notificationService from '../../../lib/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2025-06-30.basil' as Stripe.StripeConfig['apiVersion'] 
});

// Get user's payment methods
export const getPaymentMethods = protectedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // TODO: Replace with real database query when payment methods model is added
    // For now, return mock data
    const mockPaymentMethods = [
      {
        id: 'pm_1',
        type: 'card' as const,
        last4: '4242',
        brand: 'visa',
        isDefault: true,
      },
      {
        id: 'pm_2',
        type: 'card' as const,
        last4: '5555',
        brand: 'mastercard',
        isDefault: false,
      },
    ];

    return mockPaymentMethods;
  });

// Add payment method
export const addPaymentMethod = protectedProcedure
  .input(z.object({
    type: z.enum(['card', 'university', 'paypal']),
    token: z.string().optional(),
    cardDetails: z.object({
      number: z.string().optional(),
      expMonth: z.number().optional(),
      expYear: z.number().optional(),
      cvc: z.string().optional(),
    }).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    try {
      let paymentMethod;

      if (input.type === 'card') {
        if (input.token) {
          // Attach existing token to customer
          const customer = await getOrCreateStripeCustomer(userId);
          paymentMethod = await stripe.paymentMethods.attach(input.token, {
            customer: customer.id,
          });
        } else if (input.cardDetails) {
          // Create payment method from card details
          paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: input.cardDetails.number!,
              exp_month: input.cardDetails.expMonth!,
              exp_year: input.cardDetails.expYear!,
              cvc: input.cardDetails.cvc!,
            },
          });

          // Attach to customer
          const customer = await getOrCreateStripeCustomer(userId);
          await stripe.paymentMethods.attach(paymentMethod.id, {
            customer: customer.id,
          });
        }
      }

      // TODO: Save payment method to database when model is added
      console.log('Payment method added:', paymentMethod);

      return { success: true, paymentMethod };
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw new Error('Failed to add payment method');
    }
  });

// Remove payment method
export const removePaymentMethod = protectedProcedure
  .input(z.object({
    paymentMethodId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    try {
      // TODO: Implement Stripe integration when package is installed
      console.log('Removing payment method:', input.paymentMethodId);

      return { success: true };
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw new Error('Failed to remove payment method');
    }
  });

// Set default payment method
export const setDefaultPaymentMethod = protectedProcedure
  .input(z.object({
    paymentMethodId: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    try {
      // TODO: Implement Stripe integration when package is installed
      console.log('Setting default payment method:', { userId, paymentMethodId: input.paymentMethodId });

      return { success: true };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw new Error('Failed to set default payment method');
    }
  });

// Get payment history
export const getPaymentHistory = protectedProcedure
  .input(z.object({
    limit: z.number().int().min(1).max(50).default(20),
    offset: z.number().int().min(0).default(0),
  }))
  .query(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Get payments from database
    const payments = await prisma.payment.findMany({
      where: {
        booking: {
          userId,
        },
      },
      include: {
        booking: {
          include: {
            ride: {
              include: {
                driver: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: input.limit,
      skip: input.offset,
    });

    return payments;
  });

// Get payment details
export const getPaymentDetails = protectedProcedure
  .input(z.object({
    paymentId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    const payment = await prisma.payment.findFirst({
      where: {
        id: input.paymentId,
        booking: {
          userId,
        },
      },
      include: {
        booking: {
          include: {
            ride: {
              include: {
                driver: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  });

// Request refund
export const requestRefund = protectedProcedure
  .input(z.object({
    paymentId: z.string(),
    reason: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Get payment
    const payment = await prisma.payment.findFirst({
      where: {
        id: input.paymentId,
        booking: {
          userId,
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Payment cannot be refunded');
    }

    try {
      // TODO: Implement Stripe refund when package is installed
      console.log('Processing refund:', { paymentId: input.paymentId, reason: input.reason });

      // Update payment status
      await prisma.payment.update({
        where: { id: input.paymentId },
        data: { status: 'refunded' },
      });

      // Send notification
      await notificationService.sendPaymentNotification(
        userId,
        payment.amount,
        'sent'
      );

      return { success: true, refund: { id: `ref_${Date.now()}` } };
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Failed to process refund');
    }
  });

// Get payment analytics
export const getPaymentAnalytics = protectedProcedure
  .query(async ({ ctx }) => {
    if (!ctx.user || typeof ctx.user === 'string') {
      throw new Error('User not authenticated');
    }

    const userId = ctx.user.id;

    // Get payment statistics
    const totalPayments = await prisma.payment.count({
      where: {
        booking: {
          userId,
        },
      },
    });

    const totalSpent = await prisma.payment.aggregate({
      where: {
        booking: {
          userId,
        },
        status: 'succeeded',
      },
      _sum: {
        amount: true,
      },
    });

    const recentPayments = await prisma.payment.findMany({
      where: {
        booking: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

      return {
    totalPayments,
    totalSpent: totalSpent._sum.amount || 0,
    recentPayments,
  };
});

// Get Stripe customer or create new one
async function getOrCreateStripeCustomer(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has stripeCustomerId (using type assertion for now)
  const userWithStripe = user as any;
  if (userWithStripe.stripeCustomerId) {
    return await stripe.customers.retrieve(userWithStripe.stripeCustomerId);
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId,
    },
  });

  // Save customer ID to database (using type assertion for now)
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id } as any,
  });

  return customer;
}

export default {
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentHistory,
  getPaymentDetails,
  requestRefund,
  getPaymentAnalytics,
}; 