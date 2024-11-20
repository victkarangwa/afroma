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
import { Button, Chip, Divider, TextInput } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import Separator from "@/components/Separator";
import OTPTextView from "react-native-otp-textinput";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "react-native-circular-progress-indicator";
import { gateUserAge, removeUserData } from "@/utils";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";

const ProfileScreen: React.FC = () => {
  const router = useRouter();

  const { loading, send } = useApiRequest<ApiResponse>();

  const [profile, setProfile] = useState<any>({});
  const [profileFields, setProfileFields] = useState<any>([]);

  const getMyProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    console.log("___PROFILE___", result);
    if (result?.errors) {
      handleLogout();
      return;
    }
    setProfile(result);
  };

  useEffect(() => {
    getMyProfile();
    getProfileField();
  }, []);

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

    console.log("___PROFILE-FIELDS___", result);
    if (result?.errors) {
      return;
    }
    setProfileFields(result);
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
              source={require("../../assets/images/b_lady.jpg")}
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
          <View style={[tw.pT20]}>
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
              Almost There!
            </TextComponent>
            <View style={[tw.flex, tw.flexRow, tw.justifyBetween]}>
              <View style={[tw.w3_4]}>
                <TextComponent variant="bodyMedium">
                  Your profile is 32% complete! Complete your profile to find
                  the one meant for you!
                </TextComponent>
              </View>
              <View>
                <CircularProgress
                  value={32}
                  radius={38}
                  valueSuffix="%"
                  activeStrokeWidth={10}
                  inActiveStrokeWidth={10}
                  activeStrokeColor={"#eca899"}
                  inActiveStrokeColor={"#e4e1f7"}
                  duration={2000}
                  dashedStrokeConfig={{
                    count: 100,
                    width: 2,
                  }}
                />
              </View>
            </View>
            <Button mode="outlined" style={[tw.mT4]}>
              Complete My Profile
            </Button>
          </View>

          {profileFields?.map((field: any, index: number) => {
            const label = field.fieldName.replace(/\_/g, " ");
            return (
              <View key={index} style={[tw.mX4]}>
                <TextComponent variant="labelLarge" style={[tw.fontBlack, tw.capitalize]}>
                  {label}
                </TextComponent>
                <TextComponent variant="bodyMedium" style={[tw.textGray600]}>
                  {profile[field.fieldName] ?? "No data yet"}
                </TextComponent>
                <Divider style={[tw.bgGray500, tw.mY4]} />
              </View>);
          })}

          {/* <View style={[tw.mX4]}>
            <TextComponent variant="labelLarge" style={[tw.fontBlack]}>
              Interest
            </TextComponent>
            <View style={[tw.flex, tw.flexRow, tw.justifyAround, tw.flexWrap]}>
              <Chip style={[tw.bgBlue200, tw.mY2, tw.roundedFull]}>Travel</Chip>
              <Chip style={[tw.bgGray300, tw.mY2, tw.roundedFull]}>Food</Chip>
              <Chip style={[tw.bgIndigo200, tw.mY2, tw.roundedFull]}>
                Movies
              </Chip>
              <Chip style={[tw.bgRed100, tw.mY2, tw.roundedFull]}>Music</Chip>
              <Chip style={[tw.bgPurple200, tw.mY2, tw.roundedFull]}>
                Reading
              </Chip>
              <Chip style={[tw.bgBlue200, tw.mY2, tw.roundedFull]}>Praise</Chip>
              <Chip style={[tw.bgGray300, tw.mY2, tw.roundedFull]}>
                Camping
              </Chip>
              <Chip style={[tw.bgIndigo200, tw.mY2, tw.roundedFull]}>
                Church
              </Chip>
            </View>
          </View> */}
          <Divider style={[tw.bgGray500, tw.m4]} />
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
