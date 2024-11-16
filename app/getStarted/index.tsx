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

const SignupScreen: React.FC = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    console.log("Pressed");
    router.push({ pathname: "/getStarted/login" });
  };
  return (
    <View style={[tw.bgPink100, tw.hFull, tw.flex, tw.flexCol]}>
      <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
        <Image
          source={require("../../assets/images/bonded_logo.png")}
          style={[tw.w64, tw.h64]}
        />
      </View>
      <View style={[tw.mX8, tw._m12]}>
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
      <View style={[tw.mT12]}>
        <Button
          onPress={handleCreateAccount}
          mode="contained"
          style={[tw.mX8, tw.mY2]}
        >
          Get Started
        </Button>
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
      <View style={[tw.mT4]}>
        <TextComponent
          variant="labelSmall"
          style={[tw.textCenter, tw.textWhite, tw.opacity75]}
        >
          Already have an account?
          <Link href="/getStarted/login" style={[tw.textBlue500]}>
            {" "}
            Login
          </Link>
        </TextComponent>
      </View>
    </View>
  );
};

export default SignupScreen;
