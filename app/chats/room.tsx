import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
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
import { getFirestore } from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";
import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { tw } from "react-native-tailwindcss";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import TextComponent from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import LocalStorage from "@/utils/storage";
import config from "@/utils/localValues";
import moment from "moment";
import { convertSecondsToTime } from "@/utils";
import { useState as useReactState } from "react";

const ChatScreen = () => {
  const router = useRouter();
  const { user, currentUserId } = useLocalSearchParams();

  console.log("---currentUserId-->", currentUserId);

  // Support both dating and networking/travel: if user is a stringified object, parse it; else, use dummy data
  let userData: any = { firstName: '', avatar: '', online: false };
  try {
    userData = Array.isArray(user) ? JSON.parse(user[0]) : JSON.parse(user);
  } catch {
    // fallback for dummy data
    userData = user || { firstName: '', avatar: '', online: false };
  }

  // Networking/travel dummy messages if not using Firebase
  const [dummyMessages, setDummyMessages] = useReactState([
    { id: '1', text: 'Hey there! 👋', createdAt: new Date(), senderId: 'them' },
    { id: '2', text: 'Hello! How are you?', createdAt: new Date(), senderId: 'me' },
    { id: '3', text: 'I wanted to discuss the project update.', createdAt: new Date(), senderId: 'them' },
  ]);
  const [dummyInput, setDummyInput] = useReactState('');

  // Detect if this is a networking/travel chat (by presence of avatar and name)
  const isNetworkingOrTravel = !!userData.avatar;

  const [chatId, setChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  interface Message {
    id: string;
    text: string;
    createdAt: any;
    senderId: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);

  const receiverId = userData?.id?.toString();
  const senderId = currentUserId?.toString();

  // console.log("----->", senderId, receiverId);
  useEffect(() => {
    const fetchChat = async () => {
      try {
        // Check if a chat already exists between these users
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", senderId)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        let existingChat: {
          id: string;
          participants: string[];
          createdAt?: any;
        } | null = null as {
          id: string;
          participants: string[];
          createdAt?: any;
        } | null;

        chatsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.participants.includes(receiverId)) {
            existingChat = {
              id: doc.id,
              participants: data.participants,
              createdAt: data.createdAt,
            };
          }
        });

        if (existingChat) {
          setChatId(existingChat.id);
        } else {
          // Create a new chat if one doesn't exist
          const newChatRef = await addDoc(collection(db, "chats"), {
            participants: [senderId, receiverId],
            createdAt: serverTimestamp(),
          });
          setChatId(newChatRef.id);
        }
      } catch (error) {
        console.log("----->", senderId, receiverId);
        console.log("---ERROR--->", error);
      }
    };

    fetchChat();
  }, [senderId, receiverId]);

  useEffect(() => {
    if (!chatId) return;

    // Subscribe to messages in this chat
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          createdAt: doc.data().createdAt,
          senderId: doc.data().senderId,
        }))
      );
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send a message
  // const onSend = useCallback((newMessages = []) => {
  //   const { _id, createdAt, text, user } = newMessages[0];
  //   addDoc(collection(db, "chats"), {
  //     _id,
  //     text,
  //     createdAt,
  //     user,
  //   });
  // }, []);

  const handleSend = async () => {
    if (message.trim() && chatId) {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: message,
        createdAt: serverTimestamp(),
        senderId: senderId,
      });
      setMessage("");
    }
  };

  const onGoBack = () => {
    router.push("/chats");
  };

  if (isNetworkingOrTravel) {
    // Modern chat room for networking/travel
    return (
      <SafeAreaView style={[tw.bgGray100, tw.hFull]}>
        {/* Header */}
        <View style={[tw.flexRow, tw.itemsCenter, tw.bgWhite, tw.p4, tw.shadow, { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }]}> 
          <TouchableOpacity onPress={onGoBack} style={[tw.mR4]}>
            <Ionicons name="chevron-back-outline" size={28} color="#fb6c31" />
          </TouchableOpacity>
          <Image
            source={{ uri: userData.avatar }}
            style={[tw.w14, tw.h14, tw.roundedFull, { borderWidth: 3, borderColor: userData.online ? '#4ade80' : '#e5e7eb' }]}
          />
          <View style={[tw.mL4]}> 
            <Text style={[tw.textGray900, tw.textLg, tw.fontBold]}>{userData.name || userData.firstName}</Text>
            {userData.online && <Text style={[tw.textGreen500, tw.textXs]}>Online</Text>}
          </View>
        </View>
        {/* Messages */}
        <FlatList
          data={dummyMessages}
          keyExtractor={(item) => item.id}
          style={[tw.flex1, tw.p4]}
          renderItem={({ item }) => (
            <View style={item.senderId === 'me'
              ? [tw.bgPink700, tw.pX4, tw.pY2, tw.roundedLg, tw.selfEnd, tw.mB2]
              : [tw.bgGray200, tw.pX4, tw.pY2, tw.roundedLg, tw.selfStart, tw.mB2]}
            >
              <Text style={[item.senderId === 'me' ? tw.textWhite : tw.textGray900, tw.textBase]}>{item.text}</Text>
            </View>
          )}
        />
        {/* Input */}
        <View style={[tw.flexRow, tw.itemsCenter, tw.bgWhite, tw.p4, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}> 
          <TextInput
            style={[tw.flex1, tw.bgGray100, tw.roundedFull, tw.pX4, tw.pY2, tw.textBase, tw.border, tw.borderGray200]}
            placeholder="Type a message..."
            value={dummyInput}
            onChangeText={setDummyInput}
          />
          <TouchableOpacity
            style={[tw.bgPink700, tw.roundedFull, tw.p3, tw.mL2]}
            onPress={() => {
              if (dummyInput.trim()) {
                setDummyMessages([...dummyMessages, { id: Date.now().toString(), text: dummyInput, createdAt: new Date(), senderId: 'me' }]);
                setDummyInput('');
              }
            }}
          >
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw.bgGray100, tw.hFull]}>
      <View style={[tw.flex, tw.flexRow, tw.itemsCenter, tw.bgPink100, tw.p2]}>
        <TouchableOpacity onPress={onGoBack}>
          <Ionicons name="chevron-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Image
          src={
            userData?.mediaList?.find(
              (media: { featured: boolean; thumbnailUrl: string }) =>
                media.featured
            )?.thumbnailUrl
          }
          source={require("../../assets/images/default_avatar.jpg")}
          style={[tw.h12, tw.w12, tw.roundedFull]}
        />
        <TextComponent
          style={[tw.textBase, tw.textCenter, tw.textGray600, tw.mX6, tw.pY4]}
        >
          {userData.firstname} {userData.lastname}
        </TextComponent>
      </View>
      <View style={[tw.bgWhite, tw.roundedTLg]}></View>
      {/*<GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: user._id, name: "User" }}
        messagesContainerStyle={[tw.flex1]}
      /> */}
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={
                item.senderId === senderId
                  ? [
                      tw.bgPink700,
                      tw.pX2,
                      tw.pT2,
                      tw.roundedLg,
                      tw.roundedBrNone,
                      tw.selfEnd,
                      tw.m1,
                    ]
                  : [
                      tw.bgGray300,
                      tw.pX2,
                      tw.pT2,
                      tw.roundedLg,
                      tw.roundedBlNone,
                      tw.selfStart,
                      tw.m1,
                    ]
              }
            >
              <Text>{item.text}</Text>
              <Text
                style={[tw.textRight, { fontSize: 9 }, tw.pY1, tw.textGray700]}
              >
                {convertSecondsToTime(item.createdAt)}
              </Text>
            </View>
          )}
        />
        <View
          style={[
            tw.flex,
            tw.flexRow,
            tw.justifyCenter,
            tw.itemsCenter,
            tw.mX6,
          ]}
        >
          <View
            style={[
              tw.wFull,
              tw.flex,
              tw.flexRow,
              tw.itemsCenter,
              tw.bgGray300,
              tw.p2,
              tw.roundedLg,
            ]}
          >
            <Ionicons name="happy-outline" size={24} color="black" />
            <TextInput
              style={[tw.pX2]}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 4 },
  myMessage: {
    ...tw.bgPink700,
    padding: 8,
    margin: 4,
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#e1e1e1",
    padding: 8,
    margin: 4,
    alignSelf: "flex-start",
    borderRadius: 4,
  },
});

export default ChatScreen;
