import ModalComponent from "@/components/Modal";
import TextComponent from "@/components/Text";
import { db } from "@/configs/firebaseConfig";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Chip, TextInput } from "react-native-paper";
import { tw } from "react-native-tailwindcss";

const NewPostScreen: React.FC = () => {
  //   const { user, currentUser } = useLocalSearchParams();
  const { loading, send } = useApiRequest<ApiResponse>();

  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<any>(null);
  const [user, setUser] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posting, setPosting] = useState<boolean>(false);
  const [postSuccess, setPostSuccess] = useState<boolean>(null);

  const categories = [
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

  const getMyBasicProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");

    if (result?.errors) {
      return;
    }

    setUser({
      name: result?.firstname + " " + result?.lastname,
      photo: result?.gallery?.find((pic: any) => pic.featured)?.thumbnailUrl,
    });
  };

  useEffect(() => {
    getMyBasicProfile();
  }, []);

  const handleSend = async () => {
    try {
      setPosting(true);
      // Reference to the threads collection
      const threadRef = collection(db, "threads");

      // Add a new thread document
      const threadDoc = await addDoc(threadRef, {
        category: selectedCategory,
        title: threadData.title,
        created_by: user,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        views: 0,
        likes: 0,
      });

      // Reference to the posts collection (initial post in the thread)
      const postsRef = collection(db, "posts");
      await addDoc(postsRef, {
        thread_id: threadDoc.id,
        content: threadData.content,
        created_by: user,
        created_at: serverTimestamp(),
        likes: 0,
      });

      console.log("Thread created with ID:", threadDoc.id);
      setPostSuccess(true);
      return threadDoc.id;
    } catch (error) {
      setPostSuccess(false);
      console.error("Error creating thread:", error);
    }
    setPosting(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        tw.bgPink100,
        tw.wFull,
        tw.hFull,
        tw.flex,
        tw.itemsCenter,
      ]}
    >
      <ModalComponent
        onDismiss={() => {
          setPostSuccess(false);
          router.push("/forum");
        }}
        visible={postSuccess}
        status="success"
        title="Post created!"
        description="Your has been created successfully and now available in the forum"
        btnText="View Post"
      />
      <View style={[tw.bgWhite, tw.wFull, tw.hFull]}>
        <View
          style={[
            tw.roundedLg,
            tw.bgWhite,
            tw.m2,
            tw.p4,
            tw.border,
            tw.borderGray300,
          ]}
        >
          <View style={[tw.p4]}>
            <TextComponent style={[tw.text2xl, tw.fontBold, tw.textGray800]}>
              New Post
            </TextComponent>
            <TextComponent style={[tw.textGray700, tw.opacity50]}>
              Share your thoughts with the community
            </TextComponent>
          </View>

          <View style={[tw.p4]}>
            <TextInput
              style={[tw.bgGray200, tw.roundedLg, tw.mB4]}
              label="Title"
              //   value={message}
              onChangeText={(text) =>
                setThreadData({ ...threadData, title: text })
              }
            />
            <TextInput
              style={[tw.bgGray200, tw.roundedLg, tw.mB4]}
              label="Your post"
              multiline={true}
              numberOfLines={5}
              //   value={message}
              onChangeText={(text) =>
                setThreadData({ ...threadData, content: text })
              }
            />
            <View style={[tw.flex]}>
              <TextComponent style={[tw.textGray600, tw.mB2]}>
                Select Category
              </TextComponent>
              <View style={[tw.flex, tw.flexRow, tw.justifyStart, tw.flexWrap]}>
                {categories.map((cat, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={[
                      tw.wAuto,
                      tw.borderGray400,
                      tw.mR4,
                      selectedCategory === cat.name && tw.bgRed100,
                      selectedCategory === cat.name && tw.borderPink700,
                    ]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    {cat.name}
                  </Chip>
                ))}
              </View>
            </View>
            <Button
              onPress={handleSend}
              mode="contained"
              style={[tw.mX8, tw.mY6]}
              loading={posting}
            >
              Post
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default NewPostScreen;
