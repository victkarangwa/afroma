import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { tw } from "react-native-tailwindcss";
import { heightPercentageToDP } from "react-native-responsive-screen";
import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import { introText } from "@/constants/text";
import Input from "@/components/input";
import {
  Button,
  Checkbox,
  Chip,
  Divider,
  RadioButton,
  TextInput,
} from "react-native-paper";
import { Link, useRouter } from "expo-router";
import Separator from "@/components/Separator";
import OTPTextView from "react-native-otp-textinput";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "react-native-circular-progress-indicator";
import {
  getCustomPlaceholder,
  removeUserData,
  transformToOtherDetails,
} from "@/utils";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import BottomModal from "@/components/Modal/BottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ModalComponent from "@/components/Modal";

const ProfileScreen: React.FC = () => {
  const router = useRouter();

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [profileFields, setProfileFields] = useState<any>([]);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [userInput, setUserInput] = useState<any>({});
  const [visible, setVisible] = React.useState(false);

  const getMyProfile = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/settings/profile-fields"
    );

    if (result?.errors) {
      return;
    }
    setProfileFields(result);
  };

  useEffect(() => {
    getMyProfile();
  }, []);

  const getFieldType = (field: any) => {
    const { fieldName, fieldType, possibleValues } = field;
    switch (fieldType) {
      case "multiSelect":
        return JSON.parse(possibleValues).map(
          (value: string, index: number) => (
            <View key={index} style={[tw.mY2]}>
              <Checkbox.Item
                status={
                  userInput[fieldName]?.includes(value)
                    ? "checked"
                    : "unchecked"
                }
                label={value}
                onPress={() => {
                  const currentValues = userInput[fieldName] || [];
                  const updatedValues = currentValues.includes(value)
                    ? currentValues.filter((item) => item !== value) // Remove if already selected
                    : [...currentValues, value]; // Add if not selected

                  setUserInput({ ...userInput, [fieldName]: updatedValues });
                }}
              />
            </View>
          )
        );

      case "singleSelect":
        return (
          <RadioButton.Group
            value={userInput[fieldName]}
            onValueChange={(newValue) => {
              setUserInput({ ...userInput, [fieldName]: newValue });
            }}
          >
            {JSON.parse(possibleValues).map((value: string, index: number) => (
              <View
                key={index}
                style={[tw.rounded, tw.p2, tw.bgGray200, tw.mT2]}
              >
                <RadioButton.Item label={value} value={value} />
              </View>
            ))}
          </RadioButton.Group>
        );
      default:
        return (
          <Input
            label={field.fieldName}
            placeholder={getCustomPlaceholder(field.fieldName).placeholder}
            textColor="black"
            containerStyles={[tw.borderGray700]}
            onChangeText={(text) => {
              setUserInput({ ...userInput, [fieldName]: text });
            }}
          />
        );
    }
  };

  const updateMyProfile = async () => {
    const otherDetails = transformToOtherDetails(userInput);
    console.log("---otherDetails---", otherDetails, userInput);
    const data = {
      otherDetails: otherDetails,
    };
    const result = await send(
      "put",
      "/bonded-user-service/users/profile",
      data
    );

    // console.log("___UPDATE-PROFILE___", result);
    if (result?.errors) {
      return setVisible(true);
    }
    setUserInput({});
    setOpenBottomSheet(false);
    router.push(`/profile?refresh=${new Date().getTime()}`);
  };

  return (
    <SafeAreaView style={[tw.bgGray100, tw.hFull, tw.m4]}>
      <ModalComponent
        title="Error"
        description={error ?? "An error occurred. Please try again."}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
      <GestureHandlerRootView>
        <TextComponent style={[tw.textXl, tw.fontBold, tw.mY2, tw.textPink700]}>
          Let's get to know you better
        </TextComponent>
        <ScrollView>
          {profileFields?.map((field: any, index: number) => {
            const label = field.fieldName.replace(/\_/g, " ");
            return (
              <TouchableOpacity
                key={index}
                style={[tw.mY1]}
                onPress={() => {
                  setSelectedField(field);
                  setOpenBottomSheet(true);
                }}
              >
                <View
                  style={[
                    tw.bgWhite,
                    tw.pX3,
                    tw.pX2,
                    tw.rounded,
                    tw.flex,
                    tw.flexRow,
                    tw.justifyBetween,
                  ]}
                >
                  <View>
                    <TextComponent
                      style={[tw.textXl, tw.fontBold, tw.mY1, tw.capitalize]}
                    >
                      {label}
                    </TextComponent>
                    <TextComponent style={[tw.textSm, tw.mY2]}>
                      {getCustomPlaceholder(field.fieldName).placeholder}
                    </TextComponent>
                  </View>
                  <View style={[tw.flex, tw.itemsCenter, tw.justifyCenter]}>
                    <Ionicons
                      name="chevron-forward-outline"
                      size={24}
                      color="gray"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {openBottomSheet && (
          <BottomModal>
            <View style={[tw.flex, tw.flexRow, tw.justifyEnd]}>
              <Button
                icon={() => <Ionicons name="close" size={24} />}
                onPress={() => {
                  setOpenBottomSheet(false);
                  setUserInput({});
                }}
              />
            </View>
            <View>
              <TextComponent style={[tw.textXl, tw.fontBold, tw.textCenter]}>
                {getCustomPlaceholder(selectedField.fieldName).title}
              </TextComponent>
              <TextComponent
                style={[tw.textSm, tw.textCenter, tw.textGray700, tw.mY2]}
              >
                {getCustomPlaceholder(selectedField.fieldName).description}
              </TextComponent>
            </View>
            <View>{getFieldType(selectedField)}</View>
            <View style={[tw.mY4]}>
              <Button
                mode="outlined"
                onPress={updateMyProfile}
                loading={loading}
              >
                Apply Changes
              </Button>
            </View>
          </BottomModal>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
