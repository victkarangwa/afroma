import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { View, Image, TouchableOpacity, TextInput, Text, Platform } from "react-native";
import { Button } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import { FontAwesome } from '@expo/vector-icons';
import Modal from "@/components/Modal";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { removeUserData } from "@/utils";
import localStore from "@/utils/localValues";
import LocalStorage from "@/utils/storage";
import moment from "moment";

type FormData = {
  username: string;
  password: string;
};

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [visible, setVisible] = React.useState(false);
  const [modalInfo, setModalInfo] = React.useState({
    title: "",
    description: "",
    status: "error",
    btnText: "Try Again",
    onDismiss: () => {},
  });

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const handleLogin = async (credentials: FormData) => {
    // removeUserData();
    // const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
    // const result = await send(
    //   "post",
    //   "/bonded-user-service/auth/login",
    //   {},
    //   {
    //     headers: {
    //       Authorization: `Basic ${basicAuth}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );
    // if (result?.errors) {
    //   return setVisible(true);
    // }
    // LocalStorage.setItem(localStore.token, result?.otpToken);
    router.push({ pathname: "/getStarted/otp" });
  };

  const primaryShadow = {
    shadowColor: '#fb6c31',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.33,
    shadowRadius: 8,
    elevation: 4,
  };

  const handleModal = () => setVisible(false);

  return (
    <View style={[{ backgroundColor: '#FFFFFF' }, tw.hFull, tw.pX8, tw.justifyCenter]}>
      <Modal
        title="Error"
        description={error ?? "An error occurred. Please try again."}
        visible={visible}
        onDismiss={handleModal}
      />
      <View style={[tw.itemsCenter]}>
        <Image
          source={require("../../assets/images/afroma_logo.png")}
          style={[tw.w32, tw.h32, tw.mT24]}
        />
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>Login</Text>
      </View>
      <View style={[tw.mT8]}>
        {/* Username */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Email or Phone</Text>
        <Controller
          control={control}
          name="username"
          rules={{ required: "Email or phone is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
              placeholder="Enter your email or phone"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        {errors.username && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.username.message}</Text>
        )}
        {/* Password */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: "Password is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
              placeholder="Enter your password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.password.message}</Text>
        )}
        {/* Login Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(handleLogin)}
          style={[tw.bgPink700, tw.mT4]}
          labelStyle={[tw.textWhite]}
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>
        {/* Social Login */}
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
          <View style={[tw.flex1, tw.hPx, tw.bgGray300, tw.mR2]} />
          <Text style={[tw.textGray500, tw.textSm]}>or login with</Text>
          <View style={[tw.flex1, tw.hPx, tw.bgGray300, tw.mL2]} />
        </View>
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT4]}>
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={() => {/* TODO: Add Facebook login */}}>
            <FontAwesome name="facebook" size={24} color="#1877F3" />
          </TouchableOpacity>
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={() => {/* TODO: Add Google login */}}>
            <FontAwesome name="google" size={24} color="#EA4335" />
          </TouchableOpacity>
        </View>
        {/* Don't have an account? */}
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
          <Text style={[tw.textGray700]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/getStarted/accountType')}>
            <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
