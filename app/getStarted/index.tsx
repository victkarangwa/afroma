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

const StarterScreen1: React.FC = () => {
  return (
    <View style={[tw.bgPink100, tw.hFull]}>
      <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
        <Image
          source={require("../../assets/images/bonded_logo.png")}
          style={[ tw.w64, tw.h64]}
        />
      </View>
      <View style={[tw.mX8]}>
        <Input
          label="Full name"
          left={<TextInput.Icon icon="account-circle-outline" color="gray" />}
        />
        <Input
          label="Phone"
          left={<TextInput.Icon icon="cellphone" color="gray" />}
        />
        <Input
          label="Email"
          left={<TextInput.Icon icon="email-outline" color="gray" />}
        />
        <Input
          label="Password"
          left={<TextInput.Icon icon="lock-outline" color="gray" />}
        />
      </View>
      <Button
        onPress={() => console.log("Pressed")}
        mode="contained"
        style={[tw.mX8, tw.mY2]}
      >
        Get Started
      </Button>
      {/* Add a seprator line with or in between */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.mX8]}>
        <View style={[tw.flex1, tw.bgGray100, tw.hPx, tw.opacity25]} />
        <TextComponent style={[tw.mX2, tw.mY2, tw.textCenter, tw.textWhite]}>
          Or
        </TextComponent>
        <View style={[tw.flex1, tw.bgGray100, tw.hPx, tw.opacity25]} />
      </View>

      <Button
        onPress={() => console.log("Pressed")}
        mode="outlined"
        style={[tw.mX8, tw.mY2]}
        icon={"google"}
        labelStyle={[tw.mL8]}
      >
        <TextComponent style={[tw.pL12]}>
          Signup with Google{"    "}
        </TextComponent>
      </Button>
      <Button
        onPress={() => console.log("Pressed")}
        mode="outlined"
        style={[tw.mX8, tw.mY2]}
        icon={"facebook"}
      >
        <TextComponent> Signup with Facebook</TextComponent>
      </Button>
    </View>
  );
};

export default StarterScreen1;
