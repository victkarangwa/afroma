import Input from "@/components/input";
import TextComponent from "@/components/Text";
import { profileRegistrationFields } from "@/constants";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { Image, Platform, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";
import { tw } from "react-native-tailwindcss";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import CustomDatePicker from "@/components/input/date";

type FormData = {
  code: string;
};

const AccountTypeScreen: React.FC = () => {
  const router = useRouter();

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      code: "",
    },
  });

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [visible, setVisible] = React.useState(false);
  const [publicFigure, setPublicFigure] = React.useState(false);
  const [profileFields, setProfileFields] = React.useState<{ [key: string]: any }>({});
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [date, setDate] = React.useState(new Date());

  const handleContinue = async (action: string) => {
    if (action === "next") {
      if (currentStep === profileRegistrationFields.length - 1) {
        router.push(
          `/getStarted?profileFields=${JSON.stringify(profileFields)}`
        );
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      if (currentStep !== 0) setCurrentStep(currentStep - 1);
    }
  };

  const goToLogin = async () => {
    router.push(`/getStarted/login`);
  };

  const handleModal = () => setVisible(false);

  const accountTypes = [
    { id: 1, value: false, label: "Regular User" },
    { id: 1, value: true, label: "Public Figure" },
  ];

  const onDateChange = (selectedDate: Date) => {
    // const currentDate = selectedDate || date;
    // setShowDatePicker(Platform.OS === "ios");
    // setDate(currentDate);
    setProfileFields({
      ...profileFields,
      dateOfBirth: selectedDate,
    });
  };
  return (
    <View style={[tw.bgPink100, tw.hFull]}>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          style={[tw.bgWhite]}
        />
      )}
      <View style={[tw.flex, tw.itemsCenter, tw.pX8]}>
        <Image
          source={require("../../assets/images/parenti_logo.png")}
          style={[tw.w32, tw.h32, tw.mT24]}
        />
      </View>
      {/* <KeyboardAwareScrollView> */}
        <View style={[tw.mB8]} key={profileRegistrationFields[currentStep].id}>
          <TextComponent
            style={[
              tw.textWhite,
              tw.textLg,
              tw.mX4,
              tw.mY2,
              tw.textCenter,
              tw.fontBold,
            ]}
          >
            {profileRegistrationFields[currentStep].label}
          </TextComponent>
          <View
            style={[
              tw.flex,
              tw.flexRow,
              tw.justifyCenter,
              tw.itemsCenter,
              tw.mY6,
            ]}
          >
            {profileRegistrationFields[currentStep].fieldType ===
            "singleSelect" ? (
              profileRegistrationFields[currentStep]?.options?.map(
                (opt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      tw.border,
                      tw.borderPink700,
                      // tw.w1_12,
                      tw.mX2,
                      tw.rounded,
                      tw.mPx,
                      profileFields[
                        profileRegistrationFields[currentStep].field as any
                      ] === opt.value
                        ? tw.bgPink700
                        : tw.bgTransparent,
                    ]}
                    onPress={() => {
                      setProfileFields({
                        ...profileFields,
                        [profileRegistrationFields[currentStep].field]:
                          opt.value,
                      });
                    }}
                  >
                    <TextComponent style={[tw.p3, tw.textWhite, tw.textCenter]}>
                      {opt.optionText}
                    </TextComponent>
                  </TouchableOpacity>
                )
              )
            ) : (
              <View style={[tw.w3_4]}>
                 <CustomDatePicker onDateChange={onDateChange} />
                {/* <Input
                  label="Date of Birth"
                  value={moment(date).format("YYYY-MM-DD")}
                  onPress={() => setShowDatePicker(true)}
                /> */}
              </View>
            )}
          </View>
        </View>
      {/* </KeyboardAwareScrollView> */}
      <View style={[tw.mY16]}>
        <View style={[tw.flex, tw.flexRow, tw.justifyAround, tw.itemsCenter]}>
          <TouchableOpacity
            onPress={() => handleContinue("back")}
            style={[
              tw.mY4,
              tw.p2,
              { backgroundColor: "#38364a" },
              tw.roundedFull,
              tw.shadow2xl,
            ]}
          >
            <Ionicons name="arrow-back" size={24} style={[tw.textPink700]} />
          </TouchableOpacity>
          <View style={[tw.relative, tw.w2_4]}>
            <View
              style={[
                tw.absolute,
                tw.h2,
                tw.wFull,
                tw.roundedFull,
                tw.bgWhite,
                tw.opacity25,
              ]}
            ></View>
            <View
              style={[
                tw.h2,
                {
                  width: `${
                    ((currentStep + 1) /
                      (profileRegistrationFields.length + 1)) *
                    100
                  }%`,
                },
                tw.roundedFull,
                tw.bgPink700,
              ]}
            ></View>
          </View>
          <TouchableOpacity
            onPress={() => handleContinue("next")}
            style={[
              tw.mY4,
              tw.p2,
              { backgroundColor: "#38364a" },
              tw.roundedFull,
              tw.shadow2xl,
            ]}
          >
            <Ionicons name="arrow-forward" size={24} style={[tw.textPink700]} />
          </TouchableOpacity>
        </View>
        <Button
          onPress={goToLogin}
          mode="text"
          style={[tw.mX8, tw.mY2]}
          labelStyle={[tw.textBlack, tw.textPink700]}
          loading={loading}
        >
          Continue to Login
        </Button>
      </View>
    </View>
  );
};

export default AccountTypeScreen;
