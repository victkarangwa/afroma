import React, { useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Image, RefreshControl, ActivityIndicator } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NetworkingCard, { NetworkingProfile } from "../NetworkingCard";
import SinglePostView, { GenericPost } from "../SinglePostView";
import NetworkingProfileView from "../NetworkingProfileView";
import UserProfileView from "../UserProfileView";
import { MOCK_NOTIFICATIONS } from "../NotificationCenter";
import { Post, ApiResponse } from "@/types";
import { getTimeAgo } from "@/utils/timeAgo";
import { getUserInitials } from "@/utils/userInitials";
import { usePosts } from "@/hooks/usePosts";
import useApiRequest from "@/hooks/useApiRequest";
import ImageWithFallback from "../ImageWithFallback";

interface NetworkingProps {
  filteredProfiles?: NetworkingProfile[];
}

const Networking: React.FC<NetworkingProps> = ({ 
  filteredProfiles = []
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profiles' | 'posts' | 'requests'>('posts');
  const [networkingProfiles, setNetworkingProfiles] = useState<any[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [connectingProfiles, setConnectingProfiles] = useState<Set<number>>(new Set());
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [respondingRequests, setRespondingRequests] = useState<Set<number>>(new Set());
  const [selectedPost, setSelectedPost] = useState<GenericPost | null>(null);
  const [singlePostVisible, setSinglePostVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [profileViewVisible, setProfileViewVisible] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const [optimisticLikeCounts, setOptimisticLikeCounts] = useState<Map<number, number>>(new Map());
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Use the posts hook for networking posts
  const {
    posts: apiPosts,
    loading: postsLoading,
    error: postsError,
    hasMore,
    loadMore,
    refresh,
    searchPosts
  } = usePosts({
    initialPage: 1,
    pageSize: 10,
    autoLoad: true,
    profileType: 'NETWORKING'
  });

  // Use the API request hook for like/unlike functionality
  const { loading: apiLoading, send } = useApiRequest<ApiResponse>();

  const handleViewProfile = (userId: number) => {
    console.log('Viewing profile=====>:', userId);
    setSelectedUserId(userId);
    setProfileModalVisible(true);
  };

  const handleCloseProfile = () => {
    setProfileModalVisible(false);
    setSelectedUserId(null);
  };

  // Load networking profiles from API
  const loadNetworkingProfiles = React.useCallback(async () => {
    try {
      setProfilesLoading(true);
      setProfilesError(null);
      
      const response = await send('get', '/friendship/potential');
      
      if (response?.success && Array.isArray(response.data)) {
        setNetworkingProfiles(response.data);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        setNetworkingProfiles(response);
      } else {
        setProfilesError('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading networking profiles:', error);
      setProfilesError('Failed to load profiles');
    } finally {
      setProfilesLoading(false);
    }
  }, [send]);

  // Load connection requests from API
  const loadConnectionRequests = React.useCallback(async () => {
    try {
      setRequestsLoading(true);
      setRequestsError(null);
      
      const response = await send('get', '/friendship/requests/received');
      console.log('Connection requests response:', response);
      
      if (response?.success && Array.isArray(response.data)) {
        setConnectionRequests(response.data);
      } else if (Array.isArray(response)) {
        // Handle direct array response
        setConnectionRequests(response);
      } else {
        setRequestsError('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading connection requests:', error);
      setRequestsError('Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  }, [send]);

  // console.log('apiPosts', apiPosts);

  // Function to load user's liked posts (if API endpoint exists)
  const loadUserLikedPosts = React.useCallback(async () => {
    try {
      // TODO: Replace with actual API endpoint if available
      // const result = await send('get', '/user/liked-posts');
      // if (result?.data) {
      //   const likedPostIds = result.data.map((post: any) => post.id);
      //   setLikedPosts(new Set(likedPostIds));
      // }
    } catch (error) {
      console.error('Error loading liked posts:', error);
    }
  }, []);

  // Connection requests will be loaded from API

  // Update profiles when filteredProfiles prop changes
  // React.useEffect(() => {
  //   setNetworkingProfiles(filteredProfiles);
  // }, [filteredProfiles]);

  // Load user's liked posts on component mount
  React.useEffect(() => {
    loadUserLikedPosts();
  }, [loadUserLikedPosts]);

  // Load networking profiles when component mounts or profiles tab is selected
  React.useEffect(() => {
    if (activeTab === 'profiles') {
      loadNetworkingProfiles();
    }
  }, [activeTab]);

  // Load connection requests when requests tab is selected
  React.useEffect(() => {
    if (activeTab === 'requests') {
      loadConnectionRequests();
    }
  }, [activeTab]);

  const handleConnect = async (profileId: number) => {
    // Prevent multiple requests for the same profile
    if (connectingProfiles.has(profileId)) {
      return;
    }

    Alert.alert(
      "Send Connection Request",
      "Would you like to send a connection request to this person?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: async () => {
            try {
              setConnectingProfiles(prev => new Set(prev).add(profileId));
              
              const response = await send('post', '/friendship/request', {
                receiverId: profileId
              });
              
              console.log('Friend request response:', response);
              
              if (response?.success || response?.id) {
                // Update local state to show pending status
                setNetworkingProfiles(prevProfiles =>
                  prevProfiles.map(profile =>
                    profile.id === profileId ? { 
                      ...profile, 
                      hasPendingRequest: true,
                      friendshipId: response.id,
                      friendshipStatus: response.status
                    } : profile
                  )
                );
                Alert.alert("Success", "Connection request sent!");
              } else {
                Alert.alert("Error", "Failed to send connection request. Please try again.");
              }
            } catch (error) {
              console.error('Error sending connection request:', error);
              Alert.alert("Error", "Failed to send connection request. Please try again.");
            } finally {
              setConnectingProfiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(profileId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleMessage = (profileId: number) => {
    const profile = networkingProfiles.find(p => p.id === profileId);
    if (profile?.friend === true) {
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

  const handleViewNetworkingProfile = (profile: any) => {
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

  const toggleBookmark = async (postId: number) => {
    // Prevent multiple rapid clicks
    if (likingPosts.has(postId)) return;
    
    // Store the current like state before making changes
    const wasLiked = likedPosts.has(postId);
    
    try {
      setLikingPosts(prev => new Set(prev).add(postId));
      
      const result = await send('get', `/post/like/${postId}/toggle`);
      console.log('Like toggle result:', result);
      
      // Update local state immediately for better UX
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
      
      // Update optimistic like count immediately
      setOptimisticLikeCounts(prev => {
        const newMap = new Map(prev);
        const currentPost = apiPosts.find(post => post.id === postId);
        if (currentPost) {
          const currentCount = currentPost.likeCount;
          const newCount = wasLiked ? currentCount - 1 : currentCount + 1;
          newMap.set(postId, newCount);
        }
        return newMap;
      });
      
      // Update like count locally instead of refreshing all posts
      // This provides instant feedback without full screen loading
      if (result?.data?.likeCount !== undefined) {
        // If the API returns the updated like count, use it
        console.log('Updated like count from API:', result.data.likeCount);
        setOptimisticLikeCounts(prev => {
          const newMap = new Map(prev);
          newMap.set(postId, result.data.likeCount);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the local state change on error
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      
      // Revert optimistic like count on error
      setOptimisticLikeCounts(prev => {
        const newMap = new Map(prev);
        newMap.delete(postId);
        return newMap;
      });
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleLike = (postId: number) => {
    toggleBookmark(postId);
  };

  const handleComment = (postId: number) => {
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: number) => {
    console.log('Share post:', postId);
  };

  const handleAcceptConnection = async (request: any) => {
    const senderName = `${request.sender.firstname} ${request.sender.lastname}`;
    
    Alert.alert(
      'Accept Connection',
      `Accept connection request from ${senderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              setRespondingRequests(prev => new Set(prev).add(request.id));
              
              const response = await send('put', '/friendship/respond', {
                requestId: request.id,
                approve: true
              });
              
              console.log('Accept connection response:', response);
              
              if (response?.success || response?.id) {
                // Remove the request from the list
                setConnectionRequests(prevRequests =>
                  prevRequests.filter(req => req.id !== request.id)
                );
                Alert.alert('Success', 'Connection request accepted!');
              } else {
                Alert.alert('Error', 'Failed to accept connection request. Please try again.');
              }
            } catch (error) {
              console.error('Error accepting connection request:', error);
              Alert.alert('Error', 'Failed to accept connection request. Please try again.');
            } finally {
              setRespondingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  const handleDeclineConnection = async (request: any) => {
    const senderName = `${request.sender.firstname} ${request.sender.lastname}`;
    
    Alert.alert(
      'Decline Connection',
      `Decline connection request from ${senderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          style: 'destructive',
          onPress: async () => {
            try {
              setRespondingRequests(prev => new Set(prev).add(request.id));
              
              const response = await send('put', '/friendship/respond', {
                requestId: request.id,
                approve: false
              });
              
              console.log('Decline connection response:', response);
              
              if (response?.success || response?.id) {
                // Remove the request from the list
                setConnectionRequests(prevRequests =>
                  prevRequests.filter(req => req.id !== request.id)
                );
                Alert.alert('Success', 'Connection request declined.');
              } else {
                Alert.alert('Error', 'Failed to decline connection request. Please try again.');
              }
            } catch (error) {
              console.error('Error declining connection request:', error);
              Alert.alert('Error', 'Failed to decline connection request. Please try again.');
            } finally {
              setRespondingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  const renderCaptionWithHashtags = (caption: string) => {
    const parts = caption.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Text key={index} style={[tw.textBlue600, tw.fontBold, tw.textSm]}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const renderConnectionRequest = ({ item }: { item: any }) => {
    const senderName = `${item.sender.firstname} ${item.sender.lastname}`;
    const senderPhoto = item.sender.gallery && item.sender.gallery.length > 0 
      ? item.sender.gallery[0].mediaUrl 
      : undefined;
    const isResponding = respondingRequests.has(item.id);
    
    return (
      <View style={[tw.bgWhite, tw.p4, tw.mB4, tw.roundedLg, tw.shadow, tw.mX4]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.mB3]}>
          {senderPhoto ? (
            <ImageWithFallback
              source={{ uri: senderPhoto }}
              style={[tw.w12, tw.h12, tw.roundedFull, tw.mR3]}
            />
          ) : (
            <View style={[tw.w12, tw.h12, tw.roundedFull, tw.mR3, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
              <Text style={[tw.textGray700, tw.fontBold, tw.textSm]}>
                {getUserInitials(item.sender.firstname, item.sender.lastname)}
              </Text>
            </View>
          )}
          <View style={[tw.flex1]}>
            <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{senderName}</Text>
            <Text style={[tw.textGray600, tw.textSm]}>Wants to connect with you</Text>
            <Text style={[tw.textGray400, tw.textXs]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
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
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[tw.textWhite, tw.fontMedium, tw.textSm]}>Decline</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              tw.bgGreen500,
              tw.roundedFull,
              tw.pX4,
              tw.pY2
            ]}
            onPress={() => handleAcceptConnection(item)}
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[tw.textWhite, tw.fontMedium, tw.textSm]}>Accept</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPostCard = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4]}
      onPress={() => {
        console.log('Networking post tapped:', item.id);
        // Convert API Post to GenericPost format
        const genericPost: GenericPost = {
          id: item.id,
          user: {
            name: `${item.user.firstname} ${item.user.lastname}`,
            avatar: "", // Not used anymore, we use initials instead
            userId: item.user.id // Add userId for profile viewing
          },
          timestamp: getTimeAgo(item.createdAt),
          location: "",
          caption: item.content,
          images: item.attachments.length > 0 ? item.attachments.map(att => att.mediaUrl) : [],
          likes: item.likeCount,
          comments: 0,
          shares: 0,
          isBookmarked: false,
        };
        setSelectedPost(genericPost);
        setSinglePostVisible(true);
      }}
    >
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.pB2]}>
        <TouchableOpacity 
          style={[tw.flexRow, tw.itemsCenter, tw.flex1]}
          onPress={() => handleViewProfile(item.user.id)}
          activeOpacity={0.7}
        >
          <View style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
            <Text style={[tw.textGray700, tw.fontBold, tw.textSm]}>
              {getUserInitials(item.user.firstname, item.user.lastname)}
            </Text>
          </View>
          <View>
            <Text style={[tw.textGray900, tw.fontMedium, tw.textSm]}>
              {item.user.firstname} {item.user.lastname}
            </Text>
            <Text style={[tw.textGray500, tw.textXs]}>{getTimeAgo(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => toggleBookmark(item.id)}
          disabled={likingPosts.has(item.id)}
        >
          {likingPosts.has(item.id) ? (
            <ActivityIndicator size="small" color="#6b7280" />
          ) : (
            <Ionicons 
              name={likedPosts.has(item.id) ? "heart" : "heart-outline"} 
              size={20} 
              color={likedPosts.has(item.id) ? "#ef4444" : "#6b7280"} 
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={[tw.pX4, tw.pB3]}>
        <Text style={[tw.textGray800, tw.textSm]}>
          {renderCaptionWithHashtags(item.content)}
        </Text>
      </View>


      {/* Media */}
      {item.attachments.length > 0 && (
        <View style={[tw.pX4, tw.pB2]}>
          {item.attachments.length === 1 ? (
            <ImageWithFallback
              source={{ uri: item.attachments[0].mediaUrl }}
              style={[tw.wFull, { height: 240 }, tw.roundedLg]}
              resizeMode="cover"
            />
          ) : item.attachments.length === 2 ? (
            <View style={[tw.flexRow, { gap: 4 }]}>
              <ImageWithFallback
                source={{ uri: item.attachments[0].mediaUrl }}
                style={[tw.flex1, { height: 200 }, tw.roundedLg]}
                resizeMode="cover"
              />
              <ImageWithFallback
                source={{ uri: item.attachments[1].mediaUrl }}
                style={[tw.flex1, { height: 200 }, tw.roundedLg]}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[tw.flexRow, { gap: 4 }]}>
              <ImageWithFallback
                source={{ uri: item.attachments[0].mediaUrl }}
                style={[tw.flex1, { height: 200 }, tw.roundedLg]}
                resizeMode="cover"
              />
              <View style={[tw.flex1, { gap: 4 }]}>
                <ImageWithFallback
                  source={{ uri: item.attachments[1].mediaUrl }}
                  style={[tw.wFull, { height: 98 }, tw.roundedLg]}
                  resizeMode="cover"
                />
                {item.attachments.length > 3 && (
                  <View style={[tw.wFull, { height: 98 }, tw.roundedLg, tw.bgGray200, tw.justifyCenter, tw.itemsCenter]}>
                    <Text style={[tw.textGray600, tw.fontBold]}>+{item.attachments.length - 3}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Engagement */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pX4, tw.pB4]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]} onPress={() => handleLike(item.id)}>
            <Ionicons name="heart-outline" size={18} color="#fb6c31" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>
              {optimisticLikeCounts.get(item.id) ?? item.likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[tw.flexRow, tw.itemsCenter, tw.mR6]} 
            onPress={() => {
              // Convert API Post to GenericPost format for comment view
              const genericPost: GenericPost = {
                id: item.id,
                user: {
                  name: `${item.user.firstname} ${item.user.lastname}`,
                  avatar: "" // Not used anymore, we use initials instead
                },
                timestamp: getTimeAgo(item.createdAt),
                location: "",
                caption: item.content,
                images: item.attachments.length > 0 ? item.attachments.map(att => att.mediaUrl) : [],
                likes: item.likeCount,
                comments: 0, // TODO: Get actual comment count from API
                shares: 0,
                isBookmarked: false,
              };
              setSelectedPost(genericPost);
              setSinglePostVisible(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter]} onPress={() => handleShare(item.id)}>
            <Ionicons name="arrow-redo-outline" size={18} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        postsLoading && apiPosts.length === 0 ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter]}>
            <Text style={[tw.textGray500, tw.textLg]}>Loading posts...</Text>
          </View>
        ) : postsError ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
            <Ionicons name="cloud-offline-outline" size={64} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4, tw.textCenter]}>
              Unable to load posts
            </Text>
            <Text style={[tw.textGray400, tw.textBase, tw.mT2, tw.textCenter]}>
              Please check your connection and try again
            </Text>
            <TouchableOpacity
              style={[tw.bgPink700, tw.roundedFull, tw.pX6, tw.pY3, tw.mT6]}
              onPress={refresh}
            >
              <Text style={[tw.textWhite, tw.fontBold]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : apiPosts.length === 0 ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4, tw.textCenter]}>
              No networking posts yet
            </Text>
            <Text style={[tw.textGray400, tw.textBase, tw.mT2, tw.textCenter]}>
              Be the first to share something with your network!
            </Text>
            <TouchableOpacity
              style={[tw.bgPink700, tw.roundedFull, tw.pX6, tw.pY3, tw.mT6]}
              onPress={() => router.push('/posts/create?profileType=networking')}
            >
              <Text style={[tw.textWhite, tw.fontBold]}>Create Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={apiPosts}
            renderItem={renderPostCard}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ paddingBottom: 120 }]}
            onEndReached={() => {
              if (hasMore && !postsLoading) {
                loadMore();
              }
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => 
              hasMore && postsLoading ? (
                <View style={[tw.pY4, tw.itemsCenter]}>
                  <ActivityIndicator size="small" color="#fb6c31" />
                  <Text style={[tw.textGray500, tw.textSm, tw.mT2]}>Loading more posts...</Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={postsLoading}
                onRefresh={refresh}
                colors={["#fb6c31"]}
                tintColor="#fb6c31"
              />
            }
          />
        )
      ) : activeTab === 'profiles' ? (
        profilesLoading && networkingProfiles.length === 0 ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter]}>
            <ActivityIndicator size="large" color="#fb6c31" />
            <Text style={[tw.textGray500, tw.textLg, tw.mT4]}>Loading profiles...</Text>
          </View>
        ) : profilesError ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
            <Ionicons name="cloud-offline-outline" size={64} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4, tw.textCenter]}>
              Unable to load profiles
            </Text>
            <Text style={[tw.textGray400, tw.textBase, tw.mT2, tw.textCenter]}>
              {profilesError}
            </Text>
            <TouchableOpacity
              style={[tw.bgPink700, tw.roundedFull, tw.pX6, tw.pY3, tw.mT6]}
              onPress={loadNetworkingProfiles}
            >
              <Text style={[tw.textWhite, tw.fontBold]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : networkingProfiles.length === 0 ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
            <Ionicons name="people-outline" size={64} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4, tw.textCenter]}>
              No networking profiles available
            </Text>
            <Text style={[tw.textGray400, tw.textBase, tw.mT2, tw.textCenter]}>
              Check back later for new connections
            </Text>
          </View>
        ) : (
          <FlatList
            data={networkingProfiles}
            renderItem={({ item }) => (
              <NetworkingCard
                profile={{
                  id: item.id,
                  name: `${item.firstname} ${item.lastname}`,
                  headline: item.bio || 'No bio available',
                  summary: item.bio || 'No bio available',
                  photo: item.gallery && item.gallery.length > 0 ? item.gallery[0].mediaUrl : undefined,
                  industries: [], // Not available in API response
                  collaboration: [], // Not available in API response
                  connectionStatus: item.hasPendingRequest ? 'pending' : item.friend ? 'connected' : 'none',
                  friendshipId: item.friendshipId,
                  friendshipStatus: item.friendshipStatus,
                  // Add API-specific fields
                  apiData: item
                }}
                onConnect={handleConnect}
                onMessage={handleMessage}
                onViewProfile={handleViewNetworkingProfile}
                isConnecting={connectingProfiles.has(item.id)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ paddingBottom: 120 }]}
            refreshControl={
              <RefreshControl
                refreshing={profilesLoading}
                onRefresh={loadNetworkingProfiles}
                colors={["#fb6c31"]}
                tintColor="#fb6c31"
              />
            }
          />
        )
      ) : activeTab === 'requests' ? (
        requestsLoading && connectionRequests.length === 0 ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter]}>
            <ActivityIndicator size="large" color="#fb6c31" />
            <Text style={[tw.textGray500, tw.textLg, tw.mT4]}>Loading requests...</Text>
          </View>
        ) : requestsError ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
            <Ionicons name="cloud-offline-outline" size={64} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4, tw.textCenter]}>
              Unable to load requests
            </Text>
            <Text style={[tw.textGray400, tw.textBase, tw.mT2, tw.textCenter]}>
              {requestsError}
            </Text>
            <TouchableOpacity
              style={[tw.bgPink700, tw.roundedFull, tw.pX6, tw.pY3, tw.mT6]}
              onPress={loadConnectionRequests}
            >
              <Text style={[tw.textWhite, tw.fontBold]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : connectionRequests.length === 0 ? (
          <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
            <Ionicons name="checkmark-circle" size={64} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4, tw.textCenter]}>
              No pending requests
            </Text>
            <Text style={[tw.textGray400, tw.textBase, tw.mT2, tw.textCenter]}>
              You're all caught up with connection requests!
            </Text>
          </View>
        ) : (
          <FlatList
            data={connectionRequests}
            renderItem={renderConnectionRequest}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ paddingBottom: 120 }]}
            refreshControl={
              <RefreshControl
                refreshing={requestsLoading}
                onRefresh={loadConnectionRequests}
                colors={["#fb6c31"]}
                tintColor="#fb6c31"
              />
            }
          />
        )
      ) : null}

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
          onViewProfile={handleViewProfile}
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

      {/* User Profile View */}
      <UserProfileView
        visible={profileModalVisible}
        onClose={handleCloseProfile}
        userId={selectedUserId || 0}
      />
    </View>
  );
};

export default Networking; 