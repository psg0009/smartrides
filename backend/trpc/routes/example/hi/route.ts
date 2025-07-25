import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ name: z.string().optional().default("world") }))
  .query(({ input }) => {
    return {
      message: `Hi ${input.name}!`,
      timestamp: new Date(),
    };
  });