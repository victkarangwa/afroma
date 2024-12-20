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
import { Link, useLocalSearchParams, useRouter } from "expo-router";
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
  const [updatedProfile, setUpdatedProfile] = useState<any>({
    featuredPhoto: null,
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

  useEffect(() => {
    getMyBasicProfile();
    getProfileField();
    getMyProfileAnswers();
  }, [params.refresh, updatedProfile.featuredPhoto]);

  const handleLogout = async () => {
    const result = await send("post", "/bonded-user-service/auth/logout");
    removeUserData();
    router.push({ pathname: "/getStarted/login" });
  };

  const getProfileField = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/settings/profile-questions"
    );

    // console.log("___PROFILE-FIELDS___", result);
    if (result?.errors) {
      return;
    }
    setProfileFields(result);
  };

  const handleTabChange = (tab: number) => {
    setActiveTab(tab);
  };

  const updateProfilePicture = async (data: any) => {
    const result = await send(
      "post",
      "/bonded-user-service/media/upload",
      data
    );

    if (result?.errors) {
      return;
    }
    setUpdatedProfile({ ...updatedProfile, featuredPhoto: result });
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
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Options: Images, Videos, or All
      allowsEditing: true, // Let the user edit the media
      aspect: [4, 3], // Aspect ratio if editing
      quality: 1, // Image quality (0 to 1)
    })) as any;

    const base64 = (await convertImgToBase64(result.assets[0].uri)) as string;

    const data = prepareImgForUpload(base64, true);

    updateProfilePicture(data);

    // convert it to base64
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {loading && <Spinner />}
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
          </View>

          <TouchableOpacity onPress={pickImage}>
            <View
              style={[tw.relative, tw.flex, tw.justifyCenter, tw.itemsCenter]}
            >
              <Image
                src={
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
                ]}
              />
            </View>
          </TouchableOpacity>
          <View style={[tw.flex, tw.flexRow, tw.justifyCenter]}>
            <View style={[tw.bgPink700, tw.mT12, tw.w1_3, , tw.roundedFull]}>
              {/* <Ionicons
              name="pencil-outline"
              size={30}
              style={[tw.textWhite, tw.absolute, tw._mT20]}
            /> */}
              <TextComponent style={[tw.textCenter, tw.pY1, tw.fontBold]}>
                {getProfileCompletion(profileFields, profile)}% Complete
              </TextComponent>
            </View>
          </View>
          <View style={[tw.m4, tw.absolute, tw.flex]}>
            <Image
              source={require("../../assets/images/bonded_logo.png")}
              style={[tw.absolute, tw.w24, tw.h24, tw._m6]}
            />
          </View>
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
          <View
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
              <View style={[]}>
                <TextComponent variant="bodyMedium">
                  {profile?.bio ?? profileFillIntroText[0].description}
                </TextComponent>
              </View>
            </View>
          </View>

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
              ? profileFields.map((group: any, index: number) => {
                  return (
                    <View style={[tw.pY5, tw.pX2, tw.mY1, tw.bgWhite]}>
                      <Text style={[tw.fontBold, tw.textBase]}>
                        {group.title}
                      </Text>

                      <View>
                        {group.questions.map((qn: any, index: number) => {
                          return (
                            <View
                              key={index}
                              style={[tw.mX4, tw.mY2, tw.flex, tw.flexRow]}
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
                            </View>
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
                    <View key={index} style={[tw.mX4]}>
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
                    </View>
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
