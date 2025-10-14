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
  KeyboardAvoidingView,
  Platform,
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
import UserProfileView from "@/components/UserProfileView";

const ChatScreen = () => {
  const router = useRouter();
  const { user, currentUserId } = useLocalSearchParams();

  // Helper function to format message time (WhatsApp style - only time)
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp?.toDate) {
      // Firebase timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // JavaScript Date
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      // Unix timestamp
      date = new Date(timestamp);
    } else {
      return '';
    }

    return moment(date).format("HH:mm");
  };

  // Helper function to format day separator (WhatsApp style)
  const formatDaySeparator = (timestamp: any) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return '';
    }

    const now = new Date();
    const messageDate = new Date(date);
    
    // Check if it's today
    const isToday = messageDate.toDateString() === now.toDateString();
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();
    
    // Check if it's this week (within last 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const isThisWeek = messageDate > weekAgo;
    
    if (isToday) {
      return "Today";
    } else if (isYesterday) {
      return "Yesterday";
    } else if (isThisWeek) {
      return moment(date).format("dddd");
    } else {
      return moment(date).format("MMM DD, YYYY");
    }
  };

  // Helper function to check if we need a day separator
  const shouldShowDaySeparator = (currentMessage: any, previousMessage: any) => {
    if (!previousMessage) return true;
    
    let currentDate, previousDate;
    
    // Handle different timestamp formats
    if (currentMessage.createdAt?.toDate) {
      currentDate = currentMessage.createdAt.toDate();
    } else {
      currentDate = new Date(currentMessage.createdAt);
    }
    
    if (previousMessage.createdAt?.toDate) {
      previousDate = previousMessage.createdAt.toDate();
    } else {
      previousDate = new Date(previousMessage.createdAt);
    }
    
    // Normalize dates to compare only the date part (ignore time)
    const currentDateString = currentDate.toDateString();
    const previousDateString = previousDate.toDateString();
    
    // Debug logging
    console.log('Date comparison:', {
      current: currentDateString,
      previous: previousDateString,
      shouldShow: currentDateString !== previousDateString
    });
    
    return currentDateString !== previousDateString;
  };


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
    { id: '1', text: 'Hey there! 👋', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), senderId: 'them' }, // 2 days ago 11am
    { id: '2', text: 'Hello! How are you?', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), senderId: 'me' }, // Yesterday 2pm
    { id: '3', text: 'I wanted to discuss the project update.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), senderId: 'them' }, // Yesterday 11am
    { id: '4', text: 'Sure, what about it?', createdAt: new Date(), senderId: 'me' }, // Now (today)
  ]);
  const [dummyInput, setDummyInput] = useReactState('');
  const [showProfileModal, setShowProfileModal] = useState(false);

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
        <KeyboardAvoidingView 
          style={[tw.flex1]} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
            renderItem={({ item, index }) => {
              const previousMessage = index > 0 ? dummyMessages[index - 1] : null;
              const showDaySeparator = shouldShowDaySeparator(item, previousMessage);
              
              return (
                <View>
                  {/* Day Separator */}
                  {showDaySeparator && (
                    <View style={[tw.itemsCenter, tw.mY4]}>
                      <View style={[tw.bgGray300, tw.pX3, tw.pY1, tw.roundedFull]}>
                        <Text style={[tw.textGray600, tw.textXs, tw.fontMedium]}>
                          {formatDaySeparator(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Message */}
                  <View style={item.senderId === 'me'
                    ? [tw.bgPink700, tw.pX4, tw.pY2, tw.roundedLg, tw.selfEnd, tw.mB2]
                    : [tw.bgGray200, tw.pX4, tw.pY2, tw.roundedLg, tw.selfStart, tw.mB2]}
                  >
                    <Text style={[item.senderId === 'me' ? tw.textWhite : tw.textGray900, tw.textBase]}>{item.text}</Text>
                    <Text style={[
                      tw.textXs, 
                      tw.mT1, 
                      tw.textRight,
                      item.senderId === 'me' ? tw.textPink100 : tw.textGray500
                    ]}>
                      {formatMessageTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw.bgGray100, tw.hFull]}>
      <KeyboardAvoidingView 
        style={[tw.flex1]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[tw.flex, tw.flexRow, tw.itemsCenter, tw.bgWhite, tw.p4, tw.shadow, tw.borderB, tw.borderGray200]}>
          <TouchableOpacity onPress={onGoBack} style={[tw.mR3]}>
            <Ionicons name="chevron-back-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <Image
            source={
              userData?.mediaList?.find(
                (media: { featured: boolean; thumbnailUrl: string }) =>
                  media.featured
              )?.thumbnailUrl
                ? { uri: userData.mediaList.find((media: { featured: boolean; thumbnailUrl: string }) => media.featured).thumbnailUrl }
                : require("../../assets/images/default_avatar.jpg")
            }
            style={[tw.h12, tw.w12, tw.roundedFull, tw.mR3]}
          />
          <TouchableOpacity
            onPress={() => {
              // Show user profile modal
              setShowProfileModal(true);
            }}
            style={[tw.flex1]}
          >
            <TextComponent
              style={[tw.textBase, tw.fontBold, tw.textGray900]}
            >
              {userData.firstName || userData.firstname} {userData.middleName || userData.lastname || ''}
            </TextComponent>
            <TextComponent
              style={[tw.textSm, tw.textGray500]}
            >
              {userData.online ? 'Online' : 'Last seen recently'}
            </TextComponent>
          </TouchableOpacity>
          {/* <TouchableOpacity style={[tw.mL2]}>
            <Ionicons name="call-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={[tw.mL3]}>
            <Ionicons name="videocam-outline" size={24} color="#6b7280" />
          </TouchableOpacity> */}
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
          renderItem={({ item, index }) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showDaySeparator = shouldShowDaySeparator(item, previousMessage);
            
            return (
              <View>
                {/* Day Separator */}
                {showDaySeparator && (
                  <View style={[tw.itemsCenter, tw.mY4]}>
                    <View style={[tw.bgGray300, tw.pX3, tw.pY1, tw.roundedFull]}>
                      <Text style={[tw.textGray600, tw.textXs, tw.fontMedium]}>
                        {formatDaySeparator(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                )}
                
                {/* Message */}
                <View
                  style={[
                    tw.mX4,
                    tw.mY1,
                    tw.flexRow,
                    item.senderId === senderId ? tw.justifyEnd : tw.justifyStart
                  ]}
                >
                  <View
                    style={[
                      tw.maxW80,
                      tw.pX4,
                      tw.pY3,
                      tw.roundedLg,
                      item.senderId === senderId
                        ? [
                            tw.bgPink700,
                            tw.roundedBrSm,
                            { backgroundColor: '#fb6c31' }
                          ]
                        : [
                            tw.bgGray200,
                            tw.roundedBlSm,
                            { backgroundColor: '#E5E5EA' }
                          ]
                    ]}
                  >
                    <Text
                      style={[
                        tw.textBase,
                        item.senderId === senderId ? tw.textWhite : tw.textGray900
                      ]}
                    >
                      {item.text}
                    </Text>
                    <Text
                      style={[
                        tw.textXs,
                        tw.mT1,
                        tw.textRight,
                        item.senderId === senderId ? tw.textPink400 : tw.textGray500
                      ]}
                    >
                      {formatMessageTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
        <View
          style={[
            tw.bgWhite,
            tw.pX4,
            tw.pY3,
            tw.borderT,
            tw.borderGray200,
            tw.flexRow,
            tw.itemsEnd,
            tw.justifyBetween
          ]}
        >
          <View
            style={[
              tw.flex1,
              tw.flexRow,
              tw.itemsEnd,
              tw.bgGray100,
              tw.roundedFull,
              tw.pX4,
              tw.pY2,
              tw.mR3
            ]}
          >
            {/* <TouchableOpacity style={[tw.mR2]}>
              <Ionicons name="add-circle-outline" size={24} color="#6b7280" />
            </TouchableOpacity> */}
            <TextInput
              style={[tw.flex1, tw.textBase, tw.textGray900, { minHeight: 20, maxHeight: 100 }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Message"
              placeholderTextColor="#9ca3af"
              multiline={true}
            />
            {/* <TouchableOpacity style={[tw.mL2]}>
              <Ionicons name="camera-outline" size={24} color="#6b7280" />
            </TouchableOpacity> */}
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim()}
            style={[
              tw.w12,
              tw.h12,
              tw.roundedFull,
              tw.justifyCenter,
              tw.itemsCenter,
              { backgroundColor: message.trim() ? '#fb6c31' : '#E5E5EA' }
            ]}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim() ? 'white' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>
        </View>

        {/* User Profile Modal */}
        <UserProfileView
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={userData.id || 0}
        />
      </KeyboardAvoidingView>
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
