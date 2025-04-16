import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
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
import { introText, profileFillIntroText } from "@/constants/text";
import Input from "@/components/input";
import { Button, Chip, Divider, TextInput } from "react-native-paper";
import {
  Link,
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import Separator from "@/components/Separator";
import OTPTextView from "react-native-otp-textinput";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "react-native-circular-progress-indicator";
import {
  convertImgToBase64,
  gateUserAge,
  getProfileCompletion,
  prepareImgForUpload,
  removeUserData,
  separateTextWithSpace,
} from "@/utils";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { constantUserData, profileTabs } from "@/constants";
import moment from "moment";
import * as ImagePicker from "expo-image-picker";
import Spinner from "@/components/Spinner";
import { Text } from "react-native";

const ProfileScreen: React.FC = () => {
  const router = useRouter();

  const params = useLocalSearchParams();

  const { loading, send } = useApiRequest<ApiResponse>();

  const [profile, setProfile] = useState<any>({});
  const [profileFields, setProfileFields] = useState<any>([]);
  const [activeTab, setActiveTab] = useState(params?.tab ?? 0);
  const [updatedProfile, setUpdatedProfile] = useState<{
    featuredPhoto: any | null;
    tempImageUri: string | null;
    isUploading: boolean;
  }>({
    featuredPhoto: null,
    tempImageUri: null,
    isUploading: false,
  });
  const [profileAnswers, setProfileAnswers] = useState<any>({});

  const getMyBasicProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    if (result?.errors) {
      handleLogout();
      return;
    }
    setProfile(result);
  };

  const getMyProfileAnswers = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/user-profiling/answers"
    );

    if (result?.errors) {
      return;
    }
    setProfileAnswers(result);
  };

  const getProfileField = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/settings/profile-questions"
    );

    if (result?.errors) {
      return;
    }
    setProfileFields(result);
  };

  // Fetch fresh data every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      getMyBasicProfile();
      getProfileField();
      getMyProfileAnswers();
    }, [])
  );

  const handleLogout = async () => {
    const result = await send("post", "/bonded-user-service/auth/logout");
    removeUserData();
    router.push({ pathname: "/getStarted/login" });
  };

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
  };

  const updateProfilePicture = async (data: any) => {
    try {
      setUpdatedProfile(
        (prev: {
          featuredPhoto: any | null;
          tempImageUri: string | null;
          isUploading: boolean;
        }) => ({ ...prev, isUploading: true })
      );
      const result = await send(
        "post",
        "/bonded-user-service/media/upload",
        data
      );
      // console.log("result", result);
      if (result?.errors) {
        // If upload fails, clear the temporary image
        setUpdatedProfile(
          (prev: {
            featuredPhoto: any | null;
            tempImageUri: string | null;
            isUploading: boolean;
          }) => ({ ...prev, tempImageUri: null, isUploading: false })
        );
        return;
      }
      setUpdatedProfile({
        ...updatedProfile,
        featuredPhoto: result,
        tempImageUri: null,
        isUploading: false,
      });
      // Refresh profile data after successful upload
      await getMyBasicProfile();
    } catch (error) {
      // If upload fails, clear the temporary image
      setUpdatedProfile(
        (prev: {
          featuredPhoto: any | null;
          tempImageUri: string | null;
          isUploading: boolean;
        }) => ({ ...prev, tempImageUri: null, isUploading: false })
      );
    }
  };

  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return;
    }

    // Launch the media library
    const result = (await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })) as any;

    if (!result.canceled && result.assets[0]) {
      // Immediately show the selected image
      setUpdatedProfile(
        (prev: { featuredPhoto: any | null; tempImageUri: string | null }) => ({
          ...prev,
          tempImageUri: result.assets[0].uri,
        })
      );

      // Convert and upload in the background
      const base64 = (await convertImgToBase64(result.assets[0].uri)) as string;
      const data = prepareImgForUpload(base64, true);
      updateProfilePicture(data);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={[tw.hFull, tw.mB8]}>
          <View
            style={[
              tw.flex,
              tw.justifyCenter,
              tw.itemsCenter,
              tw.bgPink100,
              tw.roundedB,
            ]}
          >
            <Image
              // source={require("../../assets/images/c_photo.jpeg")}
              style={[tw.wFull, tw.h48]}
            />
            <View style={[tw.absolute, tw.mT8, tw.mX8, tw.top0, tw.left0]}>
              <Image
                source={require("../../assets/images/parenti_logo.png")}
                style={[tw.absolute, tw.w12, tw.h12, tw._m6]}
              />
            </View>
            <TouchableOpacity
              style={[tw.absolute, tw.mT4, tw.mX4, tw.top0, tw.right0]}
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings" size={24} style={[tw.textWhite]} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={pickImage}>
            <View
              style={[tw.relative, tw.flex, tw.justifyCenter, tw.itemsCenter]}
            >
              {updatedProfile.isUploading && (
                <View
                  style={[
                    tw.absolute,
                    tw.z10,
                    tw.bgWhite,
                    tw.roundedFull,
                    tw.p4,
                  ]}
                >
                  <Spinner />
                </View>
              )}
              <Image
                src={
                  updatedProfile.tempImageUri ||
                  profile?.gallery?.find((img: any) => img.featured)
                    ?.thumbnailUrl
                }
                source={require("../../assets/images/default_avatar.jpg")}
                style={[
                  tw.absolute,
                  tw.w32,
                  tw.h32,
                  tw.roundedFull,
                  tw.border4,
                  tw.borderPink700,
                  updatedProfile.isUploading && tw.opacity50,
                ]}
              />
            </View>
          </TouchableOpacity>
          <View style={[tw.flex, tw.flexRow, tw.justifyCenter]}>
            <View style={[tw.bgPink700, tw.mT12, tw.w1_3, , tw.roundedFull]}>
              <TextComponent style={[tw.textCenter, tw.pY1, tw.fontBold]}>
                {getProfileCompletion(profileFields, profile)}% Complete
              </TextComponent>
            </View>
          </View>
          {/* <View style={[tw.m4, tw.absolute, tw.flex, tw.wFull]}>
            <Image
              source={require("../../assets/images/parenti_logo.png")}
              style={[tw.absolute, tw.w12, tw.h12, tw._m6]}
            />
          </View> */}
          <View style={[tw.pT4]}>
            <View>
              <TextComponent style={[tw.textCenter, tw.text2xl, tw.fontBold]}>
                {profile?.firstname} {profile?.lastname}
              </TextComponent>
              <TextComponent
                style={[tw.textCenter, tw.textBase, tw.textGray600]}
              >
                {gateUserAge(profile.dateOfBirth)} Yo . {profile?.gender ?? "-"}
              </TextComponent>
            </View>
          </View>
          <TouchableOpacity
            style={[tw.flex, tw.flexRow, tw.justifyEnd]}
            onPress={() => {
              router.push(`/form/profile?tab=${activeTab}`);
            }}
          >
            <Ionicons
              name="create-outline"
              size={24}
              style={[tw.mX4, tw.textPink700]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push(`/form/profile?tab=${activeTab}&step=${0}&edit=bio`);
            }}
            style={[
              tw.bgWhite,
              tw.mX4,
              tw.rounded,
              tw.p4,
              tw.mY4,
              tw.shadow2xl,
            ]}
          >
            <TextComponent variant="labelLarge" style={[tw.fontBlack]}>
              About Me
            </TextComponent>
            <View style={[tw.flex, tw.flexRow, tw.justifyBetween]}>
              <View>
                <TextComponent variant="bodyMedium">
                  {profile?.bio ?? profileFillIntroText[0].description}
                </TextComponent>
              </View>
            </View>
          </TouchableOpacity>

          <View
            style={[
              tw.flex,
              tw.flexRow,
              tw.justifyBetween,
              tw.mX4,
              tw.bgGray200,
              tw.p2,
              tw.rounded,
            ]}
          >
            {profileTabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleTabChange(index)}
                style={[
                  activeTab == index && tw.bgWhite,
                  tw.shadowLg,
                  tw.rounded,
                  tw.w1_2,
                ]}
              >
                <TextComponent
                  style={[
                    tw.pY2,
                    tw.pX4,
                    activeTab === index && tw.fontBold,
                    tw.textBlack,
                    tw.textCenter,
                  ]}
                >
                  {tab.title}
                </TextComponent>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[tw.mX4, tw.rounded, tw.pY4]}>
            {profileTabs[activeTab].content === "otherDetails"
              ? profileFields.map((group: any, groupIndex: number) => {
                  return (
                    <View style={[tw.pY5, tw.pX2, tw.mY1, tw.bgWhite]}>
                      <Text style={[tw.fontBold, tw.textBase]}>
                        {group.title}
                      </Text>

                      <View>
                        {group.questions.map((qn: any, index: number) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              style={[tw.mX4, tw.mY2, tw.flex, tw.flexRow]}
                              onPress={() => {
                                router.push(
                                  `/form/profile?tab=${activeTab}&step=${groupIndex}`
                                );
                              }}
                            >
                              <View style={[tw.mR4]}>
                                <Ionicons
                                  name={
                                    profileTabs[activeTab]?.icons?.find(
                                      (icon) => qn.question.includes(icon.field)
                                    )?.icon
                                  }
                                  size={24}
                                  style={[tw.textGray600, tw.mY2]}
                                />
                              </View>
                              <View>
                                <TextComponent
                                  variant="labelLarge"
                                  style={[tw.textXs, tw.capitalize]}
                                >
                                  {qn.question}
                                </TextComponent>
                                <TextComponent
                                  variant="bodyMedium"
                                  style={[tw.textGray600]}
                                >
                                  {profileAnswers
                                    ?.find((answer: any) => answer.id === qn.id)
                                    ?.answers.map((answer: any) => answer.text)
                                    .join(", ") ?? "No set yet"}
                                </TextComponent>
                              </View>
                              <Divider style={[tw.bgGray500, tw.mY4]} />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })
              : // profileFields?.map((field: any, index: number) => {
                //     const label = field.fieldName.replace(/\_/g, " ");
                //     const selectedVal = profile.otherDetails?.find(
                //       (detail: any) => detail.fieldName === field.fieldName
                //     )?.selectedValues;
                //     let value;
                //     try {
                //       const parsedVal = JSON.parse(selectedVal);
                //       value = Array.isArray(parsedVal)
                //         ? parsedVal.join(", ")
                //         : selectedVal;
                //     } catch (error) {
                //       // Assume it's not an array
                //       value = selectedVal;
                //     }

                //     return (
                //       <View key={index} style={[tw.mX4, tw.mY2, tw.flex, tw.flexRow]}>
                //         <View style={[tw.mR4]}>
                //           <Ionicons
                //             name={
                //               profileTabs[activeTab]?.icons?.find(
                //                 (icon) => field.fieldName.includes(icon.field)
                //               )?.icon
                //             }
                //             size={24}
                //             style={[tw.textGray600, tw.mY2]}
                //           />
                //         </View>
                //         <View>
                //         <TextComponent
                //           variant="labelLarge"
                //           style={[tw.fontBlack, tw.capitalize]}
                //         >
                //           {label}
                //         </TextComponent>
                //         <TextComponent
                //           variant="bodyMedium"
                //           style={[tw.textGray600]}
                //         >
                //           {/* { profile[field.fieldName] ?? "No data yet"} */}
                //           {value ?? "No set yet"}
                //         </TextComponent>
                //         </View>
                //         <Divider style={[tw.bgGray500, tw.mY4]} />
                //       </View>
                //     );
                //   })
                profileTabs[activeTab].content.map(
                  (field: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={[tw.mX4]}
                      onPress={() => {
                        router.push(`/form/profile?tab=${activeTab}`);
                      }}
                    >
                      <TextComponent
                        variant="labelLarge"
                        style={[tw.fontBlack, tw.capitalize]}
                      >
                        {separateTextWithSpace(field)}
                      </TextComponent>
                      <TextComponent
                        variant="bodyMedium"
                        style={[tw.textGray600]}
                      >
                        {field === "dateOfBirth"
                          ? moment(profile[field]).format("MMM DD, YYYY")
                          : profile[field] ?? "No data yet"}
                      </TextComponent>
                      <Divider style={[tw.bgGray500, tw.mY4]} />
                    </TouchableOpacity>
                  )
                )}
          </View>
          <Button
            onPress={handleLogout}
            mode="contained"
            style={[tw.mX4, tw.mT2, tw.mB12, tw.bgRed600, tw.textWhite]}
            loading={loading}
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
