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
import OTPTextView from "react-native-otp-textinput";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import Modal from "@/components/Modal";
import localStore from "@/utils/localValues";
import LocalStorage from "@/utils/storage";
import { useForm } from "react-hook-form";

type FormData = {
  code: string;
};

const OtpScreen: React.FC = () => {
  const router = useRouter();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      code: "",
    },
  });

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [visible, setVisible] = React.useState(false);
  const [code, setCode] = React.useState("");

  const handleOtp = async () => {
    const token = LocalStorage.getItem(localStore.otpToken);
    const result = await send("post", "/bonded-user-service/auth/login-auth2", {
      code,
    });
    console.log("------", result, errors);
    if (result?.errors) {
      return setVisible(true);
    }

    router.push({ pathname: "/(tabs)" });
  };

  const handleModal = () => setVisible(false);
  return (
    <View style={[tw.bgPink100, tw.hFull]}>
      <Modal
        title="OTP Error"
        description={error ?? "An error occured while verifying your OTP"}
        visible={visible}
        onDismiss={handleModal}
      />
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
            Enter the OTP sent to your Email/phone number
          </TextComponent>
        </View>
        <OTPTextView
          handleTextChange={setCode}
          textInputStyle={StyleSheet.flatten([
            tw.bgGray100,
            tw.h10,
            tw.w10,
            // tw.mX2,
            tw.rounded,
          ])}
          inputCount={6}
          tintColor={"#757fb4"}
        />
      </View>
      <Button
        onPress={handleSubmit(handleOtp)}
        mode="contained"
        style={[tw.mX8, tw.mY2]}
        labelStyle={[tw.textBlack]}
        loading={loading}
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
