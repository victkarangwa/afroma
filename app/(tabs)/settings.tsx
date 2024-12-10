import TextComponent from "@/components/Text";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";

const SeetingsScreen: React.FC = () => {
  return (
    <SafeAreaView style={[]}>
      <View style={[tw.bgPink100, tw.hFull, tw.flex, tw.itemsCenter]}>
        <TextComponent style={{}}>Settings Screen</TextComponent>
      </View>
    </SafeAreaView>
  );
};

export default SeetingsScreen;
