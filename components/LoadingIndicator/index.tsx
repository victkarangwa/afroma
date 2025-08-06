import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { tw } from 'react-native-tailwindcss';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading...', 
  size = 'large',
  color = '#fb6c31'
}) => {
  return (
    <View style={[tw.flexRow, tw.itemsCenter, tw.justifyCenter, tw.p4]}>
      <ActivityIndicator size={size} color={color} />
      <Text style={[tw.textGray600, tw.mL2, tw.fontMedium]}>{message}</Text>
    </View>
  );
};

export default LoadingIndicator; 