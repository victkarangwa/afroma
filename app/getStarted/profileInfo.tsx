import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { tw } from "react-native-tailwindcss";
import { Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { Controller, useForm } from "react-hook-form";
import Input from "@/components/input";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import Modal from "@/components/Modal";
import * as Location from "expo-location";
import LocalStorage from "@/utils/storage";
import { saveAuthData } from "@/utils/auth";

type FormData = {
  gender: string;
  interestedIn: string;
  dateOfBirth: Date;
  publicFigure: boolean;
};

const ProfileInfoScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const { loading, send, error } = useApiRequest<ApiResponse>();
  const [visible, setVisible] = React.useState(false);
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
  const [location, setLocation] = React.useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      gender: "",
      interestedIn: "",
      dateOfBirth: new Date(),
      publicFigure: false,
    },
  });

  const dateOfBirth = watch("dateOfBirth");
  const age = dateOfBirth
    ? moment().diff(moment(dateOfBirth), "years")
    : "-";

  const onSubmit = async (data: FormData) => {
    try {
      // Debug: Log all params to see what's being passed
      console.log("All params:", params);
      
      // Validate profile form data
      if (!data.gender) {
        setModalInfo({
          title: "Error",
          description: "Please select your gender.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }

      if (isDatingProfile && !data.interestedIn) {
        setModalInfo({
          title: "Error",
          description: "Please select who you're interested in.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }

      if (!data.dateOfBirth) {
        setModalInfo({
          title: "Error",
          description: "Please select your date of birth.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }

      // Validate date of birth (must be at least 18 years old)
      const age = moment().diff(moment(data.dateOfBirth), "years");
      if (age < 21) {
        setModalInfo({
          title: "Error",
          description: "You must be at least 21 years old to register.",
          status: "error",
          btnText: "OK",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }
      
      // Get the basic registration data from params
      const basicData = {
        name: params.name as string,
        email: params.email as string,
        phone_number: params.phone_number as string,
        password: params.password as string,
      };

      console.log("Basic data from params:", basicData);

      // Validate that we have the required data
      if (!basicData.name || !basicData.email || !basicData.password) {
        console.error("Missing required registration data!");
        setModalInfo({
          title: "Error",
          description: "Missing required registration data. Please try again.",
          status: "error",
          btnText: "Go Back",
          onDismiss: () => {
            router.push("/getStarted/accountType");
            setVisible(false);
          },
        });
        setVisible(true);
        return;
      }

      // Combine with profile data
      const requestData = {
        ...basicData,
        gender: data.gender,
        interestedIn: isDatingProfile ? data.interestedIn : "Male",
        dateOfBirth: moment(data.dateOfBirth).format("YYYY-MM-DD") + "T00:00:00.000Z",
        latitude: location?.coords?.latitude || 0,
        longitude: location?.coords?.longitude || 0,
        publicFigure: data.publicFigure,
        socialMediaSignup: false,
        profileTypes: [params.profileType || "NETWORKING"]
      };

      console.log("Registration request:", requestData);

      const result = await send(
        "post",
        "/users/register",
        requestData
      );

      console.log("Registration result:",);

      if (result && result.errors) {
        setModalInfo({
          title: "Error",
          description: result.errors || "An error occurred. Please try again.",
          status: "error",
          btnText: "Try Again",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
        return;
      }

      console.log("Registration result:", result);

      // Check for successful registration response
      if (result && result.code === "00" && result.token) {
        // Store the token for future use
        await saveAuthData(result.token, result.expiresAt);
        
        console.log("Registration successful, token stored:", result.token);
        
        // Success - navigate to complete profile
        setModalInfo({
          title: "Success",
          description: "Account created successfully!",
          status: "success",
          btnText: "Continue",
          onDismiss: () => {
            router.push({ 
              pathname: "/form/completeProfile", 
              params: { 
                purpose: params.purpose || "networking",
                fromRegistration: "true"
              } 
            });
            setVisible(false);
          },
        });
        setVisible(true);
      } else {
        // Handle unexpected response format
        setModalInfo({
          title: "Error",
          description: "Registration completed but received unexpected response format.",
          status: "error",
          btnText: "Try Again",
          onDismiss: () => setVisible(false),
        });
        setVisible(true);
      }

    } catch (error) {
      console.log("Registration error:", error);
      setModalInfo({
        title: "Error",
        description: "An error occurred during registration. Please try again.",
        status: "error",
        btnText: "Try Again",
        onDismiss: () => setVisible(false),
      });
      setVisible(true);
    }
  };

  // Check if this is a dating/relationship profile
  const isDatingProfile = params.profileType === "DATING";

  // Get location permission
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  React.useEffect(() => {
    getLocation();
  }, []);

  const GENDER_OPTIONS = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Non-binary", value: "NonBinary" },
  ];

  const INTERESTED_IN_OPTIONS = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Non-binary", value: "NonBinary" },
  ];

  return (
    <View style={[tw.bgPink100, tw.hFull, tw.pX8]}>
      <Modal
        title={modalInfo.title}
        description={modalInfo.description}
        visible={visible}
        status={modalInfo.status}
        btnText={modalInfo.btnText}
        onDismiss={modalInfo.onDismiss || (() => {})}
      />
      <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
        <Image
          source={require("../../assets/images/afroma_logo.png")}
          style={[tw.w32, tw.h32, tw.mT24]}
        />
        <Text style={[tw.textPink700, tw.text2xl, tw.fontBold, tw.mT4]}>
          Complete Your Profile
        </Text>
        <Text style={[tw.textGray700, tw.textBase, tw.textCenter, tw.mT2]}>
          Help us personalize your experience
        </Text>
      </View>

      <ScrollView style={[tw.flex1, tw.mT8]} showsVerticalScrollIndicator={false}>
        {/* Gender Selection */}
        <View style={[tw.mB6]}>
          <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB3]}>
            What's your gender?
          </Text>
          <View style={[tw.flexRow, tw.flexWrap]}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  tw.bgWhite,
                  tw.pX4,
                  tw.pY3,
                  tw.roundedLg,
                  tw.mR3,
                  tw.mB3,
                  tw.border2,
                  watch("gender") === option.value
                    ? tw.borderPink700
                    : tw.borderGray300,
                ]}
                onPress={() => setValue("gender", option.value)}
              >
                <Text
                  style={[
                    watch("gender") === option.value
                      ? tw.textPink700
                      : tw.textGray700,
                    tw.fontBold,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && (
            <Text style={[tw.textRed600, tw.textSm, tw.mT1]}>
              Please select your gender
            </Text>
          )}
        </View>

        {/* Interested In Selection - Only show for dating profiles */}
        {isDatingProfile && (
          <View style={[tw.mB6]}>
            <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB3]}>
              Who are you interested in?
            </Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {INTERESTED_IN_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    tw.bgWhite,
                    tw.pX4,
                    tw.pY3,
                    tw.roundedLg,
                    tw.mR3,
                    tw.mB3,
                    tw.border2,
                    watch("interestedIn") === option.value
                      ? tw.borderPink700
                      : tw.borderGray300,
                  ]}
                  onPress={() => setValue("interestedIn", option.value)}
                >
                  <Text
                    style={[
                      watch("interestedIn") === option.value
                        ? tw.textPink700
                        : tw.textGray700,
                      tw.fontBold,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.interestedIn && (
              <Text style={[tw.textRed600, tw.textSm, tw.mT1]}>
                Please select who you're interested in
              </Text>
            )}
          </View>
        )}

        {/* Date of Birth */}
        <View style={[tw.mB6]}>
          <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB3]}>
            What is your date of birth?
          </Text>
          <TouchableOpacity
            style={[
              tw.bgWhite,
              tw.p4,
              tw.roundedLg,
              tw.border2,
              tw.borderGray300,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[tw.textGray700, tw.textBase]}>
              {moment(dateOfBirth).format("MMMM DD, YYYY")}
            </Text>
            <Text style={[tw.textGray500, tw.textSm, tw.mT1]}>
              Age: {age} years old
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setValue("dateOfBirth", selectedDate);
              }}
              maximumDate={new Date()}
            />
          )}
          {errors.dateOfBirth && (
            <Text style={[tw.textRed600, tw.textSm, tw.mT1]}>
              Please select your date of birth
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[tw.mT6, tw.mB8]}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[tw.bgPink700, tw.roundedFull]}
          labelStyle={[tw.textWhite, tw.fontBold]}
          loading={loading}
          disabled={
            loading ||
            !watch("gender") ||
            (isDatingProfile && !watch("interestedIn")) ||
            !dateOfBirth
          }
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </View>
    </View>
  );
};

export default ProfileInfoScreen; 