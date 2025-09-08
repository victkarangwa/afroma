import ButtonComponent from "@/components/Button";
import ScreenContainer from "@/components/container/screen";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { tw } from "react-native-tailwindcss";

interface MatchScreenProps {
  user: any;
}
const MatchScreen = () => {
  const router = useRouter();
  const { user } = useLocalSearchParams();
  const userData = JSON.parse(user as any);
  const [myPhoto, setMyPhoto] = useState({
    thumbnailUrl: "",
  });
  console.log("-=-", userData.id)
  const [currentUserId, setCurrentUserId] = useState(null);
  const { loading, send } = useApiRequest<ApiResponse>();
  const getMyProfile = async () => {
    const result = await send("get", "/users/me");
    setCurrentUserId(result?.id);
    const myPhoto = result?.gallery?.find((media: any) => media.featured);
    setMyPhoto(myPhoto);
    return result;
  };

  useEffect(() => {
    getMyProfile();
  }, []);

  const matchPhoto = userData?.mediaList?.find((media: any) => media.featured);

  const sendMsg = async () => {
    router.push({
      pathname: "/chats/room",
      params: { user: JSON.stringify(userData), currentUserId },
    });
  }

    const goBack = () => {
      router.back();
    }

  return (
    <ScreenContainer title="Match">
      <View style={[tw.wFull, tw.flex1, tw.itemsCenter, tw.justifyCenter]}>
        <View
          style={[
            tw.flex,
            tw.flexRow,
            tw.justifyCenter,
            tw.itemsCenter,
            tw.mB8,
          ]}
        >
          <Image
            src={matchPhoto.thumbnailUrl}
            style={[tw.h20, tw.w20, tw.roundedFull, tw.roundedBrNone, tw.mX2]}
          />
          <Image
            src={myPhoto.thumbnailUrl}
            style={[tw.h20, tw.w20, tw.roundedFull, tw.roundedBlNone, tw.mX2]}
          />
        </View>
        <Text style={[tw.fontBold, tw.text2xl, tw.mB4, tw.textPink700]}>
          Congrats, it's a match
        </Text>
        <Text style={[tw.textSm, tw.mB6, tw.textGray400]}>
          This is a chance to get to know each other better
        </Text>

        <View style={[tw.w3_4]}>
          <ButtonComponent mode="contained" style={[tw.m2]} onPress={sendMsg}>
            Send a message
          </ButtonComponent>
          <ButtonComponent mode="outlined" textColor="#eca899" style={[tw.m2]} onPress={goBack}>
            Keep Swiping
          </ButtonComponent>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default MatchScreen;
