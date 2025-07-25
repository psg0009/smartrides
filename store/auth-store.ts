import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { trpcClient } from '@/lib/trpc';

interface AuthState {
  user: User | null;
  jwt: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      jwt: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await trpcClient.auth.login.mutate({ email, password });
          set({ user: { ...res.user, avatar: res.user.avatar || '' }, jwt: res.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },
      signup: async (userData, password) => {
        set({ isLoading: true });
        try {
          const res = await trpcClient.auth.signup.mutate({
            name: userData.name!,
            email: userData.email!,
            password,
            university: userData.university!,
          });
          set({ user: { ...res.user, avatar: res.user.avatar || '' }, jwt: res.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },
      logout: () => {
        set({ user: null, jwt: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);