import React from "react";
import PostCreator from "@/components/PostCreator";
import { useLocalSearchParams } from "expo-router";
import LocalStorage from "@/utils/storage";
import localStore from "@/utils/localValues";

const CreatePostScreen: React.FC = () => {
  const { profileType } = useLocalSearchParams<{ profileType: string }>();

  const handlePostCreated = async (postData: {
    images: string[];
    caption: string;
    location: string;
  }) => {
    // Store the post data in local storage to be picked up by the home screen
    await LocalStorage.setItem('newPost', postData);
  };

  return (
    <PostCreator
      profileType={profileType as 'travel' | 'networking' | 'dating' | null}
      onPostCreated={handlePostCreated}
    />
  );
};

export default CreatePostScreen; 