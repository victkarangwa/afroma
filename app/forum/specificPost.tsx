import TextComponent from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, ScrollView, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";
import { useLocalSearchParams } from "expo-router";

const SpecificForumScreen: React.FC = () => {
  const { user, currentUserId } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);

  const senderId = currentUserId?.toString();

  const categories = [
    {
      id: 1,
      name: "Tending",
    },
    {
      id: 2,
      name: "General",
    },
    {
      id: 3,
      name: "Family",
    },
    {
      id: 4,
      name: "Support",
    },
  ];

  const handleSend = async () => {
    if (message.trim()) {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: message,
        createdAt: serverTimestamp(),
        senderId: senderId,
      });
      setMessage("");
    }
  };

  return (
    <ScrollView contentContainerStyle={[tw.bgPink100, tw.wFull, tw.hFull, tw.flex, tw.itemsCenter]}>
      <View style={[tw.bgPink100, tw.wFull]}>
        <View style={[tw.bgGray200, tw.wFull, tw.hFull]}>
          {/* Forum posts */}
          <View style={[tw.roundedLg, tw.bgWhite, tw.m2, tw.p4]}>
            <View
              style={[
                tw.bgWhite,
                tw.flex,
                tw.flexRow,
                tw.justifyStart,

                tw.shadowXl,
              ]}
            >
              <Image
                source={require("../../assets/images/default_avatar.jpg")}
                style={[
                  tw.w12,
                  tw.h12,
                  tw.roundedFull,
                  tw.mR2,
                  tw.mY1,
                  tw.border2,
                  tw.borderPink700,
                ]}
              />
              <View
                style={[
                  tw.textLeft,
                  tw.textGray500,
                  tw.flex,
                  tw.flexRow,
                  tw.justifyStart,
                  tw.itemsCenter,
                ]}
              >
                <View>
                  <TextComponent
                    style={[tw.textLeft, tw.textGray700, tw.fontBold]}
                  >
                    username
                  </TextComponent>

                  <TextComponent style={[tw.textLeft, tw.textGray500]}>
                    1 hour ago
                  </TextComponent>
                </View>
              </View>
            </View>
            <View>
              <TextComponent style={[tw.fontBold, tw.textXl, tw.pY2]}>
                How do I take care of my fiancee?
              </TextComponent>
              <TextComponent style={tw.textGray600}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Voluptatem magni veniam quasi animi! Perferendis porro facilis
                veritatis, omnis quae eligendi praesentium dicta! Nihil, cum
                architecto? Commodi iusto facere omnis provident.
              </TextComponent>
            </View>
            {/* Tags for categories */}
            <View style={[tw.flex, tw.flexRow, tw.flexWrap, tw.wFull]}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    tw.bgGray100,
                    tw.p2,
                    tw.mY2,
                    tw.mR2,
                    tw.roundedLg,
                    tw.flex,
                    tw.justifyCenter,
                  ]}
                >
                  <TextComponent style={[tw.textGray500]}>
                    {category.name}
                  </TextComponent>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comments */}
          <View>
            <TextComponent style={[tw.textGray600, tw.fontBold, tw.m2]}>
              Comments
            </TextComponent>
          </View>
          <View style={[tw.roundedLg, tw.bgWhite, tw.m2, tw.p4]}>
            <View
              style={[
                tw.bgWhite,
                tw.flex,
                tw.flexRow,
                tw.justifyStart,

                tw.shadowXl,
              ]}
            >
              <Image
                source={require("../../assets/images/default_avatar.jpg")}
                style={[tw.w8, tw.h8, tw.roundedFull, tw.mR2, tw.mY1]}
              />
              <View
                style={[
                  tw.textLeft,
                  tw.textGray500,
                  tw.flex,
                  tw.flexRow,
                  tw.justifyStart,
                  tw.itemsCenter,
                ]}
              >
                <View style={[tw.mR8]}>
                  <View style={[tw.flex, tw.flexRow, tw.justifyBetween]}>
                    <TextComponent
                      style={[tw.textLeft, tw.textGray700, tw.fontBold]}
                    >
                      username
                    </TextComponent>
                    <TextComponent style={[tw.textLeft, tw.textGray500]}>
                      1 hour ago
                    </TextComponent>
                  </View>

                  <TextComponent style={tw.textGray700}>
                    Voluptatem magni veniam quasi animi! Perferendis porro
                    facilis veritatis, omnis quae eligendi praesentium dicta!
                  </TextComponent>
                </View>
              </View>
            </View>
          </View>

          {/* Comment input */}
          <View
            style={[
              tw.flex,
              tw.flexRow,
              tw.justifyCenter,
              tw.itemsCenter,
              tw.mY6,
              tw.bottom0,
              tw.wFull,
              tw.absolute,
            ]}
          >
            <View
              style={[
                // tw.wFull,
                tw.flex,
                tw.flexRow,
                tw.justifyCenter,
                tw.itemsCenter,
                tw.bgGray300,
                // tw.p2,
                tw.roundedLg,
              ]}
            >
              {/* <Ionicons name="happy-outline" size={24} color="black" /> */}
              <TextInput
                style={[tw.pX2, tw.w3_4]}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your comment"
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              style={[
                tw.p2,
                tw.w10,
                tw.h10,
                tw.mX1,
                tw.flex,
                tw.justifyCenter,
                tw.itemsCenter,
                tw.bgPink700,
                tw.roundedFull,
              ]}
            >
              <Ionicons name="send" size={24} style={[tw.textPink100]} />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ScrollView>
  );
};

export default SpecificForumScreen;
