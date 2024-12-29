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
import config from "@/utils/localValues";

const ChatsScreen: React.FC = () => {
  const router = useRouter();
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
    const userId: number | null = await LocalStorage.getItem(config.userId);
    setUserId(userId);
  };

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId: number | null = await LocalStorage.getItem(config.userId);
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

        const filteredSuggestions = matchSuggestions?.filter((user) => {
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

  const openChatRoom = async (user) => {
    const currentUserId: number | null = await LocalStorage.getItem(
      config.userId
    );

    router.push({
      pathname: "/chats/room",
      params: { user: JSON.stringify(user), currentUserId },
    });
  };

  const onMenuPress = (menu) => {
    setActiveMenu(menu);
  };

  const menu = ["Messages"];

  return (
    <ScreenContainer showHeader={true} title="Messages">
      <View style={[tw.bgGray100, tw.hFull, tw.wFull, tw.flex, tw.itemsCenter]}>
        <View
          style={[
            tw.wFull,
            tw.flex,
            tw.flexRow,
            tw.justifyAround,
            tw.mX2,
            tw.p4,
            tw.bgWhite,
            tw.rounded,
            tw.borderB,
            tw.borderGray300,
          ]}
        >
          {/* <TextInput
            style={[
              tw.flex1,
              tw.mX2,
              tw.roundedFull,
              tw.border,
              tw.borderGray100,
              tw.p3,
            ]}
            placeholder="Search someone"
            onChangeText={onSearch}
          /> */}
          {menu.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                tw.p2,
                tw.mX2,
                // index === 0 && tw.borderR,
                tw.borderGray500,
                tw.w1_2,
              ]}
              onPress={() => onMenuPress(index)}
            >
              <TextComponent
                style={[
                  activeMenu === index ? tw.textPink700 : tw.textBlack,
                  tw.fontBlack,
                  tw.textCenter,
                ]}
              >
                {item}
              </TextComponent>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView style={[tw.wFull]}>
          <TextComponent style={[tw.textGray600, tw.m2, tw.fontBold]}>
            New Matches
          </TextComponent>
          <ScrollView
            horizontal={true}
            style={[tw.flex, tw.flexRow, tw.wFull, tw.bgWhite, tw.p2]}
          >
            {matchSuggestions?.length ? (
              matchSuggestions?.map((user) => (
                <TouchableOpacity onPress={() => openChatRoom(user)}>
                  <Image
                    src={
                      user?.mediaList?.find((media) => media.featured)
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
              chattedUsers.map((user) => (
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
                        user?.mediaList?.find((media) => media.featured)
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
