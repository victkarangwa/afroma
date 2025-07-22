import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NetworkingCard, { MOCK_NETWORKING_PROFILES, MOCK_NETWORKING_POSTS, NetworkingProfile } from "../NetworkingCard";
import NetworkingPostCard from "../NetworkingPostCard";
import SinglePostView, { GenericPost } from "../SinglePostView";
import NetworkingProfileView from "../NetworkingProfileView";

const Networking: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profiles' | 'posts'>('posts');
  const [networkingProfiles, setNetworkingProfiles] = useState(MOCK_NETWORKING_PROFILES);
  const [selectedPost, setSelectedPost] = useState<GenericPost | null>(null);
  const [singlePostVisible, setSinglePostVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<NetworkingProfile | null>(null);
  const [profileViewVisible, setProfileViewVisible] = useState(false);

  const handleConnect = (profileId: number) => {
    Alert.alert(
      "Send Connection Request",
      "Would you like to send a connection request to this person?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: () => {
            setNetworkingProfiles(prevProfiles =>
              prevProfiles.map(profile =>
                profile.id === profileId ? { ...profile, connectionStatus: "pending" } : profile
              )
            );
            Alert.alert("Success", "Connection request sent!");
          },
        },
      ]
    );
  };

  const handleMessage = (profileId: number) => {
    const profile = networkingProfiles.find(p => p.id === profileId);
    if (profile?.connectionStatus === "connected") {
      console.log('Opening chat with:', profile.name);
    } else {
      Alert.alert(
        "Connection Required",
        "You need to be connected to message this person. Send a connection request first.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Send Request", onPress: () => handleConnect(profileId) },
        ]
      );
    }
  };

  const handleViewProfile = (profile: NetworkingProfile) => {
    setSelectedProfile(profile);
    setProfileViewVisible(true);
  };

  const handleProfileConnect = (profileId: number) => {
    handleConnect(profileId);
    setProfileViewVisible(false);
  };

  const handleProfileMessage = (profileId: number) => {
    handleMessage(profileId);
    setProfileViewVisible(false);
  };

  const toggleBookmark = (postId: number) => {
    console.log('Toggle bookmark for post:', postId);
  };

  const handleLike = (postId: number) => {
    console.log('Like post:', postId);
  };

  const handleComment = (postId: number) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: number) => {
    console.log('Share post:', postId);
  };

  const renderPostCard = (item: any) => {
    const genericPost: GenericPost = {
      id: item.id,
      user: item.user,
      timestamp: item.timestamp,
      location: item.location,
      caption: item.caption,
      images: item.images,
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
      isBookmarked: item.isBookmarked,
      tags: item.tags
    };

    return (
      <TouchableOpacity onPress={() => {
        setSelectedPost(genericPost);
        setSinglePostVisible(true);
      }}>
        <NetworkingPostCard post={item} onToggleBookmark={toggleBookmark} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[tw.flex1, tw.bgGray100]}>

      {/* Tab Navigation */}
      <View style={[tw.flexRow, tw.bgWhite, tw.roundedLg, tw.mB4, tw.mX4, tw.p1]}>
        <TouchableOpacity
          style={[
            tw.flex1,
            tw.pY3,
            tw.roundedLg,
            tw.itemsCenter,
            activeTab === 'posts' ? tw.bgPink700 : tw.bgTransparent
          ]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[
            tw.fontMedium,
            activeTab === 'posts' ? tw.textWhite : tw.textGray600
          ]}>
            Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            tw.flex1,
            tw.pY3,
            tw.roundedLg,
            tw.itemsCenter,
            activeTab === 'profiles' ? tw.bgGray900 : tw.bgTransparent
          ]}
          onPress={() => setActiveTab('profiles')}
        >
          <Text style={[
            tw.fontMedium,
            activeTab === 'profiles' ? tw.textWhite : tw.textGray600
          ]}>
            Suggested Profiles
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'posts' ? (
        <FlatList
          data={MOCK_NETWORKING_POSTS}
          renderItem={({ item }) => renderPostCard(item)}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[tw.pB4]}
        />
      ) : (
        <FlatList
          data={networkingProfiles}
          renderItem={({ item }) => (
            <NetworkingCard
              profile={item}
              onConnect={handleConnect}
              onMessage={handleMessage}
              onViewProfile={handleViewProfile}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[tw.pB4]}
        />
      )}

      {/* Single Post View Modal */}
      {selectedPost && (
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
      )}

      {/* Profile View Modal */}
      {selectedProfile && (
        <NetworkingProfileView
          visible={profileViewVisible}
          profile={selectedProfile}
          onClose={() => {
            setProfileViewVisible(false);
            setSelectedProfile(null);
          }}
          onConnect={handleProfileConnect}
          onMessage={handleProfileMessage}
        />
      )}
    </View>
  );
};

export default Networking; 