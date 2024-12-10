import TextComponent from "@/components/Text";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";

const SearchScreen: React.FC = () => {
  return (
    <SafeAreaView style={[]}>
      <View style={[tw.bgPink100, tw.hFull, tw.flex, tw.itemsCenter]}>
        <TextComponent style={{}}>Search Screen</TextComponent>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
