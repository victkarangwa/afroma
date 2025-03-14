import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
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
import {
  onFacebookButtonPress,
  onGoogleButtonPress,
} from "@/components/SocialLogin";

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
  const [modalInfo, setModalInfo] = React.useState<{
    title: string;
    description: string;
    status: "error" | "success" | "warning" | "info";
    btnText: string;
    onDismiss?: () => void;
  }>({
    title: "",
    description: "",
    status: "error",
    btnText: "Try Again",
    onDismiss: () => {},
  });

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
    console.log("___LOGIN___", result);
    if (result?.errors) {
      return setVisible(true);
    }
    LocalStorage.setItem(localStore.token, result?.otpToken);
    router.push({ pathname: "/getStarted/otp" });
  };

  const continueWithSocial = async (type = "google", token: string) => {
    try {
      if (token) {
        const result = await send(
          "get",
          `/bonded-user-service/socialmedia/auth/${type}`,
          {
            headers: {
              accessToken: token,
            },
          }
        );

        if (result?.errors) {
          setModalInfo({
            title: "Error",
            description:
              result?.errors || "An error occurred. Please try again.",
            status: "error",
            btnText: "Try Again",
            onDismiss: () => setVisible(false),
          });
          setVisible(true);
          return;
        }
        console.log("------", result);
        if (!result.newAccount) {
          LocalStorage.setItem(
            localStore.token,
            result?.tokenResponse?.otpToken
          );
          router.push({ pathname: "/getStarted/otp" });
        } else {
          router.push({ pathname: "/getStarted/accountType" });
        }
      }
    } catch (error) {
      console.log("error", error, token);
    }
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
            source={require("../../assets/images/parenti_logo.png")}
            style={[tw.w32, tw.h32, tw.mT24]}
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
          disabled={loading}
        >
          Login
        </Button>
        <Separator text="OR" />
        {Platform.OS === "android" && (
          <Button
            onPress={() =>
              onGoogleButtonPress().then((res) => {
                if (res) continueWithSocial("google", res);
              })
            }
            mode="outlined"
            style={[tw.mX8, tw.mY2]}
            icon={"google"}
            labelStyle={[tw.mL8]}
          >
            <TextComponent style={[tw.pL12]}>
              Login with Google{"    "}
            </TextComponent>
          </Button>
        )}
        <Button
          onPress={() =>
            onFacebookButtonPress().then((res) => {
              if (res?.accessToken)
                continueWithSocial("facebook", res?.accessToken);
            })
          }
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
          <Link href="/getStarted/accountType" style={[tw.textBlue500]}>
            {" "}
            Signup
          </Link>
        </TextComponent>
      </View>
    </AuthScreenLayout>
  );
};

export default LoginScreen;
