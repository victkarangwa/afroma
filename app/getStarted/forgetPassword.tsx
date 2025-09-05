import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { View, Image, TouchableOpacity, TextInput, Text, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import Modal from "@/components/Modal";
import usePasswordReset from "@/hooks/usePasswordReset";

type FormData = {
  email: string;
};

const ForgetPasswordScreen: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
    },
  });

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

  const { forgetPassword, loading } = usePasswordReset();

  const handleForgetPassword = async (data: FormData) => {
    console.log("Sending forget password request for:", data.email);
    
    const result = await forgetPassword({ email: data.email });

    console.log("Forget password result:", result);

    if (result?.errors) {
      console.error("Forget password error:", result.errors);
      setModalInfo({
        title: "Request Failed",
        description: result.errors || "Failed to send reset email. Please try again.",
        status: "error",
        btnText: "OK",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
      return;
    }

    // Check if request was successful
    if (result && result.success) {
      setModalInfo({
        title: "Reset Email Sent",
        description: `We've sent a verification code to ${data.email}. Please check your email and enter the code to reset your password.`,
        status: "success",
        btnText: "Continue",
        onDismiss: () => {
          setVisible(false);
          // Navigate to OTP verification screen with email
          router.push({
            pathname: "/getStarted/verifyResetOtp",
            params: { email: data.email }
          });
        },
      });
      setVisible(true);
    } else {
      // Handle unexpected response
      setModalInfo({
        title: "Request Failed",
        description: "Invalid email address. Please try again.",
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
      
      {/* Header */}
      <View style={[tw.itemsCenter, tw.mB8]}>
        <TouchableOpacity 
          style={[tw.absolute, tw.left0, tw.top0, tw.p2]}
          onPress={() => router.back()}
        >
          <Text style={[tw.textPink700, tw.textLg, tw.fontBold]}>← Back</Text>
        </TouchableOpacity>
        
        <Image
          source={require("../../assets/images/afroma_logo.png")}
          style={[tw.w32, tw.h32, tw.mT24]}
        />
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>Forgot Password</Text>
        <Text style={[tw.textGray600, tw.textCenter, tw.mT2, tw.pX4]}>
          Enter your email address and we'll send you a verification code to reset your password.
        </Text>
      </View>

      <View style={[tw.mT8]}>
        {/* Email Input */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Email Address</Text>
        <Controller
          control={control}
          name="email"
          rules={{ 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Please enter a valid email address"
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
              placeholder="Enter your email address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          )}
        />
        {errors.email && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.email.message}</Text>
        )}

        {/* Send Reset Email Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(handleForgetPassword)}
          style={[tw.bgPink700, tw.mT4]}
          labelStyle={[tw.textWhite]}
          loading={loading}
          disabled={loading}
        >
          Send Reset Code
        </Button>

        {/* Back to Login */}
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
          <Text style={[tw.textGray700]}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push('/getStarted/login')}>
            <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ForgetPasswordScreen;
