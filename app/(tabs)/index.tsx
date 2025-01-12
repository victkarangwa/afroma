import SwiperComponent from "@/components/Swiper";
import TextComponent from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
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
import CircularProgress from "react-native-circular-progress-indicator";
import PopupModal from "@/components/Modal/pop";
import ButtonComponent from "@/components/Button";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { loading, send } = useApiRequest<ApiResponse>();

  const [activeTab, setActiveTab] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [matchSuggestions, setMatchSuggestions] = useState<ApiResponse | null>(
    null
  );
  const [loadingData, setLoadingData] = useState(false);
  const [userRate, setUserRate] = useState<number | null>(0);
  const [selectecMatch, setSelectedMatch] = useState<ApiResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  const tabs = ["Matches", "Nearby", "Bookmarks"];

  const onTabChange = (index: number) => {
    setActiveTab(Number(index));
    setShowPlaceholder(true);
    setTimeout(() => {
      setShowPlaceholder(false);
    }, 3000);
  };

  const navigate = ()=>{
    router.push({pathname: "/payment"});
  }

  return (
    <ScreenContainer showHeader={true} title="Home">
      <View style={[tw.flex, tw.flexRow]}>
        {tabs.map((tab, index) => (
          <Button
            key={index}
            onPress={navigate}
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
          {/* {userRate !== null ? (
            <TouchableOpacity
              style={[
                tw.flex,
                tw.flexRow,
                tw.itemsCenter,
                tw.bgPink700,
                tw.roundedFull,
                tw.textPink700,
                tw.absolute,
                tw.right0,
                // tw.bottom0,
                tw.m6,
                tw.roundedFull,
                tw.z10,
                tw.mT120,
                tw.p1,
                tw.w19,
                tw.h19,
              ]}
            >
              <CircularProgress
                value={userRate}
                radius={20}
                activeStrokeWidth={5}
                inActiveStrokeWidth={5}
                activeStrokeColor={"#1d1b2c"}
                titleStyle={{ fontSize: 12 }}
              />
            </TouchableOpacity>
          ): <></>} */}
          {matchSuggestions?.list?.length ? (
            <SwiperComponent
              key={activeTab}
              parameter={activeTab == 0 ? "all" : "distance"}
              data={matchSuggestions?.list || []}
              setUserRate={setUserRate}
              userRate={userRate}
              setSelectedMatch={setSelectedMatch}
              setShowModal={setShowModal}
            />
          ) : (
            <TextComponent style={[tw.textGray500, tw.textCenter, tw.p8]}>
              No record found at the moment
            </TextComponent>
          )}
        </View>
      )}
      <PopupModal visible={showModal} onDismiss={() => setShowModal(false)}>
        <ScrollView>
          <View style={[tw.flex, tw.justifyCenter, tw.itemsCenter]}>
            <Image
              src={
                selectecMatch?.mediaList.find((img: any) => img.featured)
                  ?.thumbnailUrl
              }
              source={require("@/assets/images/logo.jpeg")}
              style={[
                tw.wAuto,
                tw.roundedFull,
                tw.m4,
                { height: 100, width: 100 },
              ]}
              blurRadius={20}
            />

            <TextComponent style={[, tw.fontBold]}>
              {selectecMatch?.firstName} {selectecMatch?.middleName},{" "}
              {selectecMatch?.age}
            </TextComponent>

            {selectecMatch?.matchingResult?.matchedQuestions?.map(
              (question, index) => (
                <View style={[tw.wFull, tw.pT4]} key={index}>
                  <TextComponent style={[tw.textSm, tw.textPink100]}>
                    {question?.questionText}
                  </TextComponent>
                  <TextComponent
                    style={[tw.textXs, tw.textPink100, tw.fontBold]}
                  >
                    {question?.answer?.join(", ")}
                  </TextComponent>
                </View>
              )
            )}

            <View
              style={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter]}
            >
              <View style={[tw.pT4]}>
                <TextComponent style={[tw.textSm, tw.textPink100, tw.fontBold]}>
                  Matching Rate
                </TextComponent>
                <View style={[tw.mY2]}>
                  <CircularProgress
                    value={selectecMatch?.matchingResult?.matchingRate}
                    radius={50}
                    activeStrokeWidth={10}
                    inActiveStrokeWidth={10}
                    duration={3000}
                    activeStrokeColor={"#1d1b2c"}
                    titleStyle={{ fontSize: 12 }}
                    progressValueColor="#1d1b2c"
                    titleColor={"#1d1b2c"}
                    title="%"
                  />
                </View>
              </View>
            </View>
            <View style={[tw.w3_4, tw.mT4]}>
              <Button mode="outlined" onPress={() => setShowModal(false)}>
                Dismiss
              </Button>
            </View>
          </View>
        </ScrollView>
      </PopupModal>
    </ScreenContainer>
  );
};

export default HomeScreen;
