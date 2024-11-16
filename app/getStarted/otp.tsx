import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { tw } from "react-native-tailwindcss";
import { heightPercentageToDP } from "react-native-responsive-screen";
import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import { introText } from "@/constants/text";
import Input from "@/components/input";
import { Button, Divider, TextInput } from "react-native-paper";
import { Link } from "expo-router";
import Separator from "@/components/Separator";
import OTPTextView from "react-native-otp-textinput";

const OtpScreen: React.FC = () => {
  return (
    <View style={[tw.bgPink100, tw.hFull]}>
      <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
        <Image
          source={require("../../assets/images/bonded_logo.png")}
          style={[tw.w64, tw.h64]}
        />
      </View>
      <View style={[tw.m8]}>
        <View style={[tw.mB8]}>
          <TextComponent
            variant="headlineMedium"
            style={[tw.textWhite, tw.mX8, tw.textCenter, tw.fontBold]}
          >
            Code Verification
          </TextComponent>
          <TextComponent
            variant="labelSmall"
            style={[tw.textWhite, tw.mX8, tw.textCenter, tw.pT2]}
          >
            Enter the OTP sent to your phone number
          </TextComponent>
        </View>
        <OTPTextView
          handleTextChange={(e) => console.log(e)}
          textInputStyle={StyleSheet.flatten([
            tw.bgGray100,
            tw.h12,
            tw.w12,
            tw.mX2,
            tw.rounded,
          ])}
          tintColor={"#757fb4"}
        />
      </View>
      <Button
        onPress={() => console.log("Pressed")}
        mode="contained"
        style={[tw.mX8, tw.mY2]}
      >
        Verify
      </Button>

      <TextComponent
        variant="labelSmall"
        style={[tw.textCenter, tw.textWhite, tw.opacity75, tw.pT6]}
      >
        Didn't receive the code?
        <Link href="/getStarted" style={[tw.textBlue500]}>
          {" "}
          Resend Now
        </Link>
      </TextComponent>
    </View>
  );
};

export default OtpScreen;
