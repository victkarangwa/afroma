import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { tw } from "react-native-tailwindcss";
import { SafeAreaView } from "react-native-safe-area-context";

interface NavBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

const NavBar: React.FC<NavBarProps> = ({ title, showBack = false, onBack, rightContent }) => {
  const router = useRouter();
  return (
    <SafeAreaView edges={['top']} style={[tw.bgWhite]}>
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.bgWhite, tw.pY3, tw.pX4, tw.shadow, tw.z10]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.flex1]}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBack ? onBack : () => router.back()}
              style={[tw.mR4, tw.p1, tw.roundedFull, tw.bgGray200]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fb6c31" />
            </TouchableOpacity>
          ) : null}
          <Text style={[tw.textPink700, tw.textLg, tw.fontBold]} numberOfLines={1}>{title}</Text>
        </View>
        <View>{rightContent}</View>
      </View>
    </SafeAreaView>
  );
};

export default NavBar; 