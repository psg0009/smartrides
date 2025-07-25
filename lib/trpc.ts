import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/backend/trpc/app-router';
import { useAuthStore } from '@/store/auth-store';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/trpc',
      transformer: superjson,
      headers: () => {
        const jwt = useAuthStore.getState().jwt;
        return jwt ? { Authorization: `Bearer ${jwt}` } : {};
      },
    }),
  ],
});