import React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';

interface PostSkeletonProps {
  showImage?: boolean;
}

const PostSkeleton: React.FC<PostSkeletonProps> = ({ showImage = true }) => {
  return (
    <View style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4]}>
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.pB2]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          {/* Avatar skeleton */}
          <View style={[tw.w10, tw.h10, tw.roundedFull, tw.bgGray200, tw.mR3]} />
          <View>
            {/* Name skeleton */}
            <View style={[tw.w24, tw.h4, tw.bgGray200, tw.rounded, tw.mB1]} />
            {/* Time skeleton */}
            <View style={[tw.w16, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
        </View>
        {/* Bookmark skeleton */}
        <View style={[tw.w6, tw.h6, tw.bgGray200, tw.rounded]} />
      </View>

      {/* Content skeleton */}
      <View style={[tw.pX4, tw.pB3]}>
        <View style={[tw.wFull, tw.h4, tw.bgGray200, tw.rounded, tw.mB2]} />
        <View style={[tw.w3_4, tw.h4, tw.bgGray200, tw.rounded, tw.mB2]} />
        <View style={[tw.w1_2, tw.h4, tw.bgGray200, tw.rounded]} />
      </View>

      {/* Image skeleton */}
      {showImage && (
        <View style={[tw.pX4, tw.pB2]}>
          <View style={[tw.wFull, { height: 240 }, tw.roundedLg, tw.bgGray200]} />
        </View>
      )}

      {/* Engagement metrics skeleton */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pX4, tw.pB4]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <View style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <View style={[tw.w5, tw.h5, tw.bgGray200, tw.rounded, tw.mR1]} />
            <View style={[tw.w8, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
          <View style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <View style={[tw.w5, tw.h5, tw.bgGray200, tw.rounded, tw.mR1]} />
            <View style={[tw.w8, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <View style={[tw.w5, tw.h5, tw.bgGray200, tw.rounded, tw.mR1]} />
            <View style={[tw.w8, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostSkeleton; 