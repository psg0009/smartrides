import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const getRatingsSchema = z.object({
  userId: z.string(),
  type: z.enum(["driver", "passenger"]).optional(),
});

export default publicProcedure
  .input(getRatingsSchema)
  .query(async ({ input }) => {
    // In a real app, you would fetch from database
    // For now, return mock data
    
    const mockRatings = [
      {
        id: "rating-1",
        rideId: "ride-1",
        raterId: "user-2",
        ratedUserId: input.userId,
        rating: 5,
        comment: "Great driver, very punctual!",
        type: "driver" as const,
        createdAt: "2025-01-20T10:00:00Z",
        raterName: "Sarah Johnson",
      },
      {
        id: "rating-2",
        rideId: "ride-2",
        raterId: "user-3",
        ratedUserId: input.userId,
        rating: 4,
        comment: "Good ride, clean car.",
        type: "driver" as const,
        createdAt: "2025-01-19T15:30:00Z",
        raterName: "Mike Chen",
      },
    ];
    
    const filteredRatings = input.type 
      ? mockRatings.filter(rating => rating.type === input.type)
      : mockRatings;
    
    const averageRating = filteredRatings.length > 0
      ? filteredRatings.reduce((sum, rating) => sum + rating.rating, 0) / filteredRatings.length
      : 0;
    
    return {
      ratings: filteredRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: filteredRatings.length,
    };
  });