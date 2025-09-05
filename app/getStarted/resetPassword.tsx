import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Image, TouchableOpacity, TextInput, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import Modal from "@/components/Modal";
import usePasswordReset from "@/hooks/usePasswordReset";

type FormData = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  const token = params.token as string;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [visible, setVisible] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
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

  const { resetPassword, loading } = usePasswordReset();

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    if (!email || !token) {
      setModalInfo({
        title: "Error",
        description: "Missing verification data. Please try the password reset process again.",
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

    console.log("Resetting password for:", email);
    console.log("Token:", token);

    const result = await resetPassword({
      email: email,
      password: data.password,
      token: token,
    });

    console.log("Reset password result:", result);

    if (result?.errors) {
      setModalInfo({
        title: "Reset Failed",
        description: result.errors || "Failed to reset password. Please try again.",
        status: "error",
        btnText: "Try Again",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
      return;
    }

    // Check if reset was successful
    if (result && result.success) {
      setModalInfo({
        title: "Password Reset Successfully",
        description: "Your password has been reset successfully. You can now sign in with your new password.",
        status: "success",
        btnText: "Sign In",
        onDismiss: () => {
          setVisible(false);
          // Navigate to login screen
          router.replace("/getStarted/login");
        },
      });
      setVisible(true);
    } else {
      // Handle unexpected response
      setModalInfo({
        title: "Reset Failed",
        description: "Unexpected response from server. Please try again.",
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
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>Reset Password</Text>
        <Text style={[tw.textGray600, tw.textCenter, tw.mT2, tw.pX4]}>
          Enter your new password below
        </Text>
      </View>

      <View style={[tw.mT8]}>
        {/* New Password */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>New Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{ 
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters"
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[tw.relative, tw.mB2]}>
              <TextInput
                style={[tw.bgWhite, tw.rounded, tw.p3, primaryShadow, tw.pR12]}
                placeholder="Enter your new password"
                secureTextEntry={!showPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoComplete="new-password"
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

        {/* Confirm Password */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{ 
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match"
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[tw.relative, tw.mB2]}>
              <TextInput
                style={[tw.bgWhite, tw.rounded, tw.p3, primaryShadow, tw.pR12]}
                placeholder="Confirm your new password"
                secureTextEntry={!showConfirmPassword}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoComplete="new-password"
              />
              <TouchableOpacity
                style={[tw.absolute, tw.right0, tw.top0, tw.bottom0, tw.justifyCenter, tw.p2]}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.confirmPassword && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.confirmPassword.message}</Text>
        )}

        {/* Reset Password Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[tw.bgPink700, tw.mT4]}
          labelStyle={[tw.textWhite]}
          loading={loading}
          disabled={loading}
        >
          Reset Password
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

export default ResetPasswordScreen;
