import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { tw } from "react-native-tailwindcss";
import TextComponent from "../Text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenContainer = ({
  title,
  bgColor,
  children,
  showHeader,
}: {
  title: string | ReactNode;
  bgColor?: string;
  children: ReactNode;
  showHeader?: boolean;
}) => {
  const router = useRouter();

  return (
    <SafeAreaView style={[]}>
      <View
        style={[bgColor ?? tw.bgPink100, tw.hFull, tw.flex, tw.itemsCenter]}
      >
        {showHeader && (
          <View
            style={[
              tw.flex,
              tw.flexRow,
              tw.justifyBetween,
              tw.itemsCenter,
              tw.wFull,
              tw.pX4,
              tw.pY4,
            ]}
          >
            {/* <TextComponent style={[tw.textWhite, tw.textXl]}>
              {title}
            </TextComponent> */}
            <Image
              source={require("../../assets/images/bonded_logo.png")}
              style={[ tw.w24, tw.h24, tw._m6]}
            />
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Ionicons name="notifications-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
        {children}
      </View>
    </SafeAreaView>
  );
};

export default ScreenContainer;
