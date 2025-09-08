import TextComponent from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/configs/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { convertToMilliseconds } from "@/utils";
import moment from "moment";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import Placeholder from "@/components/Skeleton";

const SpecificForumScreen: React.FC = () => {
  const { postId } = useLocalSearchParams() as { postId: string };

  const { loading, send } = useApiRequest<ApiResponse>();

  // console.log("postId", postId);

  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>({});
  const [postInfo, setPostInfo] = useState<any>({});
  const [postComments, setPostComments] = useState<any[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);

  const getMyBasicProfile = async () => {
    const result = await send("get", "/users/me");

    if (result?.errors) {
      return;
    }

    setUser({
      id: result?.id,
      name: result?.firstname + " " + result?.lastname,
      photo:
        result?.gallery?.find((pic: any) => pic.featured)?.thumbnailUrl ?? "",
    });
  };

  const listenToCommentsForPost = (onCommentsUpdate) => {
    try {
      // Reference the comments subcollection
      const commentsRef = collection(db, "posts", postId, "comments");

      // Query to order comments by creation time
      const commentsQuery = query(commentsRef, orderBy("created_at", "asc"));

      // Listen for real-time updates
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          comment_id: doc.id,
          ...doc.data(),
        }));

        // console.log("=======", comments);
        // Call the callback function with the updated comments
        onCommentsUpdate(comments);
      });

      // Return the unsubscribe function to stop listening when needed
      return unsubscribe;
    } catch (error) {
      console.error("Error listening to comments:", error);
      return null;
    }
  };

  useEffect(() => {
    // Start listening to comments
    const unsubscribe = listenToCommentsForPost((updatedComments: any) => {
      setPostComments(updatedComments);
    });

    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [postId]);

  useEffect(() => {
    getMyBasicProfile();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoadingPost(true);
        // Step 1: Fetch the post by ID
        const postRef = doc(db, "posts", postId); // Use `doc()` to fetch by document ID
        const postSnapshot = await getDoc(postRef);

        if (!postSnapshot.exists()) {
          console.error(`Post with ID ${postId} does not exist.`);
          return null;
        }

        const postData = postSnapshot.data();

        // Step 2: Increment the view count
        await updateDoc(postRef, {
          views: increment(1), // Increment the `views` field by 1
        });

        // Step 2: Fetch the corresponding thread using thread_id
        const threadRef = doc(db, "threads", postData.thread_id);
        const threadSnapshot = await getDoc(threadRef);

        const threadInfo = threadSnapshot.exists()
          ? {
              id: threadSnapshot.id,
              title: threadSnapshot.data().title,
              category: threadSnapshot.data().category,
            }
          : { id: null, title: "Unknown Thread" };

        // Step 3: Combine post data with thread info
        const enhancedPost = {
          post_id: postSnapshot.id,
          ...postData,
          thread: threadInfo,
        };

        // console.log("Enhanced Post Data:", enhancedPost);
        setPostInfo(enhancedPost);
        setLoadingPost(false);
        return postData;
      } catch (error) {
        setLoadingPost(false);
        console.error("Error fetching single post data:", error);
        return null;
      }
    };

    fetchPost();
  }, [postId]);

  const handleSend = async () => {
    setMessage("");
    try {
      // Reference the comments subcollection of the specific post
      const commentsRef = collection(db, "posts", postId, "comments");

      // Add the comment to Firestore
      const newCommentRef = await addDoc(commentsRef, {
        content: message,
        created_by: user,
        post_id: postId,
        created_at: serverTimestamp(), // Use Firestore's server time
      });
      // console.log(`Comment added with ID: ${newCommentRef.id}`);
      return newCommentRef.id;
    } catch (error) {
      console.error("Error adding comment:", error);
      return null;
    }
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
      <View style={[tw.bgPink100, tw.wFull]}>
        <View style={[tw.bgGray200, tw.wFull, tw.hFull]}>
          {/* Forum posts */}
          {loadingPost ? (
            <Placeholder />
          ) : (
            <View style={[tw.roundedLg, tw.bgWhite, tw.m2, tw.p4]}>
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
                  src={postInfo?.created_by?.photo}
                  source={require("../../assets/images/default_avatar.jpg")}
                  style={[
                    tw.w8,
                    tw.h8,
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
                      {postInfo?.created_by?.name}
                    </TextComponent>

                    <TextComponent style={[tw.textLeft, tw.textGray500]}>
                      {postInfo?.created_at &&
                        moment(
                          convertToMilliseconds(postInfo?.created_at)
                        ).fromNow()}
                    </TextComponent>
                  </View>
                </View>
              </View>
              <View>
                <TextComponent style={[tw.fontBold, tw.textXl, tw.pY2]}>
                  {postInfo?.thread?.title}
                </TextComponent>
                <TextComponent style={tw.textGray600}>
                  {postInfo?.content}
                </TextComponent>
              </View>
              {/* Tags for categories */}
              <View style={[tw.flex, tw.flexRow, tw.flexWrap, tw.wFull]}>
                <View
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
                    {postInfo?.thread?.category}
                  </TextComponent>
                </View>
              </View>
            </View>
          )}

          {/* Comments */}
          <View>
            <TextComponent style={[tw.textGray600, tw.fontBold, tw.m2]}>
              Comments
            </TextComponent>
          </View>
          {postComments.length ? (
            postComments.map((comment) => (
              <View style={[tw.roundedLg, tw.bgWhite, tw.m2, tw.p4]}>
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
                    src={comment?.created_by?.photo}
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
                      <View
                        style={[
                          tw.wFull,
                          tw.flex,
                          tw.flexRow,
                          tw.justifyBetween,
                        ]}
                      >
                        <TextComponent
                          style={[tw.textLeft, tw.textGray700, tw.fontBold]}
                        >
                          {comment?.created_by?.name}
                        </TextComponent>
                        <TextComponent style={[tw.textRight, tw.textGray500]}>
                          {comment?.created_at &&
                            moment(
                              convertToMilliseconds(comment?.created_at)
                            ).fromNow()}
                        </TextComponent>
                      </View>

                      <TextComponent style={tw.textGray700}>
                        {comment.content}
                      </TextComponent>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={[tw.flex, tw.itemsCenter, tw.justifyCenter, tw.mY4]}>
              <TextComponent
                style={[tw.textGray500, tw.textXl, tw.mY4, tw.textCenter]}
              >
                No comments available
              </TextComponent>
              <TextComponent style={[tw.textGray500]}>
                Be the first to comment on this post
              </TextComponent>
            </View>
          )}

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
