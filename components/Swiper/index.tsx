import TextComponent from "@/components/Text";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import Swiper from "react-native-deck-swiper";
import { tw } from "react-native-tailwindcss";
import Spinner from "../Spinner";
import CircularProgress from "react-native-circular-progress-indicator";

type SwipeType = "like" | "dislike" | "bookmark";

interface SwiperComponentProps {
  id: number;
  firstName: string;
  middleName?: string;
  age: number;
  location: string;
  distance?: number;
  mediaList: { featured: boolean; thumbnailUrl: string }[];
  relationshipStatus?: string;
  interests?: string[];
  familyPlan?: string;
}

const SwiperComponent = ({
  parameter = "all",
  data,
  setUserRate,
  userRate,
  setSelectedMatch,
  setShowModal,
}: {
  parameter?: string;
  data: SwiperComponentProps[];
  setUserRate: React.Dispatch<React.SetStateAction<number | null>>;
  userRate: number | null;
  setSelectedMatch: React.Dispatch<React.SetStateAction<ApiResponse | null>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const swiperRef = useRef<Swiper<SwiperComponentProps> | null>(null);
  const { loading, send } = useApiRequest<ApiResponse>();
  null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadRating, setLoadRating] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const handleSwipe = async (id: number, swipeType: SwipeType) => {
    try {
      setRating(null);
      setUserRate(null);
      const swipedId = data[id]?.id;
      const result = await send("post", "/bonded-user-service/matches/swipes", {
        swipedId,
        swipeType,
      });

      console.log("====REQ====>", swipedId, swipeType);
      if (result?.paymentRequired) {
        router.push({
          pathname: "/payment",
          params: { user: JSON.stringify(data[id]) },
        });
      }

      console.log("====RES====>", result);
      if (result?.matched) {
        router.push({
          pathname: "/match",
          params: { user: JSON.stringify(data[id]) },
        });
      }
    } catch (error) {
      console.log("==ERROR===>", error);
    }
  };

  // const viewRating = async (swippedCardId: number) => {
  //   setLoadRating(true);
  //   const userId = data[swippedCardId]?.id;
  //   const result = await send(
  //     "get",
  //     `/bonded-user-service/matches/rate/${userId}`
  //   );
  //   setRating(result?.rate);
  //   setUserRate(result?.rate);
  //   console.log("==RATING===>", result);
  //   setLoadRating(false);
  // };

  const onMatchClick = (id: number) => {
    setSelectedMatch(data[id]);
    setShowModal(true);
  }

  const actionBtn: {
    id: number;
    name: string;
    icon: "close-circle-outline" | "bookmark-outline" | "heart-circle-outline";
    onPress: () => void;
  }[] = [
    {
      id: 1,
      name: "Dislike",
      icon: "close-circle-outline",
      onPress: () => swiperRef.current?.swipeLeft(),
    },
    {
      id: 2,
      name: "Bookmark",
      icon: "bookmark-outline",
      onPress: () => swiperRef.current?.swipeTop(),
    },
    {
      id: 3,
      name: "Like",
      icon: "heart-circle-outline",
      onPress: () => swiperRef.current?.swipeRight(),
    },
  ];

  return (
    <Swiper
      cards={data}
      ref={swiperRef}
      renderCard={(card: SwiperComponentProps) => {
        let fPlan;
        try {
          fPlan = card?.familyPlan ? JSON.parse(card.familyPlan)[0] : undefined;
        } catch (error) {
          fPlan = card?.familyPlan;
        }

        return (
          <View style={styles.card}>
            <View style={[{ height: "65%" }, tw.relative]}>
             {parameter !== "all" && <View
                style={[
                  tw.flex,
                  tw.flexRow,
                  tw.itemsCenter,
                  tw.bgWhite,
                  tw.roundedFull,
                  tw.textPink700,
                  tw.absolute,
                  tw.left0,
                  tw.top0,
                  tw.m8,
                  tw.pX2,
                  tw.pY1,
                  tw.z10,
                ]}
              >
                <Ionicons name="location-outline" size={16} />
                <TextComponent style={[tw.textPink100, tw.textXs, tw.fontBold]}>
                  { `${card?.distance?.toFixed(0)} km`}
                </TextComponent>
              </View>}
              <TouchableOpacity
                style={[
                  tw.flex,
                  tw.flexRow,
                  tw.itemsCenter,
                  tw.bgPink100,
                  tw.roundedFull,
                  tw.textPink700,
                  tw.absolute,
                  tw.right0,
                  tw.bottom0,
                  tw.m6,
                  tw.pX2,
                  tw.pY2,
                  tw.z10,
                ]}
                disabled={loadRating}
                onPress={() => onMatchClick(currentIndex)}
              >
                <CircularProgress
                  value={card?.matchingResult?.matchingRate}
                  radius={20}
                  activeStrokeWidth={5}
                  inActiveStrokeWidth={5}
                  activeStrokeColor={"#eca899"}
                  titleStyle={{ fontSize: 12 }}
                  progressValueColor="#eca899"
                  titleColor={'white'}
                />
              </TouchableOpacity>
              <Image
                src={
                  card?.mediaList.find((img: any) => img.featured)?.thumbnailUrl
                }
                source={require("@/assets/images/logo.jpeg")}
                style={[tw.wAuto, tw.roundedLg, tw.m4, { height: "100%" }]}
                blurRadius={20}
              />
            </View>
            <View style={[tw.pX4, tw.mT8]}>
              <TextComponent style={[tw.textXl, tw.textPink100, tw.fontBold]}>
                {card?.firstName} {card?.middleName}, {card?.age}
              </TextComponent>
              {/* <View style={[tw.flex, tw.flexRow, tw.mY2]}>
                {card?.relationshipStatus && (
                  <View style={[tw.flex, tw.flexRow, tw.itemsCenter]}>
                    <Ionicons
                      name="heart-outline"
                      size={20}
                      style={[tw.textPink700]}
                    />
                    <TextComponent style={[tw.textPink100, tw.pX2]}>
                      {card?.relationshipStatus}
                    </TextComponent>
                  </View>
                )}
                <View style={[tw.flex, tw.flexRow, tw.itemsCenter, tw.mX4]}>
                  <Ionicons
                    name="people-outline"
                    size={20}
                    style={[tw.textPink700]}
                  />
                  <TextComponent style={[tw.textPink100, tw.pX2]}>
                    {fPlan ?? "No family plan"}
                  </TextComponent>
                </View>
              </View> */}
              {/* <View style={[tw.mY2, tw.flex, tw.flexRow]}>
                {card?.interests?.map((int) => (
                  <TextComponent
                    key={int}
                    style={[
                      tw.textPink700,
                      tw.border,
                      tw.borderPink700,
                      tw.roundedLg,
                      tw.pX2,
                      tw.pY1,
                      tw.mR2,
                    ]}
                  >
                    {int}
                  </TextComponent>
                ))}
              </View> */}
              <View>
                <View style={[tw.flex, tw.flexRow, tw.justifyAround]}>
                  {actionBtn.map((btn) => (
                    <TouchableOpacity
                      key={btn.id}
                      onPress={btn.onPress}
                      style={[
                        tw.bgPink100,
                        tw.roundedLg,
                        tw.mY2,
                        tw.roundedFull,
                      ]}
                    >
                      <Ionicons
                        name={btn.icon}
                        size={40}
                        style={[tw.textWhite, tw.p2]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        );
      }}
      onSwipedAll={() => console.log("onSwipedAll")}
      onSwipedRight={(cardIndex) => handleSwipe(cardIndex, "like")}
      onSwipedLeft={(cardIndex) => handleSwipe(cardIndex, "dislike")}
      onSwipedTop={(cardIndex) => handleSwipe(cardIndex, "bookmark")}
      cardIndex={currentIndex}
      stackSize={5}
      cardStyle={[tw.flex, tw.flexRow, tw.justifyCenter, tw.itemsCenter]}
    />
  );
};
const styles = StyleSheet.create({
  card: {
    flex: 1,
    ...tw.flexCol,
    ...tw.roundedLg,
    ...tw.bgGray200,
    height: 500,
    width: 300,
    marginTop: -200,
  },
  text: {
    textAlign: "center",
    fontSize: 50,
    backgroundColor: "transparent",
  },
});

export default SwiperComponent;
