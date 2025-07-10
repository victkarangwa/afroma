import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { View, Image, TouchableOpacity, TextInput, Text } from "react-native";
import { Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { tw } from "react-native-tailwindcss";
import moment from "moment";
import { FontAwesome } from '@expo/vector-icons';

type FormData = {
  fullName: string;
  password: string;
  dateOfBirth: Date;
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
      fullName: "",
      password: "",
      dateOfBirth: new Date(),
    },
  });

  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const dateOfBirth = watch("dateOfBirth");
  const age = dateOfBirth
    ? moment().diff(moment(dateOfBirth), "years")
    : "-";

  const onSubmit = (data: FormData) => {
    // You can handle the data here (e.g., send to API or navigate)
    router.push(`/getStarted/lookingFor`);
  };

  const primaryShadow = {
    shadowColor: '#fb6c31',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.33,
    shadowRadius: 8,
    elevation: 4,
  };

  return (
    <View style={[{ backgroundColor: '#FFFFFF' }, tw.hFull, tw.pX8, tw.justifyCenter]}>
      <View style={[tw.itemsCenter]}>
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
          name="fullName"
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
        {errors.fullName && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.fullName.message}</Text>
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
        {/* Date of Birth */}
        <Text style={[tw.textPink700, tw.textBase, tw.fontBold, tw.mB2]}>Date of Birth</Text>
        <Controller
          control={control}
          name="dateOfBirth"
          rules={{
            required: "Date of birth is required",
            validate: (date) => {
              if (!date) return "Date of birth is required";
              if (moment(date).isAfter(moment())) return "Date cannot be in the future";
              return true;
            },
          }}
          render={({ field: { value, onChange } }) => (
            <>
              <TouchableOpacity
                style={[tw.bgWhite, tw.rounded, tw.p3, tw.mB2, primaryShadow]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{moment(value).format("YYYY-MM-DD")}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={value || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) onChange(selectedDate);
                  }}
                  maximumDate={new Date()}
                  style={[tw.bgWhite]}
                />
              )}
            </>
          )}
        />
        {errors.dateOfBirth && (
          <Text style={[tw.textRed500, tw.mB2]}>{errors.dateOfBirth.message}</Text>
        )}
        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[tw.bgPink700, tw.mT4]}
          labelStyle={[tw.textWhite]}
        >
          Continue
        </Button>
        {/* Social Login */}
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
          <View style={[tw.flex1, tw.hPx, tw.bgGray300, tw.mR2]} />
          <Text style={[tw.textGray500, tw.textSm]}>or sign up with</Text>
          <View style={[tw.flex1, tw.hPx, tw.bgGray300, tw.mL2]} />
        </View>
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT4]}>
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={() => {/* TODO: Add Facebook login */}}>
            <FontAwesome name="facebook" size={24} color="#1877F3" />
          </TouchableOpacity>
          <TouchableOpacity style={[tw.bgWhite, tw.roundedFull, tw.p3, primaryShadow, tw.mX2]} onPress={() => {/* TODO: Add Google login */}}>
            <FontAwesome name="google" size={24} color="#EA4335" />
          </TouchableOpacity>
        </View>
        {/* Already have an account? */}
        <View style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mT8]}>
          <Text style={[tw.textGray700]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/getStarted/login')}>
            <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AccountTypeScreen;
