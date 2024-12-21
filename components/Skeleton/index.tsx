import React from "react";
import { View } from "react-native";
import { Skeleton } from "@rneui/themed";
import { tw } from "react-native-tailwindcss";

const Placeholder: React.FC = () => {
  return (
    <View style={[tw.bgWhite, tw.h3_4, tw.m4, tw.rounded, tw.pX4]}>
      <View style={[tw.flex, tw.flexRow, tw.justifyBetween, tw.itemsCenter]}>
        <Skeleton
          height={50}
          width={50}
          animation="pulse"
          style={[tw.bgWhite, tw.roundedFull, tw.mY2]}
          skeletonStyle={[tw.bgGray300]}
        />
        <View style={[tw.flex, tw.w10_12]}>
          <Skeleton
            height={15}
            animation="pulse"
            style={[tw.bgWhite, tw.roundedLg, tw.mY2]}
            skeletonStyle={[tw.bgGray300]}
          />
          <Skeleton
            height={10}
            animation="pulse"
            style={[tw.bgWhite, tw.roundedLg]}
            skeletonStyle={[tw.bgGray300, tw.w1_2]}
          />
        </View>
      </View>
      <View style={[]}>

        <Skeleton
          height={70}
          animation="pulse"
          style={[tw.bgWhite, tw.roundedLg, tw.mY2]}
          skeletonStyle={[tw.bgGray300]}
        />

        <View style={[tw.flex, tw.flexRow, tw.justifyBetween]}>
          {[1, 2, 3].map((it, index) => (
            <Skeleton
              key={index}
              height={30}
              width={30}
              animation="pulse"
              style={[tw.bgWhite, tw.roundedFull, tw.mY2]}
              skeletonStyle={[tw.bgGray300]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default Placeholder;
