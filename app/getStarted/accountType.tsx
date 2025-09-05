import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { View, Image, TouchableOpacity, TextInput, Text, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { tw } from "react-native-tailwindcss";
import moment from "moment";
import { FontAwesome } from '@expo/vector-icons';


type FormData = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
};

const AccountTypeScreen: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
    },
  });

  const onSubmit = (data: FormData) => {
    // Validate all required fields
    if (!data.name || !data.email || !data.phone_number || !data.password) {
      console.error("Missing required fields:", data);
      return;
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(data.email)) {
      console.error("Invalid email format");
      return;
    }

    // Validate password length
    if (data.password.length < 6) {
      console.error("Password too short");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(data.phone_number)) {
      console.error("Invalid phone number format");
      return;
    }

    // Store the basic registration data
    const registrationData = {
      ...data,
      phone_number: data.phone_number.slice(1), // Remove the + prefix
    };
    
    console.log("Basic registration data:", registrationData);
    
    // Navigate to lookingFor with the data
    router.push({ 
      pathname: "/getStarted/lookingFor", 
      params: { 
        registrationData: JSON.stringify(registrationData)
      } 
    });
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
      <View style={[tw.itemsCenter, tw.mB8]}>
        <Image
          source={require("../../assets/images/afroma_logo.png")}
          style={[tw.w32, tw.h32, tw.mT24]}
        />
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>Create Account</Text>
      </View>
      <View style={[tw.mT8]}>
        {/* Full Name */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Full Name</Text>
        <Controller
          control={control}
          name="name"
          rules={{ required: "Full name is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
              placeholder="Enter your full name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.name.message}</Text>
        )}

        {/* Email */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{ 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.email.message}</Text>
        )}

        {/* Phone Number */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Phone Number</Text>
        <Controller
          control={control}
          name="phone_number"
          rules={{ 
            required: "Phone number is required",
            pattern: {
              value: /^\+[1-9]\d{1,14}$/,
              message: "Please enter a valid phone number with country code (e.g., +1234567890)"
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
              placeholder="Enter phone number with country code (e.g., +1234567890)"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.phone_number && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.phone_number.message}</Text>
        )}

        {/* Password */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
              placeholder="Enter a secure password"
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

        {/* Validation Summary */}
        {(!watch("name") || !watch("email") || !watch("phone_number") || !watch("password") || watch("password").length < 6 || !/^\+[1-9]\d{1,14}$/.test(watch("phone_number"))) && (
          <View style={[tw.bgRed100, tw.p3, tw.rounded, tw.mT2]}>
            <Text style={[tw.textRed700, tw.textSm, tw.fontBold]}>Please complete all fields:</Text>
            {!watch("name") && <Text style={[tw.textRed600, tw.textSm]}>• Full name is required</Text>}
            {!watch("email") && <Text style={[tw.textRed600, tw.textSm]}>• Valid email is required</Text>}
            {!watch("phone_number") && <Text style={[tw.textRed600, tw.textSm]}>• Phone number with country code is required</Text>}
            {!watch("password") && <Text style={[tw.textRed600, tw.textSm]}>• Password is required</Text>}
            {watch("password") && watch("password").length < 6 && <Text style={[tw.textRed600, tw.textSm]}>• Password must be at least 6 characters</Text>}
            {watch("phone_number") && !/^\+[1-9]\d{1,14}$/.test(watch("phone_number")) && <Text style={[tw.textRed600, tw.textSm]}>• Phone number must be valid (e.g., +1234567890)</Text>}
          </View>
        )}
        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[tw.bgPink700, tw.mT4]}
          labelStyle={[tw.textWhite]}
          disabled={
            !watch("name") ||
            !watch("email") ||
            !watch("phone_number") ||
            !watch("password") ||
            watch("password").length < 6 ||
            !/^\+[1-9]\d{1,14}$/.test(watch("phone_number"))
          }
        >
          Continue
        </Button>

        {/* Already have an account? */}
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
          <Text style={[tw.textGray700]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/getStarted/login')}>
            <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AccountTypeScreen;
