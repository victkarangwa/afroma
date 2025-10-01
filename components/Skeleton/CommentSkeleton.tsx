import React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const CommentSkeleton: React.FC = () => {
  return (
    <View style={[tw.bgWhite, tw.roundedLg, tw.m2, tw.p4, tw.shadow]}>
      <View style={[tw.flexRow, tw.itemsStart]}>
        {/* Avatar skeleton */}
        <View style={[
          tw.w8, 
          tw.h8, 
          tw.roundedFull, 
          tw.bgGray200, 
          tw.mR3,
          tw.mT1
        ]} />
        
        <View style={[tw.flex1]}>
          {/* Comment header skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.mB2]}>
            <View style={[tw.w20, tw.h3, tw.bgGray200, tw.rounded, tw.mR2]} />
            <View style={[tw.w16, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
          
          {/* Comment content skeleton */}
          <View style={[tw.mB2]}>
            <View style={[tw.wFull, tw.h3, tw.bgGray200, tw.rounded, tw.mB1]} />
            <View style={[tw.w3_4, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
          
          {/* Comment actions skeleton */}
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <View style={[tw.w12, tw.h3, tw.bgGray200, tw.rounded, tw.mR4]} />
            <View style={[tw.w10, tw.h3, tw.bgGray200, tw.rounded]} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentSkeleton;
