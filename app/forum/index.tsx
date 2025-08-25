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
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";
import moment from "moment";
import { convertSecondsToTime, convertToMilliseconds } from "@/utils";
import { PostSkeleton } from "@/components/Skeleton";
import LocalStorage from "@/utils/storage";
import config from "@/utils/localValues";

const ForumScreen: React.FC = () => {
  const router = useRouter();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchThreads = async () => {
      const user: number | null = await LocalStorage.getItem(config.userId);
      console.log("User ID", user);
      setUserId(Number(user));
      const threadsRef = collection(db, "threads");
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, orderBy("created_at", "asc"));

      // Listener for threads and posts
      const unsubscribeThreads = onSnapshot(threadsRef, (threadsSnapshot) => {
        const threadsMap = threadsSnapshot.docs.reduce((map, doc) => {
          const threadData = doc.data();
          map[doc.id] = { id: doc.id, title: threadData.title };
          return map;
        }, {} as { [key: string]: { id: string; title: string } });

        const unsubscribePosts = onSnapshot(postsQuery, (postsSnapshot) => {
          const enhancedPosts = postsSnapshot.docs.map((doc) => {
            const postData = doc.data();
            const threadInfo = threadsMap[postData.thread_id] || {};
            return {
              post_id: doc.id,
              ...postData,
              thread: threadInfo, // Add thread info here
            };
          });

          setThreads(enhancedPosts);
          setLoading(false);

          // console.log("-----", enhancedPosts);
        });

        // Cleanup posts listener on unmount
        return () => unsubscribePosts();
      });

      // Cleanup threads listener on unmount
      return () => unsubscribeThreads();
    };
    fetchThreads();
  }, [db]);

  const updatePostLikes = async (postId: string, incrementValue = 1) => {
    try {
      const postRef = doc(db, "posts", postId);

      // Increment likes count
      await updateDoc(postRef, {
        likes: incrementValue > 0 ? increment(incrementValue) : increment(-1),
        liked_by: incrementValue > 0 ? arrayUnion(userId) : arrayRemove(userId),
      });

      console.log("Post likes updated successfully.");
    } catch (error) {
      console.error("Error updating post likes:", error);
    }
  };

  const openSpecificForum = (postId) => {
    router.navigate(`/forum/specificPost?postId=${postId}`);
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
            <TextComponent style={[tw.text4xl, tw.textGray900]}>
              Forums
            </TextComponent>
            <TextComponent style={[tw.textGray900, tw.opacity50]}>
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
          {/* Forum posts */}
          {!loading ? (
            threads?.length ? (
              threads.map((thread) => {
                return (
                  <TouchableOpacity
                    style={[tw.roundedLg, tw.bgWhite, tw.m2, tw.p4]}
                    onPress={() => openSpecificForum(thread.post_id)}
                  >
                    <View
                      style={[
                        tw.bgWhite,
                        tw.flex,
                        tw.flexRow,
                        tw.justifyStart,

                        // tw.shadowXl,
                      ]}
                    >
                      <Image
                        src={thread?.created_by?.photo.replace(
                          // Replace the URL with the correct one if needed !!this will be removed on production
                          "http://203.161.50.115:5001",
                          "https://uat-user-api.bondedapp.io"
                        )}
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
                              convertToMilliseconds(
                                thread?.created_at ?? {
                                  seconds: 0,
                                  nanoseconds: 0,
                                }
                              )
                            ).fromNow()}
                          </TextComponent>
                        </View>
                      </View>
                    </View>
                    <View>
                      <TextComponent style={tw.textGray600}>
                        {thread.content?.substring(0, 200)}...
                      </TextComponent>
                    </View>
                    <View style={[tw.flex, tw.flexRow, tw.mT2]}>
                      <TouchableOpacity
                        style={[
                          tw.textGray500,
                          tw.flex,
                          tw.flexRow,
                          tw.itemsCenter,
                        ]}
                        onPress={() =>
                          updatePostLikes(
                            thread.post_id,
                            thread?.liked_by?.includes(userId) ? -1 : 1
                          )
                        }
                      >
                        <Ionicons
                          name={
                            thread?.liked_by?.includes(userId)
                              ? "heart"
                              : "heart-outline"
                          }
                          size={24}
                          style={[tw.textLeft, tw.textGray500]}
                        />
                        <TextComponent
                          style={[tw.textLeft, tw.textGray500, tw.pX2]}
                        >
                          {thread?.likes} likes
                        </TextComponent>
                      </TouchableOpacity>
                      {/* <TouchableOpacity
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
                      </TouchableOpacity> */}
                      <TouchableOpacity
                        style={[
                          tw.textGray500,
                          tw.flex,
                          tw.flexRow,
                          tw.itemsCenter,
                          tw.mX4,
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
                          {thread?.views}
                        </TextComponent>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={[tw.flex, tw.itemsCenter, tw.justifyCenter, tw.mY4]}>
                <TextComponent
                  style={[tw.textGray500, tw.textXl, tw.mY4, tw.textCenter]}
                >
                  No forum posts available
                </TextComponent>
                <TextComponent style={[tw.textGray500]}>
                  Forum posts will appear here when you create a new post
                </TextComponent>
              </View>
            )
          ) : (
            <View>
              {[1, 2, 3].map((sk, index) => (
                <PostSkeleton key={index} />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ForumScreen;
