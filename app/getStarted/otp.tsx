import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { View, Image, TextInput, Text, TouchableOpacity } from "react-native";
import { Button } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import { FontAwesome } from '@expo/vector-icons';
import OTPTextView from "react-native-otp-textinput";
// import useApiRequest from "@/hooks/useApiRequest";
// import { ApiResponse } from "@/types";
// import Modal from "@/components/Modal";
// import localStore from "@/utils/localValues";
// import LocalStorage from "@/utils/storage";

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
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { code: "" },
  });
  // const { loading, send, error } = useApiRequest<ApiResponse>();
  // const [visible, setVisible] = React.useState(false);

  const onSubmit = (data: FormData) => {
    // Temporarily skip API call and go to main screen
    // const result = await send("post", "/bonded-user-service/auth/login-auth2", { code: data.code });
    // if (result?.errors) { setVisible(true); return; }
    // LocalStorage.setItem(localStore.token, result?.token);
    router.push({ pathname: "/(tabs)" });
  };

  return (
    <View style={[{ backgroundColor: '#FFFFFF' }, tw.hFull, tw.pX8, tw.justifyCenter]}>
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
                fontSize: 20,
                color: '#111827',
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
