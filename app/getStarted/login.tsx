import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { tw } from "react-native-tailwindcss";
import { heightPercentageToDP } from "react-native-responsive-screen";
import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import { introText } from "@/constants/text";
import Input from "@/components/input";
import { Button, Divider, Portal, TextInput } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import Separator from "@/components/Separator";
import showToast from "@/utils/toast";
import Toast from "react-native-toast-message";
import AuthScreenLayout from "@/components/AuthScreensLayout";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import Modal from "@/components/Modal";
import LocalStorage from "@/utils/storage";
import localStore from "@/utils/localValues";
import { removeUserData } from "@/utils";

type FormData = {
  username: string;
  password: string;
};

const LoginScreen: React.FC = () => {
  const router = useRouter();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [visible, setVisible] = React.useState(false);

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const handleLogin = async (credentials: FormData) => {
    // remove user data -- to be revamped
    removeUserData();

    // convert username and password to basic auth
    const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
    const result = await send(
      "post",
      "/bonded-user-service/auth/login",
      {},
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("___LOGIN___", result, credentials);
    if (result?.errors) {
      return setVisible(true);
    }
    LocalStorage.setItem(localStore.token, result?.otpToken);
    router.push({ pathname: "/getStarted/otp" });
  };

  const handleModal = () => setVisible(false);
  return (
    <AuthScreenLayout>
      <Modal
        title="Error"
        description={error ?? "An error occurred. Please try again."}
        visible={visible}
        onDismiss={handleModal}
      />
      <View style={[tw.bgPink100, tw.hFull]}>
        <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
          <Image
            source={require("../../assets/images/bonded_logo.png")}
            style={[tw.w64, tw.h64]}
          />
        </View>
        <View style={[tw.mX8]}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email or Phone"
                left={
                  <TextInput.Icon icon="account-circle-outline" color="gray" />
                }
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
              />
            )}
          />
          {errors.username && (
            <TextComponent style={[tw.textRed600]}>
              Email or Phone is required
            </TextComponent>
          )}
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                left={<TextInput.Icon icon="lock-outline" color="gray" />}
                onChangeText={(value) => onChange(value)}
              />
            )}
          />
          {errors.password && (
            <TextComponent style={[tw.textRed600]}>
              Password is required
            </TextComponent>
          )}
        </View>
        <Button
          onPress={handleSubmit(handleLogin)}
          mode="contained"
          style={[tw.mX8, tw.mY2]}
          labelStyle={[tw.textBlack]}
          loading={loading}
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
    </AuthScreenLayout>
  );
};

export default LoginScreen;
