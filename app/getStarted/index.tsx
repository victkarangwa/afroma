import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { tw } from "react-native-tailwindcss";
import { heightPercentageToDP } from "react-native-responsive-screen";
import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import { introText } from "@/constants/text";
import Input from "@/components/input";
import { Button, Divider, TextInput } from "react-native-paper";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import AuthScreenLayout from "@/components/AuthScreensLayout";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import Modal from "@/components/Modal";
import PhoneNumberInput from "@/components/input/phone";
import {
  onFacebookButtonPress,
  onGoogleButtonPress,
} from "@/components/SocialLogin";
import LocalStorage from "@/utils/storage";
import localStore from "@/utils/localValues";

type FormData = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
};
const SignupScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profileFields } = params;

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [visible, setVisible] = React.useState(false);
  const [isSocialNewAccount, setIsSocialNewAccount] = React.useState(false);
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

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch inputs for dynamic comparison
  const password = watch("password");
  const newPassword = watch("confirmPassword");

  const handleCreateAccount = async (data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
  }) => {
    const { name, email, phone_number, password } = data;

    const otherFields = JSON.parse(profileFields);

    const req = {
      name,
      email,
      phone_number: phone_number.slice(1),
      password,
      ...otherFields,
    };
    const result = await send(
      "post",
      "/bonded-user-service/users/register",
      req
    );

    if (result?.errors) {
      setModalInfo({
        title: "Error",
        description: result?.errors || "An error occurred. Please try again.",
        status: "error",
        btnText: "Try Again",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
      return;
    }
    setVisible(true);
    setModalInfo({
      title: "Success",
      description: "Account created successfully",
      status: "success",
      btnText: "Continue to login",
      onDismiss: () => {
        router.push({ pathname: "/getStarted/login" });
        setVisible(false);
      },
    });
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
        LocalStorage.setItem(localStore.token, result?.tokenResponse?.otpToken);
        router.push({ pathname: "/getStarted/otp" });
      }
    } catch (error) {
      console.log("error", error, token);
    }
  };
  return (
    <AuthScreenLayout>
      <Modal
        title={modalInfo.title}
        description={modalInfo.description}
        visible={visible}
        status={modalInfo.status}
        btnText={modalInfo.btnText}
        onDismiss={modalInfo.onDismiss || (() => {})}
      />
      <View style={[tw.bgPink100, tw.hFull, tw.flex, tw.flexCol]}>
        <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
          <Image
            source={require("../../assets/images/bonded_logo.png")}
            style={[tw.w64, tw.h64]}
          />
        </View>
        <View style={[tw.mX8, tw._m12]}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full name"
                left={
                  <TextInput.Icon icon="account-circle-outline" color="gray" />
                }
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
              />
            )}
          />
          {errors.name && (
            <TextComponent style={[tw.textRed600]}>
              Name is required
            </TextComponent>
          )}
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            name="phone_number"
            render={({ field: { onChange, onBlur, value } }) => (
              // <Input
              //   label="Phone"
              //   left={<TextInput.Icon icon="cellphone" color="gray" />}
              //   onBlur={onBlur}
              //   onChangeText={(value) => onChange(value)}
              // />
              <PhoneNumberInput
                // onChangeText={onChange}
                onChangeFormattedText={onChange}
                withDarkTheme={true}
                containerStyle={[
                  tw.bgTransparent,
                  tw.border,
                  tw.borderPink700,
                  tw.rounded,
                  tw.wFull,
                ]}
                textContainerStyle={[tw.bgTransparent, tw.pY3, tw.roundedR]}
                textInputStyle={[tw.textWhite]}
                codeTextStyle={[tw.textWhite]}
                textInputProps={{
                  placeholder: "Phone",
                  placeholderTextColor: "gray",
                  style: [tw.textBase, tw.textWhite],
                }}
                countryPickerButtonStyle={[tw.textWhite]}
              />
            )}
          />
          {errors.phone_number && (
            <TextComponent style={[tw.textRed600]}>
              Phone is required
            </TextComponent>
          )}
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                left={<TextInput.Icon icon="email-outline" color="gray" />}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
              />
            )}
          />
          {errors.email && (
            <TextComponent style={[tw.textRed600]}>
              Email is required
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
                secureTextEntry={true}
                left={<TextInput.Icon icon="lock-outline" color="gray" />}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
              />
            )}
          />
          {errors.password && (
            <TextComponent style={[tw.textRed600]}>
              Password is required
            </TextComponent>
          )}
          <Controller
            control={control}
            rules={{
              required: true,
              // password should be equal to confirmPassword
              validate: (value) =>
                value === password || "The passwords do not match",
            }}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                secureTextEntry={true}
                left={<TextInput.Icon icon="lock-outline" color="gray" />}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
              />
            )}
          />
          {errors.confirmPassword && (
            <TextComponent style={[tw.textRed600]}>
              {errors.confirmPassword.message}
            </TextComponent>
          )}
        </View>
        <View style={[tw.mT12]}>
          <Button
            onPress={handleSubmit(handleCreateAccount)}
            mode="contained"
            style={[tw.mX8, tw.mY2]}
            labelStyle={[tw.textBlack]}
            loading={loading}
            disabled={loading}
          >
            Get Started
          </Button>
          <View style={[tw.flexRow, tw.itemsCenter, tw.mX8]}>
            <View style={[tw.flex1, tw.bgGray100, tw.hPx, tw.opacity25]} />
            <TextComponent
              style={[tw.mX2, tw.mY2, tw.textCenter, tw.textWhite]}
            >
              Or
            </TextComponent>
            <View style={[tw.flex1, tw.bgGray100, tw.hPx, tw.opacity25]} />
          </View>
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
            disabled={loading}
          >
            <TextComponent style={[tw.pL12]}>
              Signup with Google{"    "}
            </TextComponent>
          </Button>
          <Button
            onPress={() =>
              onFacebookButtonPress().then((res) => {
                if (res?.accessToken) continueWithSocial("facebook", res?.accessToken);
              })
            }
            mode="outlined"
            style={[tw.mX8, tw.mY2]}
            icon={"facebook"}
            disabled={loading}
          >
            <TextComponent> Signup with Facebook</TextComponent>
          </Button>
        </View>
        <View style={[tw.mT4, tw.flex, tw.justifyCenter]}>
          <TextComponent
            variant="labelSmall"
            style={[tw.textCenter, tw.textWhite, tw.opacity75]}
          >
            Already have an account?
            <Link href="/getStarted/login" style={[tw.textYellow400]}>
              {" "}
              Login
            </Link>
          </TextComponent>
          <TextComponent
            variant="labelSmall"
            style={[tw.textCenter, tw.textWhite, tw.opacity75, tw.pY4, tw.mX12]}
          >
            By signing up, you agree to our{" "}
            <Link
              href="/getStarted"
              style={[tw.textBlue500, tw.underline, tw.textYellow400]}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/getStarted"
              style={[tw.textBlue500, tw.underline, tw.textYellow400]}
            >
              Privacy Policy
            </Link>
          </TextComponent>
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default SignupScreen;
