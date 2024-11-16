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
        tabBarStyle: {
          backgroundColor: "#1d1b2c",
        },
        tabBarLabelStyle: {
          fontSize: 14,
          // color: "#fff",
        },
        tabBarIconStyle: {
          color: "#fff",
        },
      }}
      sceneContainerStyle={{backgroundColor: "#fafaff"}}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
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
