import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Create a client for React Query
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.gray[50],
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            title: "Login",
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="auth/signup" 
          options={{ 
            title: "Sign Up",
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="ride/[id]" 
          options={{ 
            title: "Ride Details",
          }} 
        />
        <Stack.Screen 
          name="book/index" 
          options={{ 
            title: "Book a Ride",
          }} 
        />
        <Stack.Screen 
          name="book/solo" 
          options={{ 
            title: "Solo Booking",
          }} 
        />
        <Stack.Screen 
          name="book/group" 
          options={{ 
            title: "Group Booking",
          }} 
        />
        <Stack.Screen 
          name="book/confirmation" 
          options={{ 
            title: "Booking Confirmation",
          }} 
        />
        <Stack.Screen 
          name="chat/[id]" 
          options={{ 
            title: "Chat",
          }} 
        />
        <Stack.Screen 
          name="payment-methods/index" 
          options={{ 
            title: "Payment Methods",
          }} 
        />
      </Stack>
    </>
  );
}