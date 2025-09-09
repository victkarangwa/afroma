import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';
import { DatingMatch } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

interface DatingCardProps {
  profile: DatingMatch;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isTopCard: boolean;
}

const DatingCard: React.FC<DatingCardProps> = ({ profile, onSwipe, isTopCard }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;
  const superLikeOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: (_, gesture) => {
      pan.setValue({ x: gesture.dx, y: gesture.dy });
      
      // Calculate rotation based on horizontal movement
      const rotation = gesture.dx / screenWidth * 0.3;
      rotate.setValue(rotation);
      
      // Calculate scale based on movement
      const scaleValue = 1 - Math.abs(gesture.dx) / screenWidth * 0.05;
      scale.setValue(scaleValue);
      
      // Show action indicators based on swipe direction
      const swipeThreshold = screenWidth * 0.2;
      
      if (gesture.dx > swipeThreshold) {
        // Swiping right - show LIKE
        likeOpacity.setValue(Math.min((gesture.dx - swipeThreshold) / (screenWidth * 0.3), 1));
        nopeOpacity.setValue(0);
        superLikeOpacity.setValue(0);
      } else if (gesture.dx < -swipeThreshold) {
        // Swiping left - show NOPE
        nopeOpacity.setValue(Math.min((Math.abs(gesture.dx) - swipeThreshold) / (screenWidth * 0.3), 1));
        likeOpacity.setValue(0);
        superLikeOpacity.setValue(0);
      } else if (gesture.dy < -swipeThreshold) {
        // Swiping up - show SUPER LIKE
        superLikeOpacity.setValue(Math.min((Math.abs(gesture.dy) - swipeThreshold) / (screenWidth * 0.3), 1));
        likeOpacity.setValue(0);
        nopeOpacity.setValue(0);
      } else {
        // Reset all indicators
        likeOpacity.setValue(0);
        nopeOpacity.setValue(0);
        superLikeOpacity.setValue(0);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      pan.flattenOffset();
      
      const swipeThreshold = screenWidth * 0.3;
      const superLikeThreshold = screenWidth * 0.4;
      
      // Reset indicators
      likeOpacity.setValue(0);
      nopeOpacity.setValue(0);
      superLikeOpacity.setValue(0);
      
      if (Math.abs(gesture.dx) > swipeThreshold) {
        // Horizontal swipe threshold met
        const direction = gesture.dx > 0 ? 'right' : 'left';
        const toValue = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
        
        Animated.parallel([
          Animated.timing(pan.x, {
            toValue,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipe(direction);
          pan.setValue({ x: 0, y: 0 });
          scale.setValue(1);
          rotate.setValue(0);
        });
      } else if (gesture.dy < -superLikeThreshold) {
        // Super like threshold met
        Animated.parallel([
          Animated.timing(pan.y, {
            toValue: -screenWidth * 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipe('up');
          pan.setValue({ x: 0, y: 0 });
          scale.setValue(1);
          rotate.setValue(0);
        });
      } else {
        // Return to center
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  // Get the featured image or first image
  const getProfileImage = () => {
    if (profile.mediaList && profile.mediaList.length > 0) {
      const featuredImage = profile.mediaList.find(media => media.featured);
      if (featuredImage) {
        return featuredImage.mediaUrl;
      }
      return profile.mediaList[0].mediaUrl;
    }
    return null; // No default image - will use local fallback
  };

  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  };

  // Format matching rate
  const formatMatchingRate = (rate: number) => {
    return `${Math.round(rate * 100)}% match`;
  };

  return (
    <Animated.View
      style={[
        tw.absolute,
        tw.wFull,
        tw.hFull,
        tw.bgWhite,
        tw.roundedL,
        tw.shadowLg,
        tw.overflowHidden,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
            { rotate: rotate.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['-15deg', '0deg', '15deg'],
            })},
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Profile Image Container */}
      <View style={[tw.flex1, tw.wFull, tw.relative]}>
        <Image
          source={getProfileImage() ? { uri: getProfileImage() } : require('../../assets/images/default_avatar.jpg')}
          style={[tw.flex1, tw.wFull]}
          resizeMode="cover"
        />
        
        {/* Image overlay for better contrast */}
        <View style={[
          tw.absolute,
          tw.inset0,
          { backgroundColor: 'rgba(0,0,0,0.2)' }
        ]} />
      </View>
      
      {/* Profile Info Card */}
      <View style={[tw.absolute, tw.bottom0, tw.left0, tw.right0, tw.p6]}>
        <View style={[
          tw.roundedL, 
          tw.p4, 
          tw.shadow,
          { backgroundColor: 'rgba(251, 108, 49, 0.95)' }
        ]}>
          {/* Name and Age */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.mB3]}>
            <View style={[tw.flex1]}>
              <Text style={[tw.textWhite, tw.text2xl, tw.fontBold, tw.trackingWide]}>
                {profile.firstName} {profile.middleName}
              </Text>
              <Text style={[tw.textWhite, tw.textLg, { opacity: 0.9 }]}>
                {profile.age} years old
              </Text>
            </View>
            
            {/* Match percentage badge */}
            <View style={[tw.bgWhite, tw.roundedFull, tw.pX3, tw.pY2, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textSm, tw.fontBold]}>
                {formatMatchingRate(profile.matchingResult.matchingRate)}
              </Text>
            </View>
          </View>
          
          {/* Distance and Gender */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Ionicons name="location" size={16} color="white" />
              <Text style={[tw.textWhite, tw.textBase, tw.mL1, tw.fontMedium]}>
                {formatDistance(profile.distance)}
              </Text>
            </View>
            
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Ionicons 
                name={profile.gender === 'Male' ? 'male' : 'female'} 
                size={18} 
                color="white" 
              />
              <Text style={[tw.textWhite, tw.textBase, tw.mL1, tw.fontMedium]}>
                {profile.gender}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Swipe Action Indicators */}
      {isTopCard && (
        <>
          {/* LIKE Indicator */}
          <Animated.View style={[
            tw.absolute,
            { top: 32, right: 32 },
            tw.bgGreen500,
            tw.roundedL,
            tw.pX6,
            tw.pY3,
            tw.shadowLg,
            {
              opacity: likeOpacity,
              transform: [
                { rotate: rotate.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-15deg', '0deg', '15deg'],
                })},
                { scale: likeOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.1],
                })}
              ]
            }
          ]}>
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Ionicons name="heart" size={24} color="white" />
              <Text style={[tw.textWhite, tw.fontBold, tw.textLg, tw.mL2]}>LIKE</Text>
            </View>
          </Animated.View>
          
          {/* NOPE Indicator */}
          <Animated.View style={[
            tw.absolute,
            { top: 32, left: 32 },
            tw.bgRed500,
            tw.roundedL,
            tw.pX6,
            tw.pY3,
            tw.shadowLg,
            {
              opacity: nopeOpacity,
              transform: [
                { rotate: rotate.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: ['-15deg', '0deg', '15deg'],
                })},
                { scale: nopeOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.1],
                })}
              ]
            }
          ]}>
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Ionicons name="close" size={24} color="white" />
              <Text style={[tw.textWhite, tw.fontBold, tw.textLg, tw.mL2]}>NOPE</Text>
            </View>
          </Animated.View>
          
          {/* BOOKMARK Indicator */}
          <Animated.View style={[
            tw.absolute,
            { top: 80 },
            tw.left0,
            tw.right0,
            tw.itemsCenter,
            tw.bgBlue500,
            tw.roundedL,
            tw.pX6,
            tw.pY3,
            tw.shadowLg,
            { marginHorizontal: 32 },
            {
              opacity: superLikeOpacity,
              transform: [
                { scale: superLikeOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.1],
                })}
              ]
            }
          ]}>
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Ionicons name="bookmark" size={24} color="white" />
              <Text style={[tw.textWhite, tw.fontBold, tw.textLg, tw.mL2]}>BOOKMARK</Text>
            </View>
          </Animated.View>
        </>
      )}
      
      {/* Swipe Instructions (only for top card) */}
      {isTopCard && (
        <View style={[tw.absolute, { top: 16 }, tw.left0, tw.right0, tw.itemsCenter]}>
          <View style={[tw.bgBlack, { opacity: 0.5 }, tw.roundedFull, tw.pX4, tw.pY2]}>
            <Text style={[tw.textWhite, tw.textSm, tw.fontMedium]}>
              Swipe right to like • Swipe left to pass • Swipe up to bookmark
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default DatingCard; 