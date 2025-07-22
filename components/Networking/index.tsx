import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import NetworkingCard, { MOCK_NETWORKING_PROFILES, MOCK_NETWORKING_POSTS } from "../NetworkingCard";
import NetworkingPostCard from "../NetworkingPostCard";
import SinglePostView, { GenericPost } from "../SinglePostView";
import LocalStorage from "@/utils/storage";

const Networking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'posts'>('posts');
  const [networkingPosts, setNetworkingPosts] = useState(MOCK_NETWORKING_POSTS);
  const [selectedPost, setSelectedPost] = useState<GenericPost | null>(null);
  const [singlePostVisible, setSinglePostVisible] = useState(false);

  // Check for new posts when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const checkForNewPost = async () => {
        try {
          const newPost = await LocalStorage.getItem('newPost');
          if (newPost && typeof newPost === 'object' && 'images' in newPost && 'caption' in newPost && 'location' in newPost) {
            console.log('Found new networking post, adding to feed');
            addNewNetworkingPost(newPost as { images: string[]; caption: string; location: string });
            await LocalStorage.removeItem('newPost'); // Clear the data
          }
        } catch (error) {
          console.error('Error checking for new post:', error);
        }
      };

      checkForNewPost();
    }, [])
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const toggleBookmark = (postId: number) => {
    setNetworkingPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  const handleLike = (postId: number) => {
    setNetworkingPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleComment = (postId: number) => {
    // Handle comment action
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: number) => {
    // Handle share action
    console.log('Share post:', postId);
  };

  const addNewNetworkingPost = (postData: { images: string[]; caption: string; location: string }) => {
    const newPost: typeof MOCK_NETWORKING_POSTS[0] = {
      id: Date.now(), // Use timestamp as unique ID
      user: { 
        name: "You", 
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        headline: "Networking User"
      },
      timestamp: "Just now",
      location: postData.location,
      caption: postData.caption,
      images: postData.images,
      likes: 0,
      comments: 0,
      shares: 0,
      isBookmarked: false,
      tags: [], // Could extract hashtags from caption
    };

    console.log('Adding new networking post:', newPost);
    setNetworkingPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const renderProfileCard = ({ item }: { item: typeof MOCK_NETWORKING_PROFILES[0] }) => (
    <NetworkingCard profile={item} />
  );

  const renderPostCard = ({ item }: { item: typeof MOCK_NETWORKING_POSTS[0] }) => (
    <NetworkingPostCard 
      post={item} 
      onPress={() => {
        setSelectedPost(item as GenericPost);
        setSinglePostVisible(true);
      }}
      onToggleBookmark={toggleBookmark}
      formatNumber={formatNumber}
    />
  );

  return (
    <View style={[tw.flex1, tw.bgGray100]}>
      {/* Tab Header */}
      <View style={[tw.bgWhite, tw.pX4, tw.pT4, tw.pB2, tw.shadow]}>
        <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB3]}>Networking</Text>
        
        {/* Tab Buttons */}
        <View style={[tw.flexRow, tw.bgGray200, tw.roundedLg, tw.p1]}>
          <TouchableOpacity
            style={[
              tw.flex1,
              tw.flexRow,
              tw.itemsCenter,
              tw.justifyCenter,
              tw.pY2,
              tw.roundedLg,
              activeTab === 'profiles' ? tw.bgWhite : tw.bgTransparent,
            ]}
            onPress={() => setActiveTab('profiles')}
          >
            <Ionicons 
              name="people" 
              size={16} 
              color={activeTab === 'profiles' ? '#1f2937' : '#6b7280'} 
            />
            <Text style={[
              tw.mL2,
              tw.fontMedium,
              activeTab === 'profiles' ? tw.textGray900 : tw.textGray600,
            ]}>
              Suggested Profiles
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              tw.flex1,
              tw.flexRow,
              tw.itemsCenter,
              tw.justifyCenter,
              tw.pY2,
              tw.roundedLg,
              activeTab === 'posts' ? tw.bgWhite : tw.bgTransparent,
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons 
              name="calendar" 
              size={16} 
              color={activeTab === 'posts' ? '#1f2937' : '#6b7280'} 
            />
            <Text style={[
              tw.mL2,
              tw.fontMedium,
              activeTab === 'posts' ? tw.textGray900 : tw.textGray600,
            ]}>
              Posts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'profiles' ? (
        <FlatList
          data={MOCK_NETWORKING_PROFILES}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 80 }]}
        />
      ) : (
        <FlatList
          data={networkingPosts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 80 }]}
        />
      )}

      {/* Single Post View */}
      <SinglePostView
        visible={singlePostVisible}
        post={selectedPost}
        onClose={() => {
          setSinglePostVisible(false);
          setSelectedPost(null);
        }}
        onToggleBookmark={toggleBookmark}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        profileType="networking"
      />
    </View>
  );
};

export default Networking; 