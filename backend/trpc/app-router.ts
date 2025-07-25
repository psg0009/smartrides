import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createRideRoute from "./routes/rides/create/route";
import listRidesRoute from "./routes/rides/list/route";
import getRideRoute from "./routes/rides/get/route";
import createBookingRoute from "./routes/bookings/create/route";
import listBookingsRoute from "./routes/bookings/list/route";
import processPayment, { onboardDriverProcedure, initiatePayoutProcedure } from './routes/payments/process/route';
import createRatingRoute from "./routes/ratings/create/route";
import getRatingsRoute from "./routes/ratings/get/route";
import uploadVerificationRoute from './routes/verification/upload';
import adminVerificationRoute from './routes/verification/admin';
import createRequestRoute from './routes/requests/create';
import listRequestsRoute from './routes/requests/list';
import respondRequestRoute from './routes/requests/respond';
import offerConfirmRoute from './routes/requests/offer';
import { getById as getRequestById } from './routes/requests/list';
import { getOfferById } from './routes/requests/respond';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import s3Routes from './routes/s3';

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  rides: createTRPCRouter({
    create: createRideRoute,
    list: listRidesRoute,
    get: getRideRoute,
  }),
  bookings: createTRPCRouter({
    create: createBookingRoute,
    list: listBookingsRoute,
  }),
  payments: createTRPCRouter({
    process: processPayment,
    onboardDriver: onboardDriverProcedure,
    initiatePayout: initiatePayoutProcedure,
  }),
  ratings: createTRPCRouter({
    create: createRatingRoute,
    get: getRatingsRoute,
  }),
  verification: createTRPCRouter({
    upload: uploadVerificationRoute,
    admin: adminVerificationRoute,
  }),
  requests: createTRPCRouter({
    create: createRequestRoute,
    list: listRequestsRoute,
    getById: getRequestById,
    respond: respondRequestRoute,
    offer: offerConfirmRoute,
    getOfferById: getOfferById,
  }),
  s3: s3Routes,
  auth: authRoutes,
  admin: adminRoutes,
});

export type AppRouter = typeof appRouter;