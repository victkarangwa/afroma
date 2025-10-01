import React, { useState, useMemo } from 'react';
import { View, Image, ImageStyle, ViewStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';

interface ImageWithFallbackProps {
  source: { uri: string } | null | undefined;
  style: ImageStyle | ViewStyle | any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onPress?: () => void;
  fallbackSource?: any;
  priority?: 'low' | 'normal' | 'high';
  cache?: 'immutable' | 'web' | 'memory' | 'disk' | 'disk-sync';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  style,
  resizeMode = 'cover',
  onPress,
  fallbackSource,
  priority = 'normal',
  cache = 'memory'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the optimized source object to prevent unnecessary re-renders
  const optimizedSource = useMemo(() => {
    if (!source?.uri) return source;
    
    return {
      ...source,
      cache,
      priority,
      // Add query parameters for better caching
      uri: source.uri.includes('?') 
        ? `${source.uri}&w=800&q=80` // Add width and quality parameters if not present
        : `${source.uri}?w=800&q=80`
    };
  }, [source, cache, priority]);

  // If no source or error occurred, show fallback
  if (!source || hasError) {
    if (fallbackSource) {
      return (
        <Image
          source={fallbackSource}
          style={style}
          resizeMode={resizeMode}
        />
      );
    }
    return (
      <View style={[style, tw.bgGray200, tw.justifyCenter, tw.itemsCenter]}>
        <Ionicons name="camera-outline" size={32} color="#9ca3af" />
      </View>
    );
  }

  return (
    <View style={[style, tw.relative]}>
      {isLoading && (
        <View style={[tw.absolute, tw.inset0, tw.bgGray200, tw.justifyCenter, tw.itemsCenter, { zIndex: 1 }]}>
          <ActivityIndicator size="small" color="#fb6c31" />
        </View>
      )}
      <Image
        source={optimizedSource}
        style={style}
        resizeMode={resizeMode}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        onLoadStart={() => setIsLoading(true)}
        onPress={onPress}
        // Performance optimizations
        fadeDuration={200}
        progressiveRenderingEnabled={true}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default ImageWithFallback; 