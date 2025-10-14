import ButtonComponent from "@/components/Button";
import ScreenContainer from "@/components/container/screen";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import LinearGradient from 'react-native-linear-gradient';

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
  const [currentUserId, setCurrentUserId] = useState(null);
  const { loading, send } = useApiRequest<ApiResponse>();
  const [pulsate] = useState(new Animated.Value(1));
  const getMyProfile = async () => {
    const result = await send("get", "/users/me");
    setCurrentUserId(result?.id);
    const myPhoto = result?.gallery?.find((media: any) => media.featured);
    setMyPhoto(myPhoto || { thumbnailUrl: "" });
    return result;
  };

  useEffect(() => {
    getMyProfile();
  }, []);

  const matchPhoto = userData?.mediaList?.find((media: any) => media.featured);

  // Derive matched user display name if available (supports different payload shapes)
  const matchedFirstName = userData?.firstName || userData?.firstname || userData?.profile?.firstname || "";
  const matchedLastName = userData?.lastName || userData?.lastname || userData?.profile?.lastname || "";
  const matchedDisplayName = `${matchedFirstName} ${matchedLastName}`.trim() || "Your match";

  // Simple pulsing heart animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulsate, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulsate, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulsate]);

  const markMatchAsSeen = async () => {
    try {
      const matchId = (userData && (userData.matchId || userData?.profile?.matchId)) || null;
      if (!matchId) return; // Nothing to mark
      const result = await send('put', `/matches/${matchId}/seen`);
      console.log("=== MARK MATCH AS SEEN API RESULT ===", result);
    } catch (err) {
      console.warn('Failed to mark match as seen:', err);
    }
  };

  const sendMsg = async () => {
    await markMatchAsSeen();
    router.push({
      pathname: "/chats/room",
      params: { user: JSON.stringify(userData), currentUserId },
    });
  }

    const goBack = async () => {
      await markMatchAsSeen();
      router.back();
    }

  return (
    <ScreenContainer title="">
      <View style={[tw.flex1]}>
        {/* Gradient Celebration Header */}
        <LinearGradient
          colors={["#fb6c31", "#ff8a65", "#ffab91"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[{ width: '90%', height: 260, alignSelf: 'center', borderRadius: 16 }, tw.itemsCenter, tw.justifyCenter, tw.mT6]}
        >
          <Animated.View style={{ transform: [{ scale: pulsate }] }}>
            <Ionicons name="heart" size={72} color="#fff" />
          </Animated.View>
          <Text style={[tw.textWhite, tw.fontBold, tw.text2xl, tw.mT2]}>It's a Match!</Text>
          <Text style={[tw.textWhite, tw.textSm, { opacity: 0.9 }, tw.mT1]}>You and {matchedDisplayName} liked each other</Text>
        </LinearGradient>

        {/* Matched Avatars Card */}
        <View style={[tw.itemsCenter, { marginTop: -48 }]}> 
          <View style={[tw.bgWhite, tw.roundedLg, tw.shadow, tw.itemsCenter, tw.p6, tw.mX6, { width: '88%' }]}> 
            <View style={[tw.flexRow, tw.itemsCenter, tw.justifyCenter, tw.mB4]}> 
              {/* Matched user photo */}
              <View style={[tw.mX2, tw.itemsCenter]}> 
                <View style={[tw.roundedFull, tw.border4, { borderColor: '#fb6c31' }]}> 
                  <Image
                    src={matchPhoto?.thumbnailUrl}
                    source={require("../../assets/images/default_avatar.jpg")}
                    style={[tw.h20, tw.w20, tw.roundedFull]}
                  />
                </View>
                <Text style={[tw.textGray800, tw.textSm, tw.mT2]} numberOfLines={1}>{matchedDisplayName}</Text>
              </View>

              <Ionicons name="heart" size={20} color="#fb6c31" style={[tw.mX2]} />

              {/* Current user photo */}
              <View style={[tw.mX2, tw.itemsCenter]}> 
                <View style={[tw.roundedFull, tw.border4, { borderColor: '#fb6c31' }]}> 
                  <Image
                    src={myPhoto?.thumbnailUrl}
                    source={require("../../assets/images/default_avatar.jpg")}
                    style={[tw.h20, tw.w20, tw.roundedFull]}
                  />
                </View>
                <Text style={[tw.textGray800, tw.textSm, tw.mT2]} numberOfLines={1}>You</Text>
              </View>
            </View>

            <Text style={[tw.textGray600, tw.textCenter]}>Start a conversation and see where it goes.</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[tw.itemsCenter, tw.mT8, tw.pX6]}>
          <TouchableOpacity
            style={[tw.wFull, tw.roundedFull, tw.itemsCenter, tw.justifyCenter, tw.pY3, { backgroundColor: '#fb6c31' }]}
            onPress={sendMsg}
            activeOpacity={0.9}
          >
            <View style={[tw.flexRow, tw.itemsCenter]}> 
              <Ionicons name="chatbubbles" size={20} color="#fff" style={[tw.mR2]} />
              <Text style={[tw.textWhite, tw.fontBold]}>Send a message</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[tw.wFull, tw.roundedFull, tw.itemsCenter, tw.justifyCenter, tw.pY3, tw.mT3, tw.border, { borderColor: '#fb6c31' }]}
            onPress={goBack}
            activeOpacity={0.9}
          >
            <View style={[tw.flexRow, tw.itemsCenter]}> 
              <Ionicons name="reload" size={18} color="#fb6c31" style={[tw.mR2]} />
              <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>Keep Swiping</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default MatchScreen;
