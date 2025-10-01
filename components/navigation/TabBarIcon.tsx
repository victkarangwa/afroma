// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import Ionicons from '@expo/vector-icons/Ionicons';
import { type IconProps } from '@expo/vector-icons/build/createIconSet';
import { type ComponentProps } from 'react';
import { View } from 'react-native';

export function TabBarIcon({ style, color, ...rest }: IconProps<ComponentProps<typeof Ionicons>['name']>) {
  return (
    <View style={{
      padding: 6,
      borderRadius: 12,
      backgroundColor: color === '#fb6c31' ? 'rgba(251, 108, 49, 0.1)' : 'transparent',
      marginBottom: 4, // Add bottom margin to center the icon better
    }}>
      <Ionicons 
        size={24} 
        color={color}
        style={[{ marginBottom: 0 }, style]} 
        {...rest} 
      />
    </View>
  );
}
