import React, { useState } from 'react';
import { View, Image, ImageStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';

interface ImageWithFallbackProps {
  source: { uri: string };
  style: ImageStyle | ViewStyle | any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onPress?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  style,
  resizeMode = 'cover',
  onPress
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={[style, tw.bgGray200, tw.justifyCenter, tw.itemsCenter]}>
        <Ionicons name="camera-outline" size={32} color="#9ca3af" />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
      onPress={onPress}
    />
  );
};

export default ImageWithFallback; 