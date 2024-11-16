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
import { Link, useRouter } from "expo-router";
import Separator from "@/components/Separator";

const LoginScreen: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    console.log("Pressed");
    router.push({ pathname: "/getStarted/otp" });
  };
  return (
    <View style={[tw.bgPink100, tw.hFull]}>
      <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
        <Image
          source={require("../../assets/images/bonded_logo.png")}
          style={[tw.w64, tw.h64]}
        />
      </View>
      <View style={[tw.mX8]}>
        <Input
          label="Email or Phone"
          left={<TextInput.Icon icon="account-circle-outline" color="gray" />}
        />
        <Input
          label="Password"
          left={<TextInput.Icon icon="lock-outline" color="gray" />}
        />
      </View>
      <Button
        onPress={handleLogin}
        mode="contained"
        style={[tw.mX8, tw.mY2]}
      >
        Login
      </Button>
      <Separator text="OR" />
      <Button
        onPress={() => console.log("Pressed")}
        mode="outlined"
        style={[tw.mX8, tw.mY2]}
        icon={"google"}
        labelStyle={[tw.mL8]}
      >
        <TextComponent style={[tw.pL12]}>
          Login with Google{"    "}
        </TextComponent>
      </Button>
      <Button
        onPress={() => console.log("Pressed")}
        mode="outlined"
        style={[tw.mX8, tw.mY2]}
        icon={"facebook"}
      >
        <TextComponent> Login with Facebook</TextComponent>
      </Button>
      <TextComponent
        variant="labelSmall"
        style={[tw.textCenter, tw.textWhite, tw.opacity75]}
      >
        Don't have an account yet?
        <Link href="/getStarted" style={[tw.textBlue500]}>
          {" "}
          Signup
        </Link>
      </TextComponent>
    </View>
  );
};

export default LoginScreen;
