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
import { Button, Checkbox, Chip, Divider, TextInput } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import Separator from "@/components/Separator";
import OTPTextView from "react-native-otp-textinput";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "react-native-circular-progress-indicator";
import { removeUserData } from "@/utils";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";

const ProfileScreen: React.FC = () => {
  const router = useRouter();

  const { loading, send } = useApiRequest<ApiResponse>();

  const [profile, setProfile] = useState<any>({});

  const getMyProfile = async () => {
    const result = await send(
      "get",
      "/bonded-user-service/settings/profile-fields"
    );

    console.log("___PROFILE-FIELDS___", result);
    if (result?.errors) {
      return;
    }
    setProfile(result);
  };

  useEffect(() => {
    getMyProfile();
  }, []);
  

  return (
    <SafeAreaView>
      <ScrollView>
        <Checkbox.Item
          status="checked"
          label="Male"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
