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
import { introText } from "@/constants/text";
import Input from "@/components/input";
import { Button, Chip, Divider, TextInput } from "react-native-paper";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import Separator from "@/components/Separator";
import OTPTextView from "react-native-otp-textinput";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "react-native-circular-progress-indicator";
import { gateUserAge, removeUserData } from "@/utils";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { constantUserData, profileTabs } from "@/constants";

const ProfileScreen: React.FC = () => {
  const router = useRouter();

  const params = useLocalSearchParams();

  const { loading, send } = useApiRequest<ApiResponse>();

  const [profile, setProfile] = useState<any>({});
  const [profileFields, setProfileFields] = useState<any>([]);
  const [activeTab, setActiveTab] = useState(0);

  const getMyProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    if (result?.errors) {
      handleLogout();
      return;
    }
    if (!result.bio || !result.dateOfBirth || !result.gender) {
      router.push(`/form/profile?tab=${activeTab}`);
    }
    setProfile(result);
  };

  useEffect(() => {
    getMyProfile();
    getProfileField();
  }, [params.refresh]);

  const handleLogout = async () => {
    const result = await send("post", "/bonded-user-service/auth/logout");
    if (result?.errors) {
      return;
    }
    removeUserData();
    router.push({ pathname: "/getStarted/login" });
  };

  const getProfileField = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/settings/profile-fields"
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

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={[tw.hFull, tw.mB8]}>
          <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter]}>
            <Image
              source={require("../../assets/images/c_photo.jpeg")}
              style={[tw.wFull, tw.h48]}
            />
          </View>

          <View
            style={[tw.relative, tw.flex, tw.justifyCenter, tw.itemsCenter]}
          >
            <Image
              src={
                profile?.gallery?.find((img: any) => !img.featured)
                  ?.thumbnailUrl
              }
              style={[
                tw.absolute,
                tw.w32,
                tw.h32,
                tw.roundedFull,
                tw.border4,
                tw.borderWhite,
              ]}
            />
          </View>
          <View style={[tw.flex, tw.flexRow, tw.justifyCenter]}>
            <View style={[tw.bgPink700, tw.mT12, tw.w1_3, , tw.roundedFull]}>
              <TextComponent style={[tw.textCenter, tw.pY1, tw.fontBold]}>
                20% Complete
              </TextComponent>
            </View>
          </View>
          <TouchableOpacity
            style={[tw.m4, tw.absolute, tw.right0, tw.top0]}
            onPress={() => {
              router.push(`/form/pictures`);
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={30}
              style={[tw.textWhite]}
            />
          </TouchableOpacity>
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
                  {profile?.bio}
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
                  activeTab === index && tw.bgWhite,
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
          <View style={[tw.bgWhite, tw.mX4, tw.rounded, tw.pY4]}>
            {profileTabs[activeTab].content === "otherDetails"
              ? profileFields?.map((field: any, index: number) => {
                  const label = field.fieldName.replace(/\_/g, " ");
                  return (
                    <View key={index} style={[tw.mX4]}>
                      <TextComponent
                        variant="labelLarge"
                        style={[tw.fontBlack, tw.capitalize]}
                      >
                        {label}
                      </TextComponent>
                      <TextComponent
                        variant="bodyMedium"
                        style={[tw.textGray600]}
                      >
                        {/* { profile[field.fieldName] ?? "No data yet"} */}
                        {profile.otherDetails?.find(
                          (detail: any) => detail.fieldName === field.fieldName
                        )?.selectedValues ?? "No data yet"}
                      </TextComponent>
                      <Divider style={[tw.bgGray500, tw.mY4]} />
                    </View>
                  );
                })
              : profileTabs[activeTab].content.map(
                  (field: string, index: number) => (
                    <View key={index} style={[tw.mX4]}>
                      <TextComponent
                        variant="labelLarge"
                        style={[tw.fontBlack, tw.capitalize]}
                      >
                        {field}
                      </TextComponent>
                      <TextComponent
                        variant="bodyMedium"
                        style={[tw.textGray600]}
                      >
                        {profile[field] ?? "No data yet"}
                      </TextComponent>
                      <Divider style={[tw.bgGray500, tw.mY4]} />
                    </View>
                  )
                )}
          </View>
          <Button
            onPress={handleLogout}
            mode="contained"
            style={[tw.mX4, tw.mY2, tw.bgRed600, tw.textWhite]}
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
