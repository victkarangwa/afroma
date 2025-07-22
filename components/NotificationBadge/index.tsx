import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";

interface NotificationBadgeProps {
  count?: number;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showBadge?: boolean;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  onPress,
  size = 'medium',
  showBadge = true
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { iconSize: 20, badgeSize: 16, textSize: 10 };
      case 'large':
        return { iconSize: 28, badgeSize: 20, textSize: 12 };
      default:
        return { iconSize: 24, badgeSize: 18, textSize: 11 };
    }
  };

  const { iconSize, badgeSize, textSize } = getSizeStyles();

  return (
    <TouchableOpacity
      style={[tw.relative]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons 
        name="notifications-outline" 
        size={iconSize} 
        color="#6b7280" 
      />
      
      {showBadge && count > 0 && (
        <View style={[
          tw.absolute,
          tw.bgPink700,
          tw.roundedFull,
          tw.justifyCenter,
          tw.itemsCenter,
          { 
            width: badgeSize, 
            height: badgeSize, 
            top: -badgeSize / 2, 
            right: -badgeSize / 2,
            minWidth: badgeSize
          }
        ]}>
          <Text style={[
            tw.textWhite,
            tw.fontBold,
            { fontSize: textSize }
          ]}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBadge; 