import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { View, Image, TouchableOpacity, TextInput, Text, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { saveAuthData } from "@/utils/auth";
import { onGoogleButtonPress, onFacebookButtonPress } from "@/components/SocialLogin";

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
  const [showPassword, setShowPassword] = React.useState(false);
  const [modalInfo, setModalInfo] = React.useState<{
    title: string;
    description: string;
    status: "error" | "success" | "warning" | "info";
    btnText: string;
    onDismiss: () => void;
  }>({
    title: "",
    description: "",
    status: "error",
    btnText: "Try Again",
    onDismiss: () => {},
  });

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const handleLogin = async (credentials: FormData) => {
    try {
      // Clear any existing user data
      removeUserData();
      
      // Create basic auth header
      const basicAuth = btoa(`${credentials.username}:${credentials.password}`);
      
      console.log("Attempting login with:", credentials.username);
      
      const result = await send(
        "post",
        "/auth/login",
        {},
        {
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login result:", result);

      if (result?.errors) {
        console.error("Login error:", result.errors);
        setModalInfo({
          title: "Login Failed",
          description: result.errors || "Invalid credentials. Please try again.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }

      // Check if login was successful
      if (result && result.code === "00" && result.token) {
        // Store the authentication token
        await saveAuthData(result.token, result.expiresAt);
        
        console.log("Login successful, token stored:", result.token);
        
        // Navigate to home screen directly (skip OTP for now)
        router.replace("/(tabs)");
      } else if (result && result.otpToken) {
        // If OTP is required, store the OTP token and navigate to OTP screen
        await LocalStorage.setItem(localStore.token, result.otpToken);
        router.push({ pathname: "/getStarted/otp" });
      } else {
        // Handle unexpected response
        setModalInfo({
          title: "Login Failed",
          description: "Unexpected response from server. Please try again.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setModalInfo({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        status: "error",
        btnText: "OK",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook', token: string) => {
    try {
      // Clear any existing user data
      removeUserData();
      
      console.log(`Attempting ${provider} login`);
      
      const result = await send(
        "post",
        `/auth/${provider}/login`,
        {
          token: token,
          provider: provider
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`${provider} login result:`, result);

      if (result?.errors) {
        console.error(`${provider} login error:`, result.errors);
        setModalInfo({
          title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
          description: result.errors || `Failed to login with ${provider}. Please try again.`,
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }

      // Check if login was successful
      if (result && result.code === "00" && result.token) {
        // Store the authentication token
        await saveAuthData(result.token, result.expiresAt);
        
        console.log(`${provider} login successful, token stored:`, result.token);
        
        // Navigate to home screen directly (skip OTP for now)
        router.replace("/(tabs)");
      } else if (result && result.otpToken) {
        // If OTP is required, store the OTP token and navigate to OTP screen
        await LocalStorage.setItem(localStore.token, result.otpToken);
        router.push({ pathname: "/getStarted/otp" });
      } else {
        // Handle unexpected response
        setModalInfo({
          title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
          description: `Unexpected response from server. Please try again.`,
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setModalInfo({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
        description: `An error occurred during ${provider} login. Please try again.`,
        status: "error",
        btnText: "OK",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const idToken = await onGoogleButtonPress();
      if (idToken) {
        await handleSocialLogin('google', idToken);
      } else {
        setModalInfo({
          title: "Google Login Failed",
          description: "Failed to get Google authentication token. Please try again.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
      }
    } catch (error) {
      console.error("Google login error:", error);
      setModalInfo({
        title: "Google Login Failed",
        description: "An error occurred during Google login. Please try again.",
        status: "error",
        btnText: "OK",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const accessToken = await onFacebookButtonPress();
      if (accessToken) {
        // For Facebook, we need to send the access token
        let token: string;
        if (Platform.OS === 'ios') {
          // @ts-ignore - authenticationToken exists on FBAuthenticationToken
          token = accessToken.authenticationToken;
        } else {
          // @ts-ignore - accessToken exists on FBAccessToken
          token = accessToken.accessToken;
        }
        await handleSocialLogin('facebook', token);
      } else {
        setModalInfo({
          title: "Facebook Login Failed",
          description: "Failed to get Facebook authentication token. Please try again.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      setModalInfo({
        title: "Facebook Login Failed",
        description: "An error occurred during Facebook login. Please try again.",
        status: "error",
        btnText: "OK",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
    }
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
    <ScrollView 
      style={[{ backgroundColor: '#FFFFFF' }, tw.flex1]} 
      contentContainerStyle={[tw.pX8, tw.pY8]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Modal
        title={modalInfo.title}
        description={modalInfo.description}
        status={modalInfo.status}
        btnText={modalInfo.btnText}
        visible={visible}
        onDismiss={modalInfo.onDismiss}
      />
      <View style={[tw.itemsCenter, tw.mB8]}>
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
            <View style={[tw.relative, tw.mB2]}>
              <TextInput
                style={[tw.bgWhite, tw.rounded, tw.p3, primaryShadow, tw.pR12]}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
              <TouchableOpacity
                style={[tw.absolute, tw.right0, tw.top0, tw.bottom0, tw.justifyCenter, tw.p2]}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
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
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={handleFacebookLogin}>
            <FontAwesome name="facebook" size={24} color="#1877F3" />
          </TouchableOpacity>
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={handleGoogleLogin}>
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
    </ScrollView>
  );
};

export default LoginScreen;
