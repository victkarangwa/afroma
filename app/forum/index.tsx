import TextComponent from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";
import moment from "moment";
import { convertSecondsToTime, convertToMilliseconds } from "@/utils";

const ForumScreen: React.FC = () => {
  const router = useRouter();

  interface Thread {
    id: string;
    [key: string]: any;
  }

  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        // Step 1: Fetch all threads
        const threadsRef = collection(db, "threads");
        const threadsSnapshot = await getDocs(threadsRef);

        // Create a map of thread_id to thread data (id and title)
        const threadsMap: { [key: string]: { id: string; title: string } } =
          threadsSnapshot.docs.reduce((map, doc) => {
            const threadData = doc.data();
            map[doc.id] = { id: doc.id, title: threadData.title };
            return map;
          }, {});

        // Step 2: Fetch all posts
        const postsRef = collection(db, "posts");
        const postsQuery = query(postsRef, orderBy("created_at", "asc"));
        const postsSnapshot = await getDocs(postsQuery);

        // Step 3: Add thread info (id and title) to each post
        const enhancedPosts = postsSnapshot.docs.map((doc) => {
          const postData = doc.data();
          const threadInfo = threadsMap[postData.thread_id] || {};
          return {
            post_id: doc.id,
            ...postData,
            thread: threadInfo, // Add thread info here
          };
        });
        console.log("======", enhancedPosts[0].created_at);
        setThreads(enhancedPosts);
      } catch (error) {
        console.error("Error fetching forum data:", error);
      }
    };

    fetchForumData();
  }, [db]);

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

  const openSpecificForum = () => {
    router.navigate("/forum/specificPost");
  };
  return (
    <View style={[tw.bgPink100, tw.wFull, tw.flex, tw.itemsCenter]}>
      <View style={[tw.bgPink100, tw.wFull]}>
        <View
          style={[
            tw.p4,
            tw.flex,
            tw.flexRow,
            tw.justifyBetween,
            tw.itemsCenter,
          ]}
        >
          <View>
            <TextComponent style={[tw.text4xl, tw.textWhite]}>
              Forums
            </TextComponent>
            <TextComponent style={[tw.textGray100, tw.opacity50]}>
              Find topics that you like to read
            </TextComponent>
          </View>
          <View>
            <TouchableOpacity
              style={[tw.bgPink700, tw.p2, tw.roundedFull]}
              onPress={() => router.navigate("/forum/newPost")}
            >
              <Ionicons name="add" size={24} style={[tw.textWhite]} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            tw.bgGray200,
            tw.wFull,
            tw.hFull,
            tw.pY10,
            { borderTopLeftRadius: 50, borderTopRightRadius: 50 },
          ]}
        >
          {/* Tags for categories */}
          <View
            style={[
              tw.flex,
              tw.flexRow,
              tw.justifyCenter,
              tw.flexWrap,
              tw.wFull,
            ]}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  tw.bgGray300,
                  tw.p2,
                  tw.m2,
                  tw.roundedLg,
                  tw.flex,
                  tw.justifyCenter,
                ]}
              >
                <TextComponent style={[tw.textGray500, tw.fontBold]}>
                  {category.name}
                </TextComponent>
              </TouchableOpacity>
            ))}
          </View>

          {/* Forum posts */}
          {threads.map((thread) => {
            return (
              <TouchableOpacity
                style={[tw.roundedLg, tw.bgWhite, tw.m2, tw.p4]}
                onPress={openSpecificForum}
              >
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
                    src={thread?.created_by?.photo}
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
                  <View style={[tw.flex, tw.justifyCenter]}>
                    <TextComponent style={[tw.fontBold, tw.textLeft]}>
                      {thread?.thread?.title}
                    </TextComponent>
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
                      <TextComponent style={[tw.textLeft, tw.textGray500]}>
                        {thread?.created_by?.name}
                      </TextComponent>

                      <Ionicons
                        name="radio-button-on"
                        size={12}
                        style={[tw.textGray400, tw.mX2]}
                      />
                      <TextComponent style={[tw.textLeft, tw.textGray500]}>
                        {moment(
                          convertToMilliseconds(thread?.created_at)
                        ).fromNow()}
                      </TextComponent>
                    </View>
                  </View>
                </View>
                <View>
                  <TextComponent style={tw.textGray600}>
                    {thread.content}
                  </TextComponent>
                </View>
                <View style={[tw.flex, tw.flexRow, tw.justifyBetween, tw.mT2]}>
                  <TouchableOpacity
                    style={[
                      tw.textGray500,
                      tw.flex,
                      tw.flexRow,
                      tw.itemsCenter,
                    ]}
                  >
                    <Ionicons
                      name="thumbs-up-outline"
                      size={24}
                      style={[tw.textLeft, tw.textGray500]}
                    />
                    <TextComponent
                      style={[tw.textLeft, tw.textGray500, tw.pX2]}
                    >
                      12 votes
                    </TextComponent>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      tw.textGray500,
                      tw.flex,
                      tw.flexRow,
                      tw.itemsCenter,
                    ]}
                  >
                    <Ionicons
                      name="chatbox-outline"
                      size={24}
                      style={[tw.textLeft, tw.textGray500]}
                    />
                    <TextComponent
                      style={[tw.textLeft, tw.textGray500, tw.pX2]}
                    >
                      7 replies
                    </TextComponent>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      tw.textGray500,
                      tw.flex,
                      tw.flexRow,
                      tw.itemsCenter,
                    ]}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={24}
                      style={[tw.textLeft, tw.textGray500]}
                    />
                    <TextComponent
                      style={[tw.textLeft, tw.textGray500, tw.pX2]}
                    >
                      300 views
                    </TextComponent>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default ForumScreen;
