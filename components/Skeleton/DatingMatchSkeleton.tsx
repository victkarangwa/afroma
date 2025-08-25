import React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const DatingMatchSkeleton: React.FC = () => {
  return (
    <View style={[tw.bgWhite, tw.roundedXl, tw.shadow, tw.m4, { height: 400 }]}>
      {/* Image skeleton */}
      <View style={[tw.flex1, tw.roundedT2xl, tw.bgGray200]} />
      
      {/* Content overlay */}
      <View style={[tw.absolute, tw.bottom0, tw.left0, tw.right0, tw.p4, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        {/* Name and age skeleton */}
        <View style={[tw.flexRow, tw.itemsCenter, tw.mB2]}>
          <View style={[tw.w32, tw.h5, tw.bgGray300, tw.rounded, tw.mR2]} />
          <View style={[tw.w8, tw.h4, tw.bgGray300, tw.rounded]} />
        </View>
        
        {/* Bio skeleton */}
        <View style={[tw.wFull, tw.h3, tw.bgGray300, tw.rounded, tw.mB1]} />
        <View style={[tw.w3_4, tw.h3, tw.bgGray300, tw.rounded, tw.mB2]} />
        
        {/* Distance skeleton */}
        <View style={[tw.w20, tw.h3, tw.bgGray300, tw.rounded, tw.mB2]} />
        
        {/* Matching rate skeleton */}
        <View style={[tw.w16, tw.h4, tw.bgGray300, tw.rounded]} />
      </View>
    </View>
  );
};

export default DatingMatchSkeleton; 