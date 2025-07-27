import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Define user type
export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  let user: UserPayload | null = null;
  const authHeader = opts.req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // Type guard to ensure decoded is an object with role property
      if (typeof decoded === 'object' && decoded !== null && 'role' in decoded) {
        user = decoded as UserPayload;
      }
    } catch (err) {
      user = null;
    }
  }
  return {
    req: opts.req,
    user,
    isAdmin: user?.role === 'admin',
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Not authenticated');
  }
  return next({ ctx });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'admin') {
    throw new Error('Not authorized (admin only)');
  }
  return next({ ctx });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;