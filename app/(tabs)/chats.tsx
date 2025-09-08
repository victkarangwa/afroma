import ScreenContainer from "@/components/container/screen";
import TextComponent from "@/components/Text";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { tw } from "react-native-tailwindcss";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  doc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";
import { ApiResponse } from "@/types";
import useApiRequest from "@/hooks/useApiRequest";
import LocalStorage from "@/utils/storage";
import localStore from "@/utils/localValues";
import { useFocusEffect } from "expo-router";
import NotificationBadge from "@/components/NotificationBadge";
import { MOCK_NOTIFICATIONS } from "@/components/NotificationCenter";

const ChatsScreen: React.FC = () => {
  const router = useRouter();
  const [profileType, setProfileType] = useState<
    "travel" | "networking" | "dating" | null
  >(null);

  // On mount and on focus, read profileType from local storage
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const storedType = await LocalStorage.getItem<
          "travel" | "networking" | "dating"
        >(localStore.profileType);
        if (storedType) setProfileType(storedType);
      })();
    }, [])
  );

  const { loading, send } = useApiRequest<ApiResponse>();

  const [matchSuggestions, setMatchSuggestions] = useState<ApiResponse | null>(
    null
  );
  const [activeMenu, setActiveMenu] = useState(0);
  const [chats, setChats] = useState<
    Array<{ id: string; participants: string[]; createdAt?: any }>
  >([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [chattedUsers, setChattedUsers] = useState([]);
  const [approvedFriends, setApprovedFriends] = useState<any[]>([]);

  const getUserId = async () => {
    const userId: number | null = await LocalStorage.getItem(localStore.userId);
    setUserId(userId);
  };

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId: number | null = await LocalStorage.getItem(
          localStore.userId
        );
        // Fetch chats where the user is a participant
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", userId?.toString())
        );

        // console.log("-----", userId)

        const chatsSnapshot = await getDocs(chatsQuery);
        const userChats: Array<{
          id: string;
          participants: string[];
          createdAt?: any;
        }> = [];

        chatsSnapshot.forEach((doc) => {
          const data = doc.data();
          userChats.push({
            id: doc.id,
            participants: data.participants,
            createdAt: data.createdAt,
          });
        });

        // console.log("--userChats---", userChats);
        setChats(userChats);

        const filteredSuggestions = matchSuggestions?.filter((user: any) => {
          return chats.some((chat) => {
            // console.log("---k--", chat.participants.includes(user.id.toString()));
            return chat.participants.includes(user.id.toString());
          });
        });

        // console.log("--filteredSuggestions---", filteredSuggestions);

        setChattedUsers(filteredSuggestions);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [userId]);

  const getMatchSuggestions = async () => {
    try {
      const response = await send("post", "/matches/list", {
        pageSize: 100,
      });
      const data = response;
      setMatchSuggestions(data?.list);
    } catch (error) {
      console.error(error);
    }
  };

  const getApprovedFriends = async () => {
    try {
      const response = await send("get", "/friendship/approved");
      setApprovedFriends(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching approved friends:", error);
    }
  };

  useEffect(() => {
    // Fetch user data
    getMatchSuggestions();
    // Fetch approved friends for networking/travel profiles
    if (profileType === "networking" || profileType === "travel") {
      getApprovedFriends();
    }
  }, [profileType]);

  const openChatRoom = async (user: any) => {
    const currentUserId: number | null = await LocalStorage.getItem(
      localStore.userId
    );
    const me: any = await send("get", "/users/me");

    router.push({
      pathname: "/chats/room",
      params: { user: JSON.stringify(user), currentUserId: me.id },
    });
  };


  // Redesigned chat screen for networking/travel
  if (profileType === "networking" || profileType === "travel") {
    return (
      <ScreenContainer showHeader={true} title="Chats">
        {/* Header */}
        {/* <View style={[tw.bgWhite, tw.pX4, tw.pT4, tw.pB4, tw.shadow]}>
          <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
            <Text style={[tw.textGray900, tw.fontBold, tw.textXl]}>Chats</Text>
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <NotificationBadge
                count={unreadNotificationsCount}
                onPress={() => router.push('/notifications')}
                size="medium"
              />
            </View>
          </View>
        </View> */}

        <View style={[tw.bgGray100, tw.hFull, tw.wFull]}>
          {/* Activities */}
          {/* <View style={[tw.mT4, tw.mB2, tw.pX4]}>
            <Text style={[tw.textGray900, tw.textXl, tw.fontBold, tw.mB2]}>
              Activities
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {approvedFriends.length > 0 ? (
                approvedFriends.slice(0, 5).map((friend) => (
                  <View key={friend.id} style={[tw.itemsCenter, tw.mR4]}>
                    <View style={{ position: "relative" }}>
                      <Image
                        source={
                          friend.gallery?.find((media: any) => media.featured)
                            ?.thumbnailUrl || friend.gallery?.[0]?.thumbnailUrl
                            ? {
                                uri:
                                  friend.gallery?.find(
                                    (media: any) => media.featured
                                  )?.thumbnailUrl ||
                                  friend.gallery?.[0]?.thumbnailUrl,
                              }
                            : require("../../assets/images/default_avatar.jpg")
                        }
                        style={[
                          tw.w16,
                          tw.h16,
                          tw.roundedFull,
                          {
                            borderWidth: 3,
                            borderColor:
                              friend.status === "ACTIVE"
                                ? "#fb6c31"
                                : "#e5e7eb",
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[tw.textGray800, tw.textSm, tw.mT1]}
                      numberOfLines={1}
                    >
                      {friend.firstname} {friend.lastname}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={[tw.itemsCenter, tw.justifyCenter, tw.pY4]}>
                  <Text style={[tw.textGray500, tw.textCenter]}>
                    No friends available
                  </Text>
                </View>
              )}
            </ScrollView>
          </View> */}
          {/* Messages */}
          <View style={[tw.flex1, tw.pX4, tw.mT2]}>
            <Text style={[tw.textGray900, tw.textXl, tw.fontBold, tw.mB2]}>
              Messages
            </Text>
            {approvedFriends.length > 0 ? (
              approvedFriends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    tw.bgWhite,
                    tw.roundedLg,
                    tw.flexRow,
                    tw.itemsCenter,
                    tw.p4,
                    tw.mB1,
                    tw.shadow,
                  ]}
                  onPress={() => {
                    // router.push({
                    //   pathname: "/chats/room",
                    //   params: { user: JSON.stringify(friend) },
                    // });
                    openChatRoom(friend);
                  }}
                >
                  <View style={{ position: "relative" }}>
                    <Image
                      // src={
                      //   friend.gallery?.find((media: any) => media.featured)
                      //     ?.thumbnailUrl || friend.gallery?.[0]?.thumbnailUrl
                      // }
                      source={require("../../assets/images/default_avatar.jpg")}
                      style={[tw.w16, tw.h16, tw.roundedFull]}
                    />
                  </View>
                  <View style={[tw.flex1, tw.mL4]}>
                    <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>
                      {friend.firstname} {friend.lastname}
                    </Text>
                    <Text
                      style={[tw.textGray600, tw.textSm, tw.mT1]}
                      numberOfLines={1}
                    >
                      {friend.bio || "Start a conversation..."}
                    </Text>
                  </View>
                  <View style={[tw.itemsEnd, tw.mL2]}>
                    <Text style={[tw.textGray400, tw.textXs, tw.mB1]}>
                      {friend.lastOnline
                        ? new Date(friend.lastOnline).toLocaleDateString()
                        : ""}
                    </Text>
                    {friend.status === "ACTIVE" && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: "#22c55e",
                          borderRadius: 4,
                          alignSelf: "flex-end",
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={[
                  tw.bgWhite,
                  tw.roundedLg,
                  tw.p4,
                  tw.itemsCenter,
                  tw.justifyCenter,
                ]}
              >
                <Text style={[tw.textGray500, tw.textCenter, tw.mB2]}>
                  No friends available
                </Text>
                <Text style={[tw.textGray400, tw.textSm, tw.textCenter]}>
                  Connect with people to start chatting
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader={true} title="Messages">
      <View style={[tw.bgGray100, tw.hFull, tw.wFull, tw.flex, tw.itemsCenter]}>
        <ScrollView
          style={[tw.wFull]}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <TextComponent style={[tw.textGray600, tw.m2, tw.fontBold]}>
            New Matches
          </TextComponent>
          <ScrollView
            horizontal={true}
            style={[tw.flex, tw.flexRow, tw.wFull, tw.bgWhite, tw.p2]}
          >
            {matchSuggestions?.length ? (
              matchSuggestions?.map((user: any) => (
                <TouchableOpacity onPress={() => openChatRoom(user)}>
                  <Image
                    src={
                      user?.mediaList?.find((media: any) => media.featured)
                        ?.thumbnailUrl
                    }
                    source={require("../../assets/images/default_avatar.jpg")}
                    style={[
                      tw.w20,
                      tw.h20,
                      tw.roundedFull,
                      tw.mX2,
                      tw.mY1,
                      tw.border2,
                      tw.borderPink700,
                    ]}
                  />
                  <TextComponent style={[tw.fontBold, tw.textCenter]}>
                    {user.firstName}
                  </TextComponent>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[tw.flex, tw.itemsCenter, tw.justifyCenter, tw.mY4]}>
                <TextComponent
                  style={[tw.textGray500, tw.textXl, tw.mY4, tw.textCenter]}
                >
                  No match available
                </TextComponent>
                <TextComponent style={[tw.textGray500]}>
                  A people will appear here when you match with someone
                </TextComponent>
              </View>
            )}
          </ScrollView>

          <TextComponent style={[tw.textGray600, tw.m2, tw.fontBold]}>
            Messages
          </TextComponent>
          <View style={[tw.bgWhite, tw.wFull, tw.flex, tw.itemsCenter, tw.mY2]}>
            {chattedUsers?.length ? (
              chattedUsers.map((user: any) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    tw.w11_12,
                    tw.mB2,
                    tw.borderB,
                    tw.borderGray300,
                    // tw.flex,
                  ]}
                  onPress={() => openChatRoom(user)}
                >
                  <View style={[tw.flex, tw.flexRow, tw.itemsCenter, tw.mY4]}>
                    <Image
                      src={
                        user?.mediaList?.find((media: any) => media.featured)
                          ?.thumbnailUrl
                      }
                      source={require("../../assets/images/default_avatar.jpg")}
                      style={[tw.w10, tw.h10, tw.roundedFull]}
                    />
                    <View style={[tw.mX4]}>
                      <TextComponent style={[tw.fontBold]}>
                        {user.firstName} {user.middleName}
                      </TextComponent>
                      {/* <TextComponent style={[tw.textGray700]}>
                    {room.text}
                  </TextComponent> */}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[tw.flex, tw.itemsCenter, tw.justifyCenter, tw.mY4]}>
                <TextComponent style={[tw.textGray500, tw.textXl, tw.mY4]}>
                  No chats available
                </TextComponent>
                <TextComponent style={[tw.textGray500]}>
                  A chat will appear here when someone messages you
                </TextComponent>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

export default ChatsScreen;
