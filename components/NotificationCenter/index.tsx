import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Mock notification data
export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'connection_request',
    title: 'New Connection Request',
    message: 'Linda Mensah wants to connect with you',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    timestamp: '2m ago',
    isRead: false,
    action: 'accept_decline'
  },
  {
    id: 2,
    type: 'like',
    title: 'New Like',
    message: 'Sarah Chen liked your post about African Tech Summit',
    avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
    timestamp: '5m ago',
    isRead: false,
    action: 'view_post'
  },
  {
    id: 3,
    type: 'comment',
    title: 'New Comment',
    message: 'David Martinez commented on your post',
    avatar: 'https://randomuser.me/api/portraits/men/16.jpg',
    timestamp: '10m ago',
    isRead: true,
    action: 'view_comment'
  },
  {
    id: 4,
    type: 'message',
    title: 'New Message',
    message: 'Kwame Boateng sent you a message',
    avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
    timestamp: '15m ago',
    isRead: false,
    action: 'view_message'
  },
  {
    id: 5,
    type: 'event',
    title: 'Event Reminder',
    message: 'African Tech Summit starts in 2 hours',
    avatar: null,
    timestamp: '1h ago',
    isRead: true,
    action: 'view_event'
  },
  {
    id: 6,
    type: 'match',
    title: 'New Match',
    message: 'You and Emma Gasana liked each other!',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    timestamp: '2h ago',
    isRead: false,
    action: 'view_profile'
  },
  {
    id: 7,
    type: 'system',
    title: 'Profile Update',
    message: 'Your profile has been successfully updated',
    avatar: null,
    timestamp: '3h ago',
    isRead: true,
    action: 'none'
  },
  {
    id: 8,
    type: 'recommendation',
    title: 'Recommended Connection',
    message: 'Based on your interests, you might like to connect with Fatima Diallo',
    avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
    timestamp: '4h ago',
    isRead: true,
    action: 'view_profile'
  }
];

export type Notification = typeof MOCK_NOTIFICATIONS[0];

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  onNotificationPress?: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  visible,
  onClose,
  onNotificationPress
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  if (!visible) return null;

  const handleBackPress = () => {
    if (onClose) {
      onClose();
    } else {
      // Default back navigation
      router.back();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection_request':
        return { name: 'person-add', color: '#3b82f6' };
      case 'like':
        return { name: 'heart', color: '#ef4444' };
      case 'comment':
        return { name: 'chatbubble', color: '#10b981' };
      case 'message':
        return { name: 'mail', color: '#8b5cf6' };
      case 'event':
        return { name: 'calendar', color: '#f59e0b' };
      case 'match':
        return { name: 'sparkles', color: '#ec4899' };
      case 'system':
        return { name: 'settings', color: '#6b7280' };
      case 'recommendation':
        return { name: 'bulb', color: '#f97316' };
      default:
        return { name: 'notifications', color: '#6b7280' };
    }
  };

  const getFilteredNotifications = () => {
    if (activeFilter === 'unread') {
      return notifications.filter(notification => !notification.isRead);
    }
    return notifications;
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (onNotificationPress) {
      onNotificationPress(notification);
    } else {
      // Default handling
      switch (notification.action) {
        case 'accept_decline':
          Alert.alert(
            'Connection Request',
            'Would you like to accept this connection request?',
            [
              { text: 'Decline', style: 'cancel' },
              { text: 'Accept', onPress: () => console.log('Connection accepted') }
            ]
          );
          break;
        case 'view_post':
        case 'view_comment':
        case 'view_message':
        case 'view_event':
        case 'view_profile':
          console.log(`Navigate to ${notification.action}`);
          break;
        default:
          console.log('Notification pressed:', notification);
      }
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          tw.bgWhite,
          tw.p4,
          tw.mB2,
          tw.roundedLg,
          tw.shadow,
          tw.mX4,
          !item.isRead && tw.borderL4,
          !item.isRead && { borderLeftColor: '#fb6c31' }
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[tw.flexRow, tw.itemsStart]}>
          {/* Avatar or Icon */}
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              style={[tw.w12, tw.h12, tw.roundedFull, tw.mR3]}
            />
          ) : (
            <View style={[
              tw.w12, 
              tw.h12, 
              tw.roundedFull, 
              tw.mR3, 
              tw.justifyCenter, 
              tw.itemsCenter,
              { backgroundColor: `${icon.color}20` }
            ]}>
              <Ionicons name={icon.name as any} size={20} color={icon.color} />
            </View>
          )}

          {/* Content */}
          <View style={[tw.flex1]}>
            <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
              <Text style={[
                tw.textGray900, 
                tw.fontMedium, 
                tw.textBase,
                !item.isRead && tw.fontBold
              ]}>
                {item.title}
              </Text>
              <Text style={[tw.textGray400, tw.textXs]}>{item.timestamp}</Text>
            </View>
            <Text style={[
              tw.textGray600, 
              tw.textSm, 
              tw.mT1,
              !item.isRead && tw.fontMedium
            ]} numberOfLines={2}>
              {item.message}
            </Text>
          </View>

          {/* Unread indicator */}
          {!item.isRead && (
            <View style={[tw.w2, tw.h2, tw.roundedFull, tw.bgPink700, tw.mL2]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={[tw.flex1, tw.bgGray100]}>
      {/* Header */}
      <View style={[tw.bgWhite, tw.pX4, tw.pT4, tw.pB2, tw.shadow]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.mB4]}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={[tw.textGray900, tw.fontBold, tw.textLg]}>Notifications</Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[tw.textBlue500, tw.fontMedium]}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={[tw.flexRow, tw.bgGray100, tw.roundedLg, tw.p1]}>
          <TouchableOpacity
            style={[
              tw.flex1,
              tw.pY2,
              tw.roundedLg,
              tw.itemsCenter,
              activeFilter === 'all' ? tw.bgWhite : tw.bgTransparent
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[
              tw.fontMedium,
              activeFilter === 'all' ? tw.textGray900 : tw.textGray600
            ]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw.flex1,
              tw.pY2,
              tw.roundedLg,
              tw.itemsCenter,
              activeFilter === 'unread' ? tw.bgWhite : tw.bgTransparent
            ]}
            onPress={() => setActiveFilter('unread')}
          >
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Text style={[
                tw.fontMedium,
                activeFilter === 'unread' ? tw.textGray900 : tw.textGray600
              ]}>
                Unread
              </Text>
              {unreadCount > 0 && (
                <View style={[
                  tw.bgPink700, 
                  tw.roundedFull, 
                  tw.pX2, 
                  tw.pY1, 
                  tw.mL2
                ]}>
                  <Text style={[tw.textWhite, tw.textXs, tw.fontBold]}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: 20 }]}
        ListEmptyComponent={
          <View style={[tw.itemsCenter, tw.pT20]}>
            <Ionicons name="notifications-off" size={48} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4]}>
              No notifications
            </Text>
            <Text style={[tw.textGray400, tw.textSm, tw.mT2, tw.textCenter]}>
              {activeFilter === 'unread' ? 'You\'re all caught up!' : 'You\'ll see notifications here'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default NotificationCenter; 