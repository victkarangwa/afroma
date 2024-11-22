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
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import Separator from "@/components/Separator";
import OTPTextView from "react-native-otp-textinput";
import { SafeAreaView } from "react-native-safe-area-context";
import CircularProgress from "react-native-circular-progress-indicator";
import {
  convertImgToBase64,
  getCustomPlaceholder,
  prepareImgForUpload,
  removeUserData,
  transformToOtherDetails,
} from "@/utils";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import BottomModal from "@/components/Modal/BottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ModalComponent from "@/components/Modal";
import { profileTabs } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import Spinner from "@/components/Spinner";
import LocalStorage from "@/utils/storage";

interface ProfileScreenProps {
  profile: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [selectedImage, setSelectedImage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [profile, setProfile] = useState<any>({});

  const getMyProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    setProfile(result);
  };

  useEffect(() => {
    getMyProfile();
  }, [params.refresh]);

  const uploadProfilePicture = async (data: any) => {
    const result = await send(
      "post",
      "/bonded-user-service/media/upload",
      data
    );

    if (result?.errors) {
      setVisible(true);
      return;
    }

    router.push(`/form/profile?refresh=${new Date().getTime()}`);
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

    const data = prepareImgForUpload(base64);

    uploadProfilePicture(data);

    // convert it to base64

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Store the selected image URI
    }
  };

  const gallery = profile?.gallery ?? [];
  // Find me available slots if the gallery is not full (max 6 images)
  const slots = Array.from({ length: 6 - gallery.length });

  console.log("---fff-", profile?.gallery);

  return (
    <View style={[tw.bgGray100]}>
      <ModalComponent
        title="Error"
        description={error ?? "An error occurred. Please try again."}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
      <View style={[tw.bgWhite, tw.shadow2xl]}>
        <View
          style={[tw.flex, tw.flexRow, tw.justifyBetween, tw.flexWrap, tw.m2]}
        >
          {profile?.gallery?.map((item: any, index: number) => (
            <TouchableOpacity
              style={[
                tw.w24,
                tw.h24,
                tw.flex,
                tw.justifyCenter,
                tw.itemsCenter,
                tw.m1,
              ]}
              onPress={pickImage}
            >
              <Image
                src={item.thumbnailUrl}
                style={[tw.w24, tw.h24, tw.rounded]}
              />
            </TouchableOpacity>
          ))}
          {slots.map((item) => (
            <View style={[tw.bgGray400, tw.rounded, tw.m1]}>
              <TouchableOpacity
                style={[
                  tw.w24,
                  tw.h24,
                  tw.flex,
                  tw.justifyCenter,
                  tw.itemsCenter,
                ]}
                onPress={pickImage}
              >
                <Ionicons name="add-outline" size={24} color="black" />
              </TouchableOpacity>
              {loading && <Spinner />}
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={pickImage}>
          <View style={[tw.mX8, tw.mY4]}>
            <Button mode="contained">Add Photos</Button>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;
