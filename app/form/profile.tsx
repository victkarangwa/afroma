import Input from "@/components/input";
import ModalComponent from "@/components/Modal";
import BottomModal from "@/components/Modal/BottomSheet";
import TextComponent from "@/components/Text";
import { profileTabs } from "@/constants";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import {
  getCustomPlaceholder,
  separateTextWithSpace,
  transformToOtherDetails,
} from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, Checkbox, RadioButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";
import PictureForm from "./pictures";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [profileFields, setProfileFields] = useState<any>([]);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [userInput, setUserInput] = useState<any>({});
  const [visible, setVisible] = React.useState(false);
  const [profile, setProfile] = useState<any>({});
  const [updatedProfile, setUpdatedProfile] = useState<any>(null);

  const geProfileFields = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/settings/profile-fields"
    );

    if (result?.errors) {
      return;
    }
    setProfileFields(result);
  };

  const getMyProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    if (result?.errors) {
      console.log("---", result?.errors);
      return;
    }
    setProfile(result);
  };

  useEffect(() => {
    geProfileFields();
    getMyProfile();
  }, [updatedProfile]);

  const getFieldType = (field: any, type?: string, defaultValue?: string) => {
    const { fieldName, fieldType, possibleValues } = field;
    switch (fieldType ?? type) {
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
                    ? currentValues.filter((item: string) => item !== value) // Remove if already selected
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
      case "date":
      default:
        return (
          <Input
            label={separateTextWithSpace(
              Number(params.tab) === 1 ? field.fieldName : field
            )}
            placeholder={
              getCustomPlaceholder(
                Number(params.tab) === 1 ? field.fieldName : field
              ).placeholder
            }
            textColor="black"
            containerStyles={[tw.borderGray700]}
            defaultValue={defaultValue}
            onChangeText={(text) => {
              setUserInput({
                ...userInput,
                [Number(params.tab) === 1 ? field.fieldName : field]: text,
              });
            }}
            theme={{
              colors: {
                primary: "black",
                placeholder: "gray",
                onSurfaceVariant: "gray",
              },
            }}
          />
        );
    }
  };

  const updateMyProfile = async () => {
    const existingProfile = profileTabs[0].content.reduce(
      (acc: any, field: string) => {
        acc[field] = profile[field];
        return acc;
      },
      {}
    );

    let data;
    if (Number(params.tab) === 1) {
      const otherDetails = transformToOtherDetails(userInput);
      data = {
        otherDetails: otherDetails,
      };
    } else {
      data = {
        ...existingProfile,
        ...userInput,
        otherDetails: [],
      };
    }
    const result = await send(
      "put",
      "/bonded-user-service/users/profile",
      data
    );
    if (result?.errors) {
      return setVisible(true);
    }
    setUpdatedProfile(result);
    setUserInput({});
    setOpenBottomSheet(false);
    router.push(`/profile?refresh=${new Date().getTime()}`);
  };

  return (
    <SafeAreaView style={[tw.bgGray100, tw.hFull]}>
      <ModalComponent
        title="Error"
        description={error ?? "An error occurred. Please try again."}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
      <GestureHandlerRootView>
        <TextComponent
          style={[tw.textXl, tw.fontBold, tw.textPink700, tw.p4, tw.textCenter]}
        >
          Let's get to know you better
        </TextComponent>
        <ScrollView style={[tw.mX4]}>
          {Number(params.tab) === 1 ? (
            <View>
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
                          style={[tw.fontBold, tw.mY1, tw.capitalize]}
                        >
                          {label}
                        </TextComponent>
                        <TextComponent style={[tw.textSm, tw.mY2]}>
                          {profile?.otherDetails?.find(
                            (det) => det.fieldName === field.fieldName
                          )?.selectedValues ??
                            getCustomPlaceholder(field.fieldName).placeholder}
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
            </View>
          ) : (
            <View style={[tw.flex]}>
              <PictureForm profile={profile} />
              {profileTabs[0].content.map((field: string, index: number) => {
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
                          style={[
                            tw.textBase,
                            tw.fontBold,
                            tw.mY1,
                            tw.capitalize,
                          ]}
                        >
                          {separateTextWithSpace(field)}
                        </TextComponent>
                        <TextComponent style={[tw.mY2]}>
                          {field === "dateOfBirth"
                            ? profile[field]?.split("T")[0]
                            : profile[field] ??
                              getCustomPlaceholder(field).placeholder}
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
            </View>
          )}
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
                children={undefined}
              />
            </View>
            <View>
              <TextComponent style={[tw.textXl, tw.fontBold, tw.textCenter]}>
                {
                  getCustomPlaceholder(
                    Number(params.tab) === 1
                      ? selectedField.fieldName
                      : selectedField
                  ).title
                }
              </TextComponent>
              <TextComponent
                style={[tw.textSm, tw.textCenter, tw.textGray700, tw.mY2]}
              >
                {
                  getCustomPlaceholder(
                    Number(params.tab) === 1
                      ? selectedField.fieldName
                      : selectedField
                  ).description
                }
              </TextComponent>
            </View>
            <KeyboardAwareScrollView>
              {Number(params.tab) === 1 ? (
                <View>{getFieldType(selectedField)}</View>
              ) : (
                profileTabs[0].content.map((field: string, index: number) => (
                  <View key={index}>
                    {getFieldType(
                      field,
                      null,
                      field === "dateOfBirth"
                        ? profile[field]?.split("T")[0]
                        : profile[field]
                    )}
                  </View>
                ))
              )}
            </KeyboardAwareScrollView>
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
