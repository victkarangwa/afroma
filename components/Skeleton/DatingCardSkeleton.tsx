import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const { width: screenWidth } = Dimensions.get('window');

const DatingCardSkeleton: React.FC = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
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
    <View style={[
      tw.bgWhite, 
      tw.roundedL, 
      tw.shadowLg, 
      tw.overflowHidden,
      tw.wFull,
      tw.hFull,
      { maxWidth: screenWidth - 32, maxHeight: 600 }
    ]}>
      {/* Image skeleton with gradient overlay */}
      <View style={[tw.flex1, tw.relative]}>
        <Animated.View style={[tw.flex1, tw.bgGray300, shimmerStyle]} />
        
        {/* Gradient overlay for better contrast (matching DatingCard) */}
        <View style={[
          tw.absolute,
          tw.inset0,
          { backgroundColor: 'rgba(0,0,0,0.2)' }
        ]} />
        
        {/* Match percentage badge placeholder (top right) */}
        <Animated.View style={[
          tw.absolute,
          { top: 16, right: 16 },
          tw.w16,
          tw.h16,
          tw.roundedFull,
          tw.bgGray400,
          shimmerStyle
        ]} />
      </View>
      
      {/* Profile Info Card at bottom (matching DatingCard position) */}
      <View style={[tw.absolute, tw.left0, tw.right0, tw.p6, { bottom: 80 }]}>
        <View style={[
          tw.roundedL, 
          tw.p4, 
          tw.shadow,
          { backgroundColor: 'rgba(251, 108, 49, 0.3)' }
        ]}>
          {/* Name and age skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.mB3]}>
            <View style={[tw.flex1]}>
              <Animated.View style={[tw.w48, tw.h8, tw.bgWhite, tw.rounded, tw.mB2, { opacity: 0.5 }, shimmerStyle]} />
              <Animated.View style={[tw.w32, tw.h6, tw.bgWhite, tw.rounded, { opacity: 0.5 }, shimmerStyle]} />
            </View>
          </View>
          
          {/* Distance and Gender skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Animated.View style={[tw.w24, tw.h5, tw.bgWhite, tw.roundedFull, { opacity: 0.5 }, shimmerStyle]} />
            </View>
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Animated.View style={[tw.w16, tw.h5, tw.bgWhite, tw.roundedFull, { opacity: 0.5 }, shimmerStyle]} />
            </View>
          </View>
        </View>
      </View>
      
      {/* Action buttons placeholder at bottom */}
      <View style={[tw.absolute, tw.bottom0, tw.left0, tw.right0, tw.flexRow, tw.justifyAround, tw.p4]}>
        <Animated.View style={[tw.w16, tw.h16, tw.roundedFull, tw.bgGray400, shimmerStyle]} />
        <Animated.View style={[tw.w20, tw.h20, tw.roundedFull, tw.bgGray400, shimmerStyle]} />
        <Animated.View style={[tw.w16, tw.h16, tw.roundedFull, tw.bgGray400, shimmerStyle]} />
      </View>
    </View>
  );
};

export default DatingCardSkeleton; 