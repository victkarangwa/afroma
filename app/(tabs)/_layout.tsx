import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { tw } from "react-native-tailwindcss";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fb6c31', // Afroma brand orange
        tabBarInactiveTintColor: '#9ca3af', // Subtle gray for inactive
        headerShown: false,
        // tabBarStyle: {
        //   backgroundColor: "#1d1b2c",
        // },
        tabBarStyle: {
          backgroundColor: '#ffffff', // Clean white background
          borderTopColor: '#e5e7eb', // Subtle border
          borderTopWidth: 1,
          position: 'absolute', // Ensures the bar is "detached"
          bottom: 0, // Position at the very bottom
          marginHorizontal: 20, // Add space on the sides
          paddingTop: 8, // Add padding at the top
          paddingBottom: Platform.OS === 'ios' ? 25 : 20, // Platform-specific bottom padding
          borderRadius: 20, // More rounded edges for modern look
          shadowColor: '#000', // Enhanced shadow for iOS
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8, // Enhanced shadow for Android
          height: Platform.OS === 'ios' ? 95 : 90, // Platform-specific height to accommodate bottom padding
        },

        tabBarLabelStyle: {
          fontSize: 14,
        },
        tabBarIconStyle: {
          color: "#fff",
        },
      }}
      sceneContainerStyle={{ backgroundColor: "#fafaff" }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: () => {
            return null;
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          tabBarLabel: () => {
            return null;
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="forums"
        options={{
          tabBarLabel: () => {
            return null;
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "library" : "library-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: () => {
            return null;
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
