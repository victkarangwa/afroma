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
import { Link, useRouter } from "expo-router";
import AuthScreenLayout from "@/components/AuthScreensLayout";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import Modal from "@/components/Modal";

type FormData = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
};
const SignupScreen: React.FC = () => {
  const router = useRouter();
  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [visible, setVisible] = React.useState(false);

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

    const result = await send("post", "/bonded-user-service/users/register", {
      name,
      email,
      phone_number,
      password,
    });
    if (result?.errors) {
      return setVisible(true);
    }
    router.push({ pathname: "/getStarted/login" });
  };
  return (
    <AuthScreenLayout>
      <Modal
        title="Error"
        description={error || "An error occurred. Please try again."}
        visible={visible}
        onDismiss={() => setVisible(false)}
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
              <Input
                label="Phone"
                left={<TextInput.Icon icon="cellphone" color="gray" />}
                onBlur={onBlur}
                onChangeText={(value) => onChange(value)}
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
            onPress={() => console.log("Pressed")}
            mode="outlined"
            style={[tw.mX8, tw.mY2]}
            icon={"google"}
            labelStyle={[tw.mL8]}
          >
            <TextComponent style={[tw.pL12]}>
              Signup with Google{"    "}
            </TextComponent>
          </Button>
          <Button
            onPress={() => console.log("Pressed")}
            mode="outlined"
            style={[tw.mX8, tw.mY2]}
            icon={"facebook"}
          >
            <TextComponent> Signup with Facebook</TextComponent>
          </Button>
        </View>
        <View style={[tw.mT4]}>
          <TextComponent
            variant="labelSmall"
            style={[tw.textCenter, tw.textWhite, tw.opacity75]}
          >
            Already have an account?
            <Link href="/getStarted/login" style={[tw.textBlue500]}>
              {" "}
              Login
            </Link>
          </TextComponent>
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default SignupScreen;
