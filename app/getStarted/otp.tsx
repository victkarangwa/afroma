import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { View, Image, TextInput, Text, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import { FontAwesome } from '@expo/vector-icons';
import OTPTextView from "react-native-otp-textinput";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import Modal from "@/components/Modal";
import localStore from "@/utils/localValues";
import LocalStorage from "@/utils/storage";
import { saveAuthData } from "@/utils/auth";

const primaryShadow = {
  shadowColor: '#fb6c31',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.33,
  shadowRadius: 8,
  elevation: 4,
};

type FormData = {
  code: string;
};

const OtpScreen: React.FC = () => {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: { code: "" },
  });
  const { loading, send, error } = useApiRequest<ApiResponse>();
  const [visible, setVisible] = React.useState(false);
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

  // Watch the OTP code field
  const otpCode = watch("code");

  // Auto-validate when OTP code reaches 6 digits
  React.useEffect(() => {
    if (otpCode && otpCode.length === 6 && !loading) {
      // Automatically submit the form
      handleSubmit(onSubmit)();
    }
  }, [otpCode]);

  const onSubmit = async (data: FormData) => {
    try {
      // Get the OTP token from storage
      const otpToken = await LocalStorage.getItem<string>(localStore.token);
      
      if (!otpToken) {
        setModalInfo({
          title: "Error",
          description: "OTP token not found. Please try logging in again.",
          status: "error",
          btnText: "Go Back",
          onDismiss: () => {
            router.push("/getStarted/login");
            setVisible(false);
          },
        });
        setVisible(true);
        return;
      }

      // console.log("Verifying OTP:", data.code);
      // console.log("OTP Token:", otpToken);

      const result = await send("post", "/auth/login-auth2", { 
        code: data.code,
        otpToken: otpToken
      });

      // console.log("OTP verification result:", result);

      if (result?.errors) {
        setModalInfo({
          title: "Verification Failed",
          description: result.errors || "Invalid OTP code. Please try again.",
          status: "error",
          btnText: "Try Again",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }

      // Check if verification was successful
      if (result && result.code === "00" && result.token) {
        // Store the authentication token
        await saveAuthData(result.token, result.expiresAt);
        
        // Clear the OTP token
        await LocalStorage.removeItem(localStore.token);
        
        console.log("OTP verification successful, token stored:", result.token);
        
        // Navigate to home screen
        router.replace("/(tabs)");
      } else {
        // Handle unexpected response
        setModalInfo({
          title: "Verification Failed",
          description: "Unexpected response from server. Please try again.",
          status: "error",
          btnText: "Try Again",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setModalInfo({
        title: "Verification Failed",
        description: "An error occurred during verification. Please try again.",
        status: "error",
        btnText: "Try Again",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
    }
  };

  return (
    <View style={[{ backgroundColor: '#FFFFFF' }, tw.hFull, tw.pX8, tw.justifyCenter]}>
      <Modal
        title={modalInfo.title}
        description={modalInfo.description}
        status={modalInfo.status}
        btnText={modalInfo.btnText}
        visible={visible}
        onDismiss={modalInfo.onDismiss}
      />
      <View style={[tw.itemsCenter]}>
        <Image
          source={require("../../assets/images/afroma_logo.png")}
          style={[tw.w32, tw.h32, tw.mT24]}
        />
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>Code Verification</Text>
        <Text style={[tw.textGray500, tw.textBase, tw.mT2, tw.textCenter]}>Enter the OTP sent to your Email/phone number</Text>
      </View>
      <View style={[tw.mT8, tw.itemsCenter]}>
        <Controller
          control={control}
          name="code"
          rules={{ required: "OTP code is required", minLength: { value: 6, message: "OTP must be 6 digits" } }}
          render={({ field: { onChange, value } }) => (
            <OTPTextView
              handleTextChange={onChange}
              inputCount={6}
              keyboardType="numeric"
              textInputStyle={{
                backgroundColor: '#f3f4f6',
                height: 48,
                width: 48,
                borderRadius: 8,
                marginHorizontal: 6,
                ...primaryShadow,
              }}
              tintColor={"#fb6c31"}
              offTintColor={"#e5e7eb"}
              defaultValue={value}
            />
          )}
        />
        {errors.code && (
          <Text style={[tw.textRed500, tw.mT2]}>{errors.code.message}</Text>
        )}
      </View>
      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        style={[tw.bgPink700, tw.mT8]}
        labelStyle={[tw.textWhite]}
        loading={loading}
        disabled={loading}
      >
        Verify
      </Button>
      <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
        <Text style={[tw.textGray700]}>Didn't receive the code? </Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>Resend Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OtpScreen;
