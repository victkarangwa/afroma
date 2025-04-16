import Input from "@/components/input";
import ModalComponent from "@/components/Modal";
import BottomModal from "@/components/Modal/BottomSheet";
import TextComponent from "@/components/Text";
import { genders, profileTabs } from "@/constants";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import {
  getCustomPlaceholder,
  separateTextWithSpace,
  transformToProfileAnswer,
} from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, Checkbox, RadioButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";
import PictureForm from "./pictures";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import Spinner from "@/components/Spinner";
import DropDownPicker from "react-native-dropdown-picker";
import { debounce } from 'lodash';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [profileFields, setProfileFields] = useState<any>([]);
  const [openBottomSheet, setOpenBottomSheet] = useState(
    false || params.edit === "bio"
  );
  const [selectedField, setSelectedField] = useState<any>(null);
  const [userInput, setUserInput] = useState<any>({});
  const [visible, setVisible] = React.useState(false);
  const [profile, setProfile] = useState<any>({});
  const [profileAnswers, setProfileAnswers] = useState<any>({});
  const [updatedProfile, setUpdatedProfile] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [openSlect, setOpenSect] = useState(false);
  const [currentStep, setCurrentStep] = useState(Number(params.step ?? 0));

  const geProfileFields = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/settings/profile-questions"
    );

    if (result?.errors) {
      return;
    }
    setProfileFields(result);
  };

  const getMyBasicProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    if (result?.errors) {
      return;
    }
    setProfile(result);
  };

  const getMyProfileAnswers = async () => {
    setLoadingProfile(true);
    const result = await send(
      "get",
      "/bonded-user-service/user-profiling/answers"
    );

    if (result?.errors) {
      return;
    }
    setProfileAnswers(result);
    setLoadingProfile(false);
  };

  useEffect(() => {
    geProfileFields();
    getMyBasicProfile();
    getMyProfileAnswers();
  }, [updatedProfile]);

  const debouncedUpdateProfile = debounce(async (newState) => {
    const existingProfile = profileTabs[0].content.reduce(
      (acc: any, field: string) => {
        acc[field] = profile[field];
        return acc;
      },
      {}
    );

    let data;
    let result;
    if (Number(params.tab) === 1) {
      const profileAnswers = transformToProfileAnswer(newState);
      data = profileAnswers;
      result = await send(
        "post",
        "/bonded-user-service/user-profiling/save/answers",
        data
      );
    } else {
      data = {
        ...existingProfile,
        ...newState,
      };
      result = await send("put", "/bonded-user-service/users/profile", data);
    }
    if (result?.errors) {
      return setVisible(true);
    }
    setUpdatedProfile(result);
    setUserInput({});
    setOpenBottomSheet(false);
  }, 1000);

  const getFieldType = (field: any, type?: string, defaultValue?: string) => {
    const { id, fieldType, options } = field;
    switch (fieldType ?? type) {
      case "multiSelect":
        return options.map((opt: any, index: number) => (
          <View key={index} style={[tw.mYPx]}>
            <Checkbox.Item
              status={userInput[id]?.includes(opt.id) ? "checked" : "unchecked"}
              label={opt.optionText}
              onPress={() => {
                const currentValues = userInput[id] || [];
                const updatedValues = currentValues.includes(opt.id)
                  ? currentValues.filter((item: string) => item !== opt.id)
                  : [...currentValues, opt.id];

                setUserInput((prevState) => {
                  const newState = { ...prevState, [id]: updatedValues };
                  // debouncedUpdateProfile(newState);
                  return newState;
                });
              }}
            />
          </View>
        ));

      case "singleSelect":
        return (
          <RadioButton.Group
            value={userInput[id]}
            onValueChange={(newValue) => {
              setUserInput((prevState) => {
                const newState = { ...prevState, [id]: newValue };
                debouncedUpdateProfile(newState);
                return newState;
              });
            }}
          >
            {options.map((opt: any, index: number) => (
              <View
                key={index}
                style={[tw.rounded, tw.p2, tw.bgGray200, tw.mT2]}
              >
                <RadioButton.Item label={opt.optionText} value={opt.id} />
              </View>
            ))}
          </RadioButton.Group>
        );
      case "date":
        return (
          <Input
            label="Select Date"
            textColor="black"
            containerStyles={[tw.borderGray700]}
            value={moment(date).format("YYYY-MM-DD")}
            onPress={() => setShowDatePicker(true)}
            onChange={() => setShowDatePicker(true)}
            theme={{
              colors: {
                primary: "black",
                placeholder: "gray",
                onSurfaceVariant: "gray",
              },
            }}
          />
        );
      case "select":
        return (
          <View
            style={[tw.flex, tw.flexRow, tw.justifyBetween, tw.itemsCenter]}
          >
            <DropDownPicker
              // onValueChange={(value) => {
              //   setUserInput({ ...userInput, [id]: value });
              // }}
              searchTextInputStyle={[tw.bgRed400]}
              open={openSlect}
              value={userInput[id]}
              setOpen={setOpenSect}
              setValue={(value) => null}
              items={options.map((opt: any) => ({
                label: opt.optionText,
                value: opt.optionText,
              }))}
              onSelectItem={(item) => {
                setUserInput({ ...userInput, [id]: item.value });
              }}
              placeholder={`Select ${id}`}
              // placeholder={{ label: "Select Gender", value: null }}
            />
          </View>
        );
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

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios"); // Keep picker open for iOS
    setDate(currentDate);
    setUserInput({
      ...userInput,
      dateOfBirth: moment(currentDate).format("YYYY-MM-DD"),
    });
  };

  const handleContinue = async (action: string) => {
    if (action === "next") {
      if (currentStep === profileFields.length - 1) {
        return;
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      if (currentStep !== 0) setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={[tw.bgGray100, tw.hFull]}>
      {/* <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button onPress={() => setShowDatePicker(true)}>Pick a Date</Button> */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {/* </View> */}
      <ModalComponent
        title="Error"
        description={error ?? "An error occurred. Please try again."}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
      <GestureHandlerRootView>
        <TextComponent
          style={[tw.textXl, tw.fontBold, tw.textBlack, tw.p2, tw.textCenter]}
        >
          {Number(params.tab) === 1
            ? profileFields[currentStep]?.title
            : "Personal Info"}
        </TextComponent>
        {Number(params.tab) === 1 && (
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
                  tw.bgBlack,
                  tw.opacity25,
                ]}
              ></View>
              <View
                style={[
                  tw.h2,
                  {
                    width: `${
                      ((currentStep + 1) / profileFields.length) * 100
                    }%`,
                  },
                  tw.roundedFull,
                  tw.bgPink100,
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
              <Ionicons
                name="arrow-forward"
                size={24}
                style={[tw.textPink700]}
              />
            </TouchableOpacity>
          </View>
        )}
        {loadingProfile ? (
          <Spinner />
        ) : (
          <ScrollView style={[tw.mX4]}>
            {Number(params.tab) === 1 ? (
              // profileFields.map((group: any, index: number) => {
              //   return (
              <View style={[tw.mY3]}>
                {/* <Text style={[tw.fontBold, tw.textBase, tw.pY2]}>
                  {profileFields[currentStep]?.title}
                </Text> */}
                <View>
                  {profileFields[currentStep]?.questions.map(
                    (qn: any, index: number) => {
                      // const label = field.fieldName.replace(/\_/g, " ");
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[tw.mYPx]}
                          onPress={() => {
                            setSelectedField(qn);
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
                            <View style={[tw.p3, tw.w3_4]}>
                              <TextComponent
                                style={[tw.textSm, tw.mY1, tw.capitalize]}
                              >
                                {qn.question}
                              </TextComponent>
                              <TextComponent style={[tw.textXs, tw.fontBold]}>
                                {profileAnswers
                                  .find((answer: any) => answer.id === qn.id)
                                  ?.answers.map((answer: any) => answer.text)
                                  .join(", ") ??
                                  getCustomPlaceholder(qn.question).placeholder}
                              </TextComponent>
                              {/* <TextComponent style={[tw.textSm, tw.mY2]}>
                                {profile?.otherDetails?.find(
                                  (det) => det.fieldName === field.fieldName
                                )?.selectedValues ??
                                  getCustomPlaceholder(field.fieldName)
                                    .placeholder}
                              </TextComponent> */}
                            </View>
                            <View
                              style={[
                                tw.flex,
                                tw.itemsCenter,
                                tw.justifyCenter,
                              ]}
                            >
                              <Ionicons
                                name="chevron-forward-outline"
                                size={24}
                                color="gray"
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>
            ) : (
              //   );
              // })
              <View style={[tw.flex]}>
                <PictureForm profile={profile} />
                {(profileTabs[0].content as string[]).map((field: string, index: number) => {
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
                        <View
                          style={[tw.flex, tw.itemsCenter, tw.justifyCenter]}
                        >
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
        )}
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
              <View style={[tw.mY4]}>
            </View>
            </View>
            <Button
                onPress={() => debouncedUpdateProfile(userInput)}
                loading={loading}
                icon={() => <Ionicons name="save" style={[tw.textPink700]} size={16} />}
              >
                Save Changes
              </Button>
            <View>
              <TextComponent style={[tw.textXl, tw.fontBold, tw.textCenter]}>
                {
                  // getCustomPlaceholder(
                  //   Number(params.tab) === 1
                  //     ? selectedField.fieldName
                  //     : selectedField
                  // ).title
                  selectedField?.question
                }
              </TextComponent>
              <TextComponent
                style={[tw.textSm, tw.textCenter, tw.textGray700, tw.mY2]}
              >
                {
                  getCustomPlaceholder(
                    Number(params.tab) === 1
                      ? selectedField?.question
                      : selectedField
                  ).description
                }
              </TextComponent>
            </View>
            <KeyboardAwareScrollView>
              {Number(params.tab) === 1 ? (
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  style={[tw.pB8, { height: "70%" }]}
                >
                  {getFieldType(selectedField)}
                </ScrollView>
              ) : (
                (params.edit === "bio"
                  ? profileTabs[0].content?.slice(4, 5) as string[] // bio 
                  : profileTabs[0].content as string[]  
                ).map((field: string, index: number) => (
                  <View key={index}>
                    {getFieldType(
                      field === "gender"
                        ? {
                            id: "gender",
                            options: genders,
                          }
                        : field,
                      field === "dateOfBirth"
                        ? "date"
                        : field === "gender"
                        ? "select"
                        : "text",
                      field === "dateOfBirth"
                        ? profile[field]?.split("T")[0]
                        : profile[field]
                    )}
                  </View>
                ))
              )}
            </KeyboardAwareScrollView>
            {/* <View style={[tw.mY4]}>
              <Button
                mode="outlined"
                onPress={() => debouncedUpdateProfile(userInput)}
                loading={loading}
              >
                Apply Changes
              </Button>
            </View> */}
          </BottomModal>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
