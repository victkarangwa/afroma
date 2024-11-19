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
import { Button, Divider, Modal, Portal, TextInput } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import Separator from "@/components/Separator";
import showToast from "@/utils/toast";
import Toast from "react-native-toast-message";
import AuthScreenLayout from "@/components/AuthScreensLayout";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import useApiRequest from "@/hooks/useApiRequest";

type FormData = {
  username: string;
  password: string;
};

interface ApiResponse {
  data: any;
  [key: string]: any;
}

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

  const [credentials, setCredentials] = useState("");
  const [visible, setVisible] = React.useState(false);

  const { loading, send } = useApiRequest<ApiResponse>();

  const handleLogin = async (credentials: FormData) => {
    // convert username and password to basic auth
    const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
    setCredentials(basicAuth);
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
    if (result?.errors) {
      return setVisible(true);
    }

    console.log("------", result);
    router.push({ pathname: "/getStarted/otp" });
  };

  const handleModal = () => setVisible(false);
  return (
    <AuthScreenLayout>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={handleModal}
          contentContainerStyle={[
            tw.bgWhite,
            tw.p8,
            tw.roundedL,
            tw.mX8,
            tw.h1_2,
          ]}
        >
          <Ionicons
            name="close-circle-outline"
            size={36}
            color="red"
            style={[tw.mT2, tw.textCenter]}
          />
          <TextComponent
            variant="titleMedium"
            style={[tw.textCenter, tw.fontBold, tw.pY4]}
          >
            The credentials you provided are incorrect
          </TextComponent>
          <TextComponent style={[tw.textCenter]}>
            Check that your credentials are the same as the ones you used to
            sign up
          </TextComponent>
          <Button mode="outlined" onPress={handleModal} style={[tw.mY6]}>
            Try Again
          </Button>
        </Modal>
      </Portal>
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
