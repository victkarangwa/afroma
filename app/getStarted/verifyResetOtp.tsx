import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Image, TouchableOpacity, TextInput, Text, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import Modal from "@/components/Modal";
import usePasswordReset from "@/hooks/usePasswordReset";

type FormData = {
  code: string;
};

const VerifyResetOtpScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      code: "",
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

  const { verifyResetToken, loading } = usePasswordReset();

  const otpCode = watch("code");

  // Auto-submit when OTP is complete (assuming 6 digits)
  React.useEffect(() => {
    if (otpCode && otpCode.length === 6) {
      // Automatically submit the form
      handleSubmit(onSubmit)();
    }
  }, [otpCode]);

  const onSubmit = async (data: FormData) => {
    if (!email) {
      setModalInfo({
        title: "Error",
        description: "Email not found. Please try the password reset process again.",
        status: "error",
        btnText: "Go Back",
        onDismiss: () => {
          router.push("/getStarted/forgetPassword");
          setVisible(false);
        },
      });
      setVisible(true);
      return;
    }

    console.log("Verifying reset OTP:", data.code);
    console.log("Email:", email);

    const result = await verifyResetToken({
      email: email,
      token: parseInt(data.code),
    });

    console.log("------>:", {
        email: email,
        token: parseInt(data.code),
    });

    if (result?.errors) {
      setModalInfo({
        title: "Verification Failed",
        description: result.errors || "Invalid verification code. Please try again.",
        status: "error",
        btnText: "Try Again",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
      return;
    }

    // Check if verification was successful
    if (result && result.success) {
      setModalInfo({
        title: "Code Verified",
        description: "Your verification code has been confirmed. You can now set a new password.",
        status: "success",
        btnText: "Continue",
        onDismiss: () => {
          setVisible(false);
          // Navigate to reset password screen with email and token
          router.push({
            pathname: "/getStarted/resetPassword",
            params: { 
              email: email,
              token: data.code
            }
          });
        },
      });
      setVisible(true);
    } else {
      // Handle unexpected response
      setModalInfo({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        status: "error",
        btnText: "Try Again",
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
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>Verify Code</Text>
        <Text style={[tw.textGray600, tw.textCenter, tw.mT2, tw.pX4]}>
          Enter the 6-digit verification code sent to {email}
        </Text>
      </View>

      <View style={[tw.mT8]}>
        {/* OTP Input */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Verification Code</Text>
        <Controller
          control={control}
          name="code"
          rules={{ 
            required: "Verification code is required",
            pattern: {
              value: /^\d{6}$/,
              message: "Please enter a valid 6-digit code"
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow, tw.textCenter, tw.textXl, tw.fontBold]}
              placeholder="000000"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numeric"
              maxLength={6}
              autoComplete="one-time-code"
            />
          )}
        />
        {errors.code && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.code.message}</Text>
        )}

        {/* Verify Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[tw.bgPink700, tw.mT4]}
          labelStyle={[tw.textWhite]}
          loading={loading}
          disabled={loading}
        >
          Verify Code
        </Button>

        {/* Resend Code */}
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
          <Text style={[tw.textGray700]}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={() => router.push('/getStarted/forgetPassword')}>
            <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>Resend</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default VerifyResetOtpScreen;
