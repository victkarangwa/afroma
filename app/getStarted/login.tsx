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
import { removeUserData, encodeBase64 } from "@/utils";
import localStore from "@/utils/localValues";
import LocalStorage from "@/utils/storage";
import moment from "moment";
import { saveAuthData } from "@/utils/auth";
import { onGoogleButtonPress, onFacebookButtonPress, onAppleButtonPress } from "@/components/SocialLogin";
// import { SignInWithAppleButton } from "@/components/Button/SignInWithAppleButton.ios";
import * as AppleAuthentication from 'expo-apple-authentication';

// Map API profileType to local value used in app
const mapApiProfileTypeToLocal = (apiType?: string): 'travel' | 'networking' | 'dating' | null => {
  if (!apiType) return null;
  const upper = apiType.toUpperCase();
  if (upper === 'TRAVEL') return 'travel';
  if (upper === 'NETWORKING') return 'networking';
  if (upper === 'DATING') return 'dating';
  return null;
};

// Choose a preferred type from an array of API types
const pickPreferredProfileType = (apiTypes?: string[] | null): 'travel' | 'networking' | 'dating' | null => {
  if (!apiTypes || apiTypes.length === 0) return null;
  // Preference order: DATING > NETWORKING > TRAVEL
  const upper = apiTypes.map(t => (t || '').toUpperCase());
  if (upper.includes('DATING')) return 'dating';
  if (upper.includes('NETWORKING')) return 'networking';
  if (upper.includes('TRAVEL')) return 'travel';
  return mapApiProfileTypeToLocal(apiTypes[0]);
};

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

  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (credentials: FormData) => {
    try {
      setIsLoading(true);
      // Clear any existing user data
      removeUserData();
      
      // Create basic auth header
      const basicAuth = encodeBase64(`${credentials.username}:${credentials.password}`);
      
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

        // Fetch user's profile to determine profileType and persist it
        try {
          const me: any = await send("get", "/users/me");
          console.log("User profile data:", me); // Debug log
          if (me) {
            const apiProfileType: string | undefined = me.profileType;
            const apiProfileTypes: string[] | undefined = me.profileTypes;
            
            console.log("API profileType:", apiProfileType); // Debug log
            console.log("API profileTypes array:", apiProfileTypes); // Debug log

            // Determine the profile type to use
            let localProfileType = mapApiProfileTypeToLocal(apiProfileType);
            console.log("Mapped profileType from single value:", localProfileType); // Debug log
            
            if (!localProfileType) {
              localProfileType = pickPreferredProfileType(apiProfileTypes);
              console.log("Mapped profileType from array:", localProfileType); // Debug log
            }

            // If still no profile type found, check if user has dating-related fields
            if (!localProfileType) {
              if (me.interestedIn || me.gender) {
                console.log("User has dating fields, defaulting to dating profile type");
                localProfileType = 'dating';
              } else {
                console.log("No profile type indicators found, defaulting to travel");
                localProfileType = 'travel';
              }
            }

            if (localProfileType) {
              await LocalStorage.setItem(localStore.profileType, localProfileType);
              console.log("Saved profileType to storage:", localProfileType);
            } else {
              console.log("No profileType found on user; leaving unset");
            }
          }
        } catch (profileErr) {
          console.warn("Failed to fetch /users/me after login:", profileErr);
        }
        
        // Navigate to home screen
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple', token: string) => {
    try {
      if (token) {
        const result = await send(
          "get",
          `/socialmedia/auth/${provider}`,
          {
            headers: {
              accessToken: token,
              platform: Platform.OS,
            },
          }
        );

        console.log("result----->", result);

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
        if (!result?.newAccount) {
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

  const handleAppleLogin = async () => {
    try {
      const identityToken = await onAppleButtonPress();
      if (identityToken) {
        setModalInfo({
          title: "Apple Login Success",
          description: `Apple authentication token received. ${identityToken}`,
          status: "success",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        await handleSocialLogin('apple', identityToken);
      } else {
        setModalInfo({
          title: "Apple Login Failed",
          description: "Failed to get Apple authentication token. Please try again.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
      }
    } catch (error) {
      console.error("Apple login error:", error);
      setModalInfo({
        title: "Apple Login Failed",
        description: "An error occurred during Apple login. Please try again.",
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
        
        {/* Forgot Password Link */}
        <View style={[tw.flex, tw.flexRow, tw.justifyEnd, tw.mB2]}>
          <TouchableOpacity onPress={() => router.push('/getStarted/forgetPassword')}>
            <Text style={[{ color: '#fb6c31' }, tw.fontBold, tw.textSm]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        
        {/* Login Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(handleLogin)}
          style={[tw.bgPink700, tw.mT4]}
          labelStyle={[tw.textWhite]}
          loading={isLoading}
          disabled={isLoading}
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
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]}
           onPress={handleFacebookLogin}
          // onPress={() =>
          //   onGoogleButtonPress().then((res) => {
          //     if (res) console.log("=========", res);
          //   })}
           >
            <FontAwesome name="facebook" size={24} color="#1877F3" />
          </TouchableOpacity>
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={handleGoogleLogin}>
            <FontAwesome name="google" size={24} color="#EA4335" />
          </TouchableOpacity>
          {/* <SignInWithAppleButton /> */}
          {/* <View>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: 200, height: 44 }}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            });
            console.log(credential);
            // send credential.identityToken to backend to validate
          } catch (e) {
            if (e.code === 'ERR_CANCELED') {
              // user cancelled
            } else {
              console.error(e);
            }
          }
        }}
      />
    </View> */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={handleAppleLogin}>
              <FontAwesome name="apple" size={24} color="#000000" />
            </TouchableOpacity>
          )}
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
