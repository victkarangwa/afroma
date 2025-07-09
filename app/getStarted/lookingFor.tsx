import React from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import { useRouter } from "expo-router";
import { tw } from "react-native-tailwindcss";

const OPTIONS = [
  {
    key: "travel",
    title: "Travel",
    description: "Connect with travelers, share experiences, discover destinations",
    icon: require("../../assets/images/afroma_logo.png"), // Replace with travel icon if available
  },
  {
    key: "networking",
    title: "Networking",
    description: "Build professional connections, find mentors, explore opportunities",
    icon: require("../../assets/images/afroma_logo.png"), // Replace with networking icon if available
  },
  {
    key: "dating",
    title: "Dating",
    description: "Find meaningful relationships, friendships, and romantic connections",
    icon: require("../../assets/images/afroma_logo.png"), // Replace with dating icon if available
  },
];

const LookingForScreen: React.FC = () => {
  const router = useRouter();
  const [selected, setSelected] = React.useState<string[]>([]);

  const handleToggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleContinue = () => {
    // For now, just mock next step
    router.push("/getStarted");
  };

  return (
    <View style={[tw.bgPink100, tw.hFull, tw.pX8, tw.justifyCenter]}>
      <View style={[tw.itemsCenter, tw.mT12, tw.mB2]}>
        <Image
          source={require("../../assets/images/afroma_logo.png")}
          style={[tw.w24, tw.h24]}
        />
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>What are you looking for?</Text>
        <Text style={[tw.textGray700, tw.textBase, tw.textCenter, tw.mT2]}>Choose one or more to personalize your experience</Text>
      </View>
      <View style={[ tw.justifyCenter, tw.mY12]}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              tw.bgWhite,
              tw.roundedLg,
              tw.p4,
              tw.mB4,
              tw.flexRow,
              tw.itemsCenter,
              tw.shadow,
              selected.includes(opt.key) ? tw.border2 : tw.border,
              selected.includes(opt.key) ? tw.borderPink700 : tw.borderGray300,
            ]}
            onPress={() => handleToggle(opt.key)}
            activeOpacity={0.8}
          >
            <Image source={opt.icon} style={[tw.w12, tw.h12, tw.mR4]} />
            <View style={[tw.flex1]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold]}>{opt.title}</Text>
              <Text style={[tw.textGray700, tw.textBase]}>{opt.description}</Text>
            </View>
            {selected.includes(opt.key) && (
              <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mL2]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[
          tw.bgPink700,
          tw.roundedFull,
          tw.pY3,
          tw.itemsCenter,
          // tw.mT8,
          selected.length > 0 ? tw.opacity100 : tw.opacity50,
        ]}
        disabled={selected.length === 0}
        onPress={handleContinue}
      >
        <Text style={[tw.textWhite, tw.textLg, tw.fontBold]}>Continue</Text>
      </TouchableOpacity>
    </View>
  ); 
};

export default LookingForScreen; 