import TextComponent from "@/components/Text";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";
import ForumScreen from "../forum";

const ForumsScreen: React.FC = () => {
  return (
    <SafeAreaView style={[]}>
      <ForumScreen />
    </SafeAreaView>
  );
};

export default ForumsScreen;
