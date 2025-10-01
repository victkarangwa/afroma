import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const ForumPostSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={[tw.bgWhite, tw.roundedLg, tw.m2, tw.p4, tw.shadow]}>
      {/* Header with avatar and user info */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.mB4]}>
        {/* Avatar skeleton */}
        <Animated.View style={[
          tw.w12, 
          tw.h12, 
          tw.roundedFull, 
          tw.bgGray200, 
          tw.mR3,
          tw.border2,
          tw.borderGray300,
          shimmerStyle
        ]} />
        
        <View style={[tw.flex1]}>
          {/* Thread title skeleton */}
          <Animated.View style={[tw.w3_4, tw.h5, tw.bgGray200, tw.rounded, tw.mB2, shimmerStyle]} />
          
          {/* User info skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <Animated.View style={[tw.w20, tw.h3, tw.bgGray200, tw.rounded, tw.mR2, shimmerStyle]} />
            <Animated.View style={[tw.w16, tw.h3, tw.bgGray200, tw.rounded, shimmerStyle]} />
          </View>
        </View>
      </View>

      {/* Post content skeleton */}
      <View style={[tw.mB4]}>
        <Animated.View style={[tw.wFull, tw.h4, tw.bgGray200, tw.rounded, tw.mB2, shimmerStyle]} />
        <Animated.View style={[tw.w4_5, tw.h4, tw.bgGray200, tw.rounded, tw.mB2, shimmerStyle]} />
        <Animated.View style={[tw.w3_4, tw.h4, tw.bgGray200, tw.rounded, tw.mB2, shimmerStyle]} />
        <Animated.View style={[tw.w2_3, tw.h4, tw.bgGray200, tw.rounded, shimmerStyle]} />
      </View>

      {/* Engagement section skeleton */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pT3, tw.borderT, tw.borderGray200]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          {/* Like button skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <View style={[tw.w6, tw.h6, tw.bgGray200, tw.rounded, tw.mR2]} />
            <View style={[tw.w8, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
          
          {/* Comment button skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <View style={[tw.w6, tw.h6, tw.bgGray200, tw.rounded, tw.mR2]} />
            <View style={[tw.w8, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
          
          {/* Share button skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <View style={[tw.w6, tw.h6, tw.bgGray200, tw.rounded, tw.mR2]} />
            <View style={[tw.w8, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
        </View>
        
        {/* Views count skeleton */}
        <View style={[tw.w12, tw.h3, tw.bgGray200, tw.rounded]} />
      </View>
    </View>
  );
};

export default ForumPostSkeleton;
