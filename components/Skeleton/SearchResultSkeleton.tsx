import React from 'react';
import { View } from 'react-native';
import { tw } from 'react-native-tailwindcss';

const SearchResultSkeleton: React.FC = () => {
  return (
    <View style={[tw.p4, tw.borderB, tw.borderGray100]}>
      <View style={[tw.flexRow, tw.itemsCenter]}>
        {/* Avatar skeleton */}
        <View style={[tw.w10, tw.h10, tw.roundedFull, tw.bgGray200, tw.mR3]} />
        <View style={[tw.flex1]}>
          {/* Name skeleton */}
          <View style={[tw.w32, tw.h4, tw.bgGray200, tw.rounded, tw.mB2]} />
          {/* Content skeleton */}
          <View style={[tw.wFull, tw.h3, tw.bgGray200, tw.rounded, tw.mB1]} />
          <View style={[tw.w2_3, tw.h3, tw.bgGray200, tw.rounded]} />
        </View>
        {/* Chevron skeleton */}
        <View style={[tw.w5, tw.h5, tw.bgGray200, tw.rounded]} />
      </View>
    </View>
  );
};

export default SearchResultSkeleton; 