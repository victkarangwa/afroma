import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { tw } from "react-native-tailwindcss";
import { heightPercentageToDP } from "react-native-responsive-screen";
import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import { introText } from "@/constants/text";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const st = StyleSheet.create({
  linearGradient: {},
  buttonText: {
    fontSize: 18,
    fontFamily: "Gill Sans",
    textAlign: "center",
    margin: 10,
    color: "#ffffff",
    backgroundColor: "transparent",
  },
});

const StarterScreen1: React.FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = React.useState(1);

  const handleNext = () => {
    if (activeIndex === 3) {
      router.push("/getStarted");
      return;
    }
    setActiveIndex(activeIndex + 1);
  };
  return (
    <View style={styles.container}>
      <View style={[tw.relative, tw.hFull]}>
        <View
          style={[
            tw.flex,
            tw.justifyCenter,
            tw.itemsCenter,
            tw.pX8,
            { height: heightPercentageToDP("90%") },
          ]}
        >
          <Ionicons
            name={
              introText[activeIndex - 1].icon as keyof typeof Ionicons.glyphMap
            }
            size={100}
            style={[tw.textPurple500]}
          />
          <TextComponent
            style={[tw.fontExtrabold, tw.textWhite, tw.textCenter, tw.mT8]}
            variant="headlineLarge"
          >
            {introText[activeIndex - 1].title}
          </TextComponent>
          <TextComponent
            style={[
              tw.fontMedium,
              tw.textRed200,
              tw.textCenter,
              tw.textBase,
              tw.pY4,
              tw.italic,
            ]}
            variant="bodyMedium"
          >
            {introText[activeIndex - 1].description}
          </TextComponent>
        </View>
        <View style={[tw.absolute, tw.bottom0, tw.mB5, tw.m4]}>
          <View
            style={[
              tw.pT40,
              tw.pB4,
              tw.wFull,
              tw.pX8,
              tw.roundedLg,
              tw.flex,
              tw.flexRow,
              tw.justifyBetween,
              tw.itemsCenter,
            ]}
          >
            <View
              style={[tw.flex, tw.flexRow, tw.justifyStart, tw.itemsCenter]}
            >
              {[1, 2, 3].map((index) =>
                index !== activeIndex ? (
                  <Ionicons
                    key={index}
                    style={[tw.mX2, tw.textPink700]}
                    name={"ellipse-outline"}
                    size={15}
                  />
                ) : (
                  <View
                    key={index}
                    style={[tw.h3, tw.w8, tw.bgPink700, tw.roundedFull, tw.mX2]}
                  />
                )
              )}
            </View>
            <View style={[tw.itemsBaseline, tw.alignCenter]}>
              <TouchableOpacity onPress={handleNext}>
                <Ionicons
                  style={[tw.mX2, tw.textPink700]}
                  name="arrow-forward-circle-outline"
                  size={50}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1d1b2c",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default StarterScreen1;
