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
      const scaleValue = 1 - Math.abs(gesture.dx) / screenWidth * 0.1;
      scale.setValue(scaleValue);
    },
    onPanResponderRelease: (_, gesture) => {
      pan.flattenOffset();
      
      if (Math.abs(gesture.dx) > screenWidth * 0.4) {
        // Swipe threshold met
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
        tw.roundedXl,
        tw.shadow,
        tw.overflowHidden,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
            { rotate: rotate.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['-30deg', '0deg', '30deg'],
            })},
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Profile Image Container */}
      <View style={[tw.flex1, tw.wFull, getProfileImage() ? {} : tw.bgGray100]}>
        <Image
          source={getProfileImage() ? { uri: getProfileImage() } : require('../../assets/images/default_avatar.jpg')}
          style={[
            tw.flex1, 
            tw.wFull,
            getProfileImage() ? {} : { width: '60%', height: '60%', alignSelf: 'center' }
          ]}
          resizeMode={getProfileImage() ? "cover" : "contain"}
          blurRadius={getProfileImage() ? 0 : 2}
        />
      </View>
      
      {/* Gradient Overlay */}
      <View style={[
        tw.absolute,
        tw.bottom0,
        tw.left0,
        tw.right0,
        tw.h32,
        {
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        }
      ]} />
      
      {/* Profile Info */}
      <View style={[tw.absolute, tw.bottom0, tw.left0, tw.right0, tw.p4]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.mB2]}>
          <Text style={[tw.textWhite, tw.textXl, tw.fontBold]}>
            {profile.firstName} {profile.middleName}, {profile.age}
          </Text>
          {/* <View style={[tw.bgPink700, tw.roundedFull, tw.pX2, tw.pY1]}>
            <Text style={[tw.textWhite, tw.textSm, tw.fontBold]}>
              {formatMatchingRate(profile.matchingResult.matchingRate)}
            </Text>
          </View> */}
        </View>
        
        <Text style={[tw.textWhite, tw.textBase, tw.mB2]}>
          {formatDistance(profile.distance)}
        </Text>
        
        {/* Gender indicator */}
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <Ionicons 
            name={profile.gender === 'Male' ? 'male' : 'female'} 
            size={16} 
            color="#fb6c31" 
          />
          <Text style={[tw.textWhite, tw.textSm, tw.mL1]}>
            {profile.gender}
          </Text>
        </View>
      </View>
      
      {/* Swipe Indicators */}
      {/* {isTopCard && (
        <>
          <View style={[
            tw.absolute,
            tw.top8,
            tw.left8,
            tw.bgRed500,
            tw.roundedLg,
            tw.pX4,
            tw.pY2,
            tw.transform,
            { transform: [{ rotate: '-30deg' }] }
          ]}>
            <Text style={[tw.textWhite, tw.fontBold, tw.textLg]}>NOPE</Text>
          </View>
          
          <View style={[
            tw.absolute,
            tw.top8,
            tw.right8,
            tw.bgGreen500,
            tw.roundedLg,
            tw.pX4,
            tw.pY2,
            tw.transform,
            { transform: [{ rotate: '30deg' }] }
          ]}>
            <Text style={[tw.textWhite, tw.fontBold, tw.textLg]}>LIKE</Text>
          </View>
        </>
      )} */}
    </Animated.View>
  );
};

export default DatingCard; 