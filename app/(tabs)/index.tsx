import SwiperComponent from "@/components/Swiper";
import TextComponent from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";
import { Skeleton } from "@rneui/themed";
import Placeholder from "@/components/Swiper/skeleton";
import ScreenContainer from "@/components/container/screen";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import LocalStorage from "@/utils/storage";
import localStore from "@/utils/localValues";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { loading, send } = useApiRequest<ApiResponse>();

  const [activeTab, setActiveTab] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [matchSuggestions, setMatchSuggestions] = useState<ApiResponse | null>(
    null
  );
  const [loadingData, setLoadingData] = useState(false);

  const getMyProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");
    LocalStorage.setItem(localStore.userId, result?.id);
  };

  const getMatchSuggestions = async () => {
    try {
      setLoadingData(true);
      const response = await send(
        "post",
        "/bonded-user-service/matches/suggestions",
        {
          pageSize: 20,
          swipeType: activeTab === 2 ? "bookmark" : undefined,
        }
      );
      setLoadingData(false);
      const data = response;
      setMatchSuggestions(data);
    } catch (error) {
      console.error(error);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    // Fetch user data
    getMatchSuggestions();
    getMyProfile();
  }, [activeTab]);

  const tabs = ["All", "Nearby", "Bookmarks"];

  const onTabChange = (index: number) => {
    setActiveTab(Number(index));
    setShowPlaceholder(true);
    setTimeout(() => {
      setShowPlaceholder(false);
    }, 3000);
  };

  return (
    <ScreenContainer showHeader={true} title="Home">
      <View style={[tw.flex, tw.flexRow]}>
        {tabs.map((tab, index) => (
          <Button
            key={index}
            onPress={() => onTabChange(index)}
            style={[
              tw.mX4,
              activeTab === index && tw.borderB2,
              tw.borderPink700,
              tw.roundedNone,
            ]}
            mode="text"
          >
            <TextComponent style={[activeTab !== index && tw.textWhite]}>
              {tab}
            </TextComponent>
          </Button>
        ))}
      </View>
      {loadingData ? (
        <Placeholder />
      ) : (
        <View style={[tw.wFull]}>
          {matchSuggestions?.list?.length ? (
            <SwiperComponent
              key={activeTab}
              parameter={activeTab == 0 ? "all" : "distance"}
              data={matchSuggestions?.list || []}
            />
          ) : (
            <TextComponent style={[tw.textGray500, tw.textCenter, tw.p8]}>
              No Bookmark record found
            </TextComponent>
          )}
        </View>
      )}
    </ScreenContainer>
  );
};

export default HomeScreen;
