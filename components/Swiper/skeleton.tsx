import React from "react";
import { View } from "react-native";
import { Skeleton } from "@rneui/themed";
import { tw } from "react-native-tailwindcss";

const Placeholder: React.FC = () => {
  return (
    <View style={[tw.bgWhite, { width: "90%" }, tw.h3_4, tw.m4, tw.rounded]}>
      <View style={[tw.pX4]}>
        <Skeleton
          height={300}
          animation="pulse"
          style={[tw.bgWhite, tw.mY4, tw.roundedLg, tw.wFull]}
          skeletonStyle={[tw.bgGray300]}
        />
        <Skeleton
          height={20}
          animation="pulse"
          style={[tw.bgWhite, tw.roundedLg]}
          skeletonStyle={[tw.bgGray300]}
        />
        <Skeleton
          height={20}
          animation="pulse"
          style={[tw.bgWhite, tw.mY4, tw.roundedLg, tw.w3_5]}
          skeletonStyle={[tw.bgGray300]}
        />
        <Skeleton
          height={20}
          animation="pulse"
          style={[tw.bgWhite, tw.roundedLg, tw.w3_5]}
          skeletonStyle={[tw.bgGray300]}
        />

        <View style={[tw.flex, tw.flexRow, tw.justifyAround]}>
          {[1, 2, 3].map((it, index) => (
            <Skeleton
              key={index}
              height={50}
              width={50}
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
