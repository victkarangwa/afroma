import React, { useState } from "react";
import { View, Text } from "react-native";
import { tw } from "react-native-tailwindcss";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import NotificationCenter, { Notification } from "@/components/NotificationCenter";

const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const [showNotificationCenter, setShowNotificationCenter] = useState(true);

  const handleNotificationPress = (notification: Notification) => {
    console.log('Notification pressed:', notification);
    
    // Handle different notification types
    switch (notification.action) {
      case 'accept_decline':
        // Handle connection request
        break;
      case 'view_post':
        // Navigate to post
        break;
      case 'view_message':
        // Navigate to chat
        router.push('/chats');
        break;
      case 'view_profile':
        // Navigate to profile
        break;
      default:
        console.log('Default notification handling');
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
      <NotificationCenter
        visible={showNotificationCenter}
        onClose={handleClose}
        onNotificationPress={handleNotificationPress}
      />
  );
};

export default NotificationsScreen; 