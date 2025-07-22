import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Image } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NetworkingCard, { MOCK_NETWORKING_PROFILES, MOCK_NETWORKING_POSTS, NetworkingProfile } from "../NetworkingCard";
import NetworkingPostCard from "../NetworkingPostCard";
import SinglePostView, { GenericPost } from "../SinglePostView";
import NetworkingProfileView from "../NetworkingProfileView";
import { MOCK_NOTIFICATIONS } from "../NotificationCenter";

interface NetworkingProps {
  filteredProfiles?: NetworkingProfile[];
  filteredPosts?: any[];
}

const Networking: React.FC<NetworkingProps> = ({ 
  filteredProfiles = MOCK_NETWORKING_PROFILES, 
  filteredPosts = MOCK_NETWORKING_POSTS 
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profiles' | 'posts' | 'requests'>('posts');
  const [networkingProfiles, setNetworkingProfiles] = useState(filteredProfiles);
  const [selectedPost, setSelectedPost] = useState<GenericPost | null>(null);
  const [singlePostVisible, setSinglePostVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<NetworkingProfile | null>(null);
  const [profileViewVisible, setProfileViewVisible] = useState(false);

  // Get connection requests from notifications
  const connectionRequests = MOCK_NOTIFICATIONS.filter(
    n => n.type === 'connection_request' && n.action === 'accept_decline'
  );

  // Update profiles when filteredProfiles prop changes
  React.useEffect(() => {
    setNetworkingProfiles(filteredProfiles);
  }, [filteredProfiles]);

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

  const handleAcceptConnection = (notification: any) => {
    Alert.alert(
      'Accept Connection',
      `Accept connection request from ${notification.message.split(' wants to connect')[0]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            console.log('Connection accepted:', notification.id);
            // Here you would typically make an API call to accept the connection
            Alert.alert('Success', 'Connection request accepted!');
          }
        }
      ]
    );
  };

  const handleDeclineConnection = (notification: any) => {
    Alert.alert(
      'Decline Connection',
      `Decline connection request from ${notification.message.split(' wants to connect')[0]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          style: 'destructive',
          onPress: () => {
            console.log('Connection declined:', notification.id);
            // Here you would typically make an API call to decline the connection
            Alert.alert('Success', 'Connection request declined.');
          }
        }
      ]
    );
  };

  const renderConnectionRequest = ({ item }: { item: any }) => (
    <View style={[tw.bgWhite, tw.p4, tw.mB4, tw.roundedLg, tw.shadow, tw.mX4]}>
      <View style={[tw.flexRow, tw.itemsCenter, tw.mB3]}>
        <Image
          source={{ uri: item.avatar }}
          style={[tw.w12, tw.h12, tw.roundedFull, tw.mR3]}
        />
        <View style={[tw.flex1]}>
          <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{item.title}</Text>
          <Text style={[tw.textGray600, tw.textSm]}>{item.message}</Text>
          <Text style={[tw.textGray400, tw.textXs]}>{item.timestamp}</Text>
        </View>
      </View>
      
      <View style={[tw.flexRow, tw.justifyEnd]}>
        <TouchableOpacity
          style={[
            tw.bgRed500,
            tw.roundedFull,
            tw.pX4,
            tw.pY2,
            tw.mR2
          ]}
          onPress={() => handleDeclineConnection(item)}
        >
          <Text style={[tw.textWhite, tw.fontMedium, tw.textSm]}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            tw.bgGreen500,
            tw.roundedFull,
            tw.pX4,
            tw.pY2
          ]}
          onPress={() => handleAcceptConnection(item)}
        >
          <Text style={[tw.textWhite, tw.fontMedium, tw.textSm]}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <NetworkingPostCard 
        post={item} 
        onToggleBookmark={toggleBookmark}
        onPress={() => {
          console.log('Networking post tapped:', item.id);
          console.log('Setting networking selected post:', genericPost);
          setSelectedPost(genericPost);
          setSinglePostVisible(true);
          console.log('Networking single post visible set to true');
        }}
      />
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
            activeTab === 'posts' ? tw.bgGray900 : tw.bgTransparent
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
             Profiles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            tw.flex1,
            tw.pY3,
            tw.roundedLg,
            tw.itemsCenter,
            activeTab === 'requests' ? tw.bgGray900 : tw.bgTransparent
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <Text style={[
              tw.fontMedium,
              activeTab === 'requests' ? tw.textWhite : tw.textGray600
            ]}>
              Requests
            </Text>
            {connectionRequests.length > 0 && (
              <View style={[
                tw.bgPink700, 
                tw.roundedFull, 
                tw.pX2, 
                tw.pY1, 
                tw.mL2
              ]}>
                <Text style={[tw.textWhite, tw.textXs, tw.fontBold]}>
                  {connectionRequests.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'posts' ? (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => renderPostCard(item)}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 120 }]}
        />
      ) : activeTab === 'profiles' ? (
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
          contentContainerStyle={[{ paddingBottom: 120 }]}
        />
      ) : (
        <FlatList
          data={connectionRequests}
          renderItem={renderConnectionRequest}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 120 }]}
          ListEmptyComponent={
            <View style={[tw.itemsCenter, tw.pT20]}>
              <Ionicons name="checkmark-circle" size={48} color="#9ca3af" />
              <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4]}>
                No pending requests
              </Text>
              <Text style={[tw.textGray400, tw.textSm, tw.mT2, tw.textCenter]}>
                You're all caught up with connection requests!
              </Text>
            </View>
          }
        />
      )}

      {/* Single Post View Modal */}
      {selectedPost && (
        <SinglePostView
          visible={singlePostVisible}
          post={selectedPost}
          onClose={() => {
            console.log('Closing networking single post view');
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