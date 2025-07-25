import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Home, Search, Calendar, User, Plus } from "lucide-react-native";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.gray[200],
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          shadowColor: colors.gray[900],
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: colors.gray[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 4,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: colors.text,
        },
        headerShadowVisible: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "SmartRides",
          tabBarIcon: ({ color, focused }) => (
            <Home 
              size={focused ? 24 : 22} 
              color={color} 
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          headerTitle: "Find Rides",
          tabBarIcon: ({ color, focused }) => (
            <Search 
              size={focused ? 24 : 22} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create-ride"
        options={{
          title: "Offer",
          headerTitle: "Offer a Ride",
          tabBarIcon: ({ color, focused }) => (
            <Plus 
              size={focused ? 24 : 22} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          headerTitle: "My Bookings",
          tabBarIcon: ({ color, focused }) => (
            <Calendar 
              size={focused ? 24 : 22} 
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "My Profile",
          tabBarIcon: ({ color, focused }) => (
            <User 
              size={focused ? 24 : 22} 
              color={color}
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
      />
    </Tabs>
  );
}