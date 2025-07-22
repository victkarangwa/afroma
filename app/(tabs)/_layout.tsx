import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { tw } from "react-native-tailwindcss";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].activeText,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].inactiveText,
        headerShown: false,
        // tabBarStyle: {
        //   backgroundColor: "#1d1b2c",
        // },
        tabBarStyle: {
          backgroundColor: '#111827', // Set background color
          borderTopColor: 'transparent',
          position: 'absolute', // Ensures the bar is "detached"
          bottom: 10, // Position above the bottom of the screen
          marginHorizontal: 10, // Add space on the sides
          paddingVertical: 5, // Add padding between the bar and the screen
          borderRadius: 10, // Round the edges
          shadowColor: '#000', // Add shadow for iOS
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5, // Add shadow for Android
          height: 60, // Set the height
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
              name={focused ? "chatbubble" : "chatbubble-outline"}
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
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
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
