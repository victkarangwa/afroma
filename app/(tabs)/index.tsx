import TextComponent from "@/components/Text";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";

const ProfileScreen: React.FC = () => {
  const router = useRouter();

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const getMyProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    if (result?.errors) {
      return;
    }
    // if (!result.bio || !result.dateOfBirth || !result.gender) {
    //   router.push(`/form/profile?tab=0`);
    // }
  };

  useEffect(() => {
    getMyProfile();
  }, []);

  return (
    <SafeAreaView style={[]}>
      <View style={[tw.bgPink100, tw.hFull, tw.flex, tw.itemsCenter]}>
        <TextComponent
          style={[
            tw.text2xl,
            tw.textWhite,
            tw.textCenter,
            tw.fontBlack,
            tw.pT40,
          ]}
        >
          Bonded Home Screen
        </TextComponent>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
