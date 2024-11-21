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

  return (
    <SafeAreaView style={[]}>
      <View style={[tw.bgPink100, tw.hFull, tw.flex, tw.itemsCenter]}>
        <TextComponent style={[tw.text2xl, tw.textWhite, tw.textCenter, tw.fontBlack, tw.pT40]}>
          Bonded Home Screen
        </TextComponent>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
