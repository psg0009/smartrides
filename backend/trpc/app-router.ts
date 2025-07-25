import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createRideRoute from "./routes/rides/create/route";
import listRidesRoute from "./routes/rides/list/route";
import getRideRoute from "./routes/rides/get/route";
import createBookingRoute from "./routes/bookings/create/route";
import listBookingsRoute from "./routes/bookings/list/route";
import processPaymentRoute from "./routes/payments/process/route";
import createRatingRoute from "./routes/ratings/create/route";
import getRatingsRoute from "./routes/ratings/get/route";

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
    process: processPaymentRoute,
  }),
  ratings: createTRPCRouter({
    create: createRatingRoute,
    get: getRatingsRoute,
  }),
});

export type AppRouter = typeof appRouter;