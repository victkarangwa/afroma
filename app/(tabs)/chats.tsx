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

const ChatsScreen: React.FC = () => {
  const router = useRouter();
  const [profileType, setProfileType] = useState<'travel' | 'networking' | 'dating' | null>(null);

  // On mount and on focus, read profileType from local storage
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const storedType = await LocalStorage.getItem<'travel' | 'networking' | 'dating'>(localStore.profileType);
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
        const userId: number | null = await LocalStorage.getItem(localStore.userId);
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
      const response = await send("post", "/bonded-user-service/matches/list", {
        pageSize: 100,
      });
      const data = response;
      setMatchSuggestions(data?.list);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch user data
    getMatchSuggestions();
  }, []);

  const openChatRoom = async (user: any) => {
    const currentUserId: number | null = await LocalStorage.getItem(
      localStore.userId
    );

    router.push({
      pathname: "/chats/room",
      params: { user: JSON.stringify(user), currentUserId },
    });
  };

  const onMenuPress = (menu: any) => {
    setActiveMenu(menu);
  };

  const menu = ["Messages"];

  // Dummy data for normal chat screen
  const ACTIVITIES = [
    { id: 1, name: "Cooper", avatar: "https://randomuser.me/api/portraits/men/32.jpg", online: true },
    { id: 2, name: "Leslie", avatar: "https://randomuser.me/api/portraits/women/44.jpg", online: true },
    { id: 3, name: "Robert", avatar: "https://randomuser.me/api/portraits/men/45.jpg", online: true },
    { id: 4, name: "Theresa", avatar: "https://randomuser.me/api/portraits/women/46.jpg", online: true },
    { id: 5, name: "Jenny", avatar: "https://randomuser.me/api/portraits/women/47.jpg", online: false },
  ];
  const NORMAL_CHATS = [
    {
      id: 1,
      name: "Robert",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      lastMessage: "Hello bro... how are u.. and what u are doing tomorrow??",
      time: "12:32 PM",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Theresa",
      avatar: "https://randomuser.me/api/portraits/women/46.jpg",
      lastMessage: "Yeah... i'm not going to school due to fever.. so we can do this on friday.",
      time: "11:13 PM",
      unread: 1,
      online: true,
    },
    {
      id: 3,
      name: "Leslie",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      lastMessage: "what a funny moive it is... i'm dying of laughing... 😍😍😍",
      time: "Oct 25",
      unread: 0,
      online: true,
    },
  ];

  // Redesigned chat screen for networking/travel
  if (profileType === 'networking' || profileType === 'travel') {
    return (
      <ScreenContainer showHeader={true} title="Chats">
        <View style={[tw.bgGray100, tw.hFull, tw.wFull]}>
          {/* Activities */}
          <View style={[tw.mT4, tw.mB2, tw.pX4]}>
            <Text style={[tw.textGray900, tw.textXl, tw.fontBold, tw.mB2]}>Activities</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ACTIVITIES.map((user) => (
                <View key={user.id} style={[tw.itemsCenter, tw.mR4]}> 
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: user.avatar }}
                      style={[tw.w16, tw.h16, tw.roundedFull, { borderWidth: 3, borderColor: user.online ? '#fb6c31' : '#e5e7eb' }]}
                    />
                    {/* {user.online && (
                      <View style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, backgroundColor: '#22c55e', borderRadius: 7, borderWidth: 2, borderColor: '#fff' }} />
                    )} */}
                  </View>
                  <Text style={[tw.textGray800, tw.textSm, tw.mT1]} numberOfLines={1}>{user.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          {/* Messages */}
          <View style={[tw.flex1, tw.pX4, tw.mT2]}> 
            <Text style={[tw.textGray900, tw.textXl, tw.fontBold, tw.mB2]}>Messages</Text>
            {NORMAL_CHATS.map(chat => (
              <TouchableOpacity
                key={chat.id}
                style={[tw.bgWhite, tw.roundedLg, tw.flexRow, tw.itemsCenter, tw.p4, tw.mB1, tw.shadow]}
                onPress={() => {
                  router.push({
                    pathname: '/chats/room',
                    params: { user: JSON.stringify(chat) },
                  });
                }}
              >
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: chat.avatar }}
                    style={[tw.w16, tw.h16, tw.roundedFull]}
                  />
                </View>
                <View style={[tw.flex1, tw.mL4]}> 
                  <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{chat.name}</Text>
                  <Text style={[tw.textGray600, tw.textSm, tw.mT1]} numberOfLines={1}>{chat.lastMessage}</Text>
                </View>
                <View style={[tw.itemsEnd, tw.mL2]}> 
                  <Text style={[tw.textGray400, tw.textXs, tw.mB1]}>{chat.time}</Text>
                  {chat.unread > 0 && (
                    <View style={{ backgroundColor: '#fb6c31', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' }}>
                      <Text style={[tw.textWhite, tw.textSm, { fontWeight: 'bold' }]}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer showHeader={true} title="Messages">
      <View style={[tw.bgGray100, tw.hFull, tw.wFull, tw.flex, tw.itemsCenter]}>
        <ScrollView style={[tw.wFull]}>
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
