import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, PanResponder, Animated, Modal, RefreshControl, BackHandler, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import { useRouter, useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import LocalStorage from "@/utils/storage";
import localStore from "@/utils/localValues";
import Networking from "@/components/Networking";
import SinglePostView, { GenericPost } from "@/components/SinglePostView";
import ImageWithFallback from "@/components/ImageWithFallback";
import UserProfileView from "@/components/UserProfileView";

import NotificationBadge from "@/components/NotificationBadge";
import { MOCK_NOTIFICATIONS } from "@/components/NotificationCenter";
import { usePosts } from "@/hooks/usePosts";
import { useDatingMatches } from "@/hooks/useDatingMatches";
import { ActivityIndicator } from "react-native";
import { Post, DatingMatch, ApiResponse } from "@/types";
import { getTimeAgo } from "@/utils/timeAgo";
import { getUserInitials } from "@/utils/userInitials";
import LoadingIndicator from "@/components/LoadingIndicator";
import PostSkeleton from "@/components/Skeleton/PostSkeleton";
import SearchResultSkeleton from "@/components/Skeleton/SearchResultSkeleton";
import DatingCardSkeleton from "@/components/Skeleton/DatingCardSkeleton";
import DatingMatchSkeleton from "@/components/Skeleton/DatingMatchSkeleton";
import DatingCard from "@/components/DatingCard";
import useApiRequest from "@/hooks/useApiRequest";
import { checkAuthStatus } from "@/utils/auth";

// Map API profileType to local value used in app
const mapApiProfileTypeToLocal = (apiType?: string): 'travel' | 'networking' | 'dating' | null => {
  if (!apiType) return null;
  const upper = apiType.toUpperCase();
  if (upper === 'TRAVEL') return 'travel';
  if (upper === 'NETWORKING') return 'networking';
  if (upper === 'DATING') return 'dating';
  return null;
};

// Choose a preferred type from an array of API types
const pickPreferredProfileType = (apiTypes?: string[] | null): 'travel' | 'networking' | 'dating' | null => {
  if (!apiTypes || apiTypes.length === 0) return null;
  // Preference order: DATING > NETWORKING > TRAVEL
  const upper = apiTypes.map(t => (t || '').toUpperCase());
  if (upper.includes('DATING')) return 'dating';
  if (upper.includes('NETWORKING')) return 'networking';
  if (upper.includes('TRAVEL')) return 'travel';
  return mapApiProfileTypeToLocal(apiTypes[0]);
};

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");



const HomeScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [datingProfiles, setDatingProfiles] = useState<DatingMatch[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showDating, setShowDating] = useState(false);

  const [profileType, setProfileType] = useState<'travel' | 'networking' | 'dating' | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<GenericPost | null>(null);
  const [singlePostVisible, setSinglePostVisible] = useState(false);
  const [newPostData, setNewPostData] = useState<{
    images: string[];
    caption: string;
    location: string;
  } | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const [optimisticLikeCounts, setOptimisticLikeCounts] = useState<Map<number, number>>(new Map());
  const [swipingProfile, setSwipingProfile] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const { loading, send } = useApiRequest<ApiResponse>();

  // Use the posts hook for real API data
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
    profileType: profileType ? profileType.toUpperCase() : undefined
  });

  // Use the posts hook for networking posts specifically
  const {
    posts: networkingPosts,
    loading: networkingPostsLoading,
    error: networkingPostsError,
    hasMore: networkingHasMore,
    loadMore: networkingLoadMore,
    refresh: networkingRefresh,
    searchPosts: networkingSearchPosts
  } = usePosts({
    initialPage: 1,
    pageSize: 10,
    autoLoad: true,
    profileType: 'NETWORKING'
  });

  // Use the dating matches hook for API data
  const {
    matches: apiDatingMatches,
    loading: datingLoading,
    error: datingError,
    refresh: refreshDating
  } = useDatingMatches({
    autoLoad: true
  });

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

  // On mount and on focus, read profileType from local storage
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        console.log('Home screen focused'); // Debug log
        const storedType = await LocalStorage.getItem<'travel' | 'networking' | 'dating'>(localStore.profileType);
        console.log('Retrieved profileType from storage:', storedType); // Debug log
        if (storedType) {
          setProfileType(storedType);
          console.log('Set profileType state to:', storedType); // Debug log
        } else {
          // If no profile type is stored, try to fetch user profile to determine it
          console.log('No profile type stored, attempting to fetch user profile...');
          try {
            const me: any = await send("get", "/users/me");
            if (me) {
              const apiProfileType: string | undefined = me.profileType;
              const apiProfileTypes: string[] | undefined = me.profileTypes;
              
              // Use the same logic as login screen
              let localProfileType = mapApiProfileTypeToLocal(apiProfileType);
              if (!localProfileType) {
                localProfileType = pickPreferredProfileType(apiProfileTypes);
              }
              
              // If still no profile type found, check if user has dating-related fields
              if (!localProfileType) {
                if (me.interestedIn || me.gender) {
                  console.log("User has dating fields, defaulting to dating profile type");
                  localProfileType = 'dating';
                } else {
                  console.log("No profile type indicators found, defaulting to travel");
                  localProfileType = 'travel';
                }
              }
              
              if (localProfileType) {
                await LocalStorage.setItem(localStore.profileType, localProfileType);
                setProfileType(localProfileType);
                console.log('Set profileType state to (from API):', localProfileType);
              }
            }
          } catch (error) {
            console.warn('Failed to fetch user profile for profile type:', error);
            // Default to travel if we can't determine the profile type
            setProfileType('travel');
            console.log('Defaulted to travel profile type');
          }
        }
        // Get the final profile type (either from storage or determined from API)
        const finalProfileType = storedType || profileType;
        setShowDating(finalProfileType === 'dating');
        console.log('Set showDating to:', finalProfileType === 'dating'); // Debug log
        
        // Update dating profiles with API data
        if (finalProfileType === 'dating' && apiDatingMatches.length > 0) {
          setDatingProfiles(apiDatingMatches);
        }
        
        // Check for new post data from local storage
        const newPost = await LocalStorage.getItem('newPost');
        console.log('Checking for new post data:', newPost); // Debug log
        if (newPost && typeof newPost === 'object' && 'images' in newPost && 'caption' in newPost && 'location' in newPost) {
          console.log('Found new post data, adding to feed'); // Debug log
          addNewPost(newPost as { images: string[]; caption: string; location: string });
          await LocalStorage.removeItem('newPost'); // Clear the data
        }
        
        // TODO: Load user's liked posts if there's an API endpoint
        // This would help initialize the likedPosts state
        // Example: GET /user/liked-posts to get list of post IDs user has liked
        
        // Load user's liked posts
        loadUserLikedPosts();
      })();
    }, [apiDatingMatches, loadUserLikedPosts])
  );

  // Handle 401 errors by checking if user is still authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        
        if (!isAuthenticated && (postsError || datingError)) {
          // User is not authenticated and there are errors, likely due to 401
          console.log('User not authenticated, redirecting to login...');
          router.push('/getStarted/login');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    if (postsError || datingError) {
      checkAuth();
    }
  }, [postsError, datingError, router]);

  // Prevent infinite loading states by adding a timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (postsLoading || datingLoading || networkingPostsLoading) {
      // Set a timeout to prevent infinite loading (10 seconds)
      timeoutId = setTimeout(() => {
        console.log('Loading timeout reached, checking auth status...');
        checkAuthStatus().then(isAuthenticated => {
          if (!isAuthenticated) {
            console.log('User not authenticated after timeout, redirecting to login...');
            router.push('/getStarted/login');
          }
        });
      }, 10000); // 10 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [postsLoading, datingLoading, networkingPostsLoading, router]);

  // Prevent back navigation to profile completion screens
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Prevent back navigation from home screen to profile completion
        return true;
      };

      // Handle Android back button
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription?.remove();
    }, [])
  );

  // Additional iOS back gesture prevention for home screen
  useEffect(() => {
    // Disable iOS back gesture for home screen
    navigation.setOptions({
      gestureEnabled: false,
    });

    // Prevent navigation back to profile completion screens
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent any back navigation from home screen
      e.preventDefault();
    });

    return () => {
      unsubscribe();
      // Re-enable gestures when component unmounts (though this shouldn't happen for home screen)
      navigation.setOptions({
        gestureEnabled: true,
      });
    };
  }, [navigation]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
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
          // Use the optimistic count if it exists, otherwise use the API count
          const currentCount = prev.get(postId) ?? currentPost.likeCount;
          const newCount = wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;
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
        const currentPost = apiPosts.find(post => post.id === postId);
        if (currentPost) {
          // Revert to the original API count
          newMap.set(postId, currentPost.likeCount);
        } else {
          newMap.delete(postId);
        }
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

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    const currentProfile = datingProfiles[currentProfileIndex];
    if (!currentProfile) return;
    
    // Prevent multiple swipes on the same profile
    if (swipingProfile === currentProfile.id) return;
    
    console.log(`Swiped ${direction} on ${currentProfile?.firstName} ${currentProfile?.middleName}`);
    
    // Set loading state
    setSwipingProfile(currentProfile.id);
    
    // Move to next profile immediately for better UX (optimistic update)
    const nextIndex = currentProfileIndex + 1;
    setCurrentProfileIndex(nextIndex);
    
    try {
      // Map direction to swipe type
      const swipeType = direction === 'left' ? 'dislike' : direction === 'right' ? 'like' : 'bookmark';
      
      console.log('=== SWIPE API CALL ===');
      console.log('Profile ID:', currentProfile.id);
      console.log('Swipe Type:', swipeType);
      console.log('Direction:', direction);
      
      // Make API call for swipe in the background
      const result = await send('post', '/matches/swipes', {
          swipedId: currentProfile.id,
          swipeType: swipeType,
      });

      console.log("=== SWIPE API RESULT ===", result);
      
      // Handle match or payment requirements if needed
      if (result?.paymentRequired) {
        console.log('Payment required for this swipe');
        // Revert the profile index if payment is required
        setCurrentProfileIndex(currentProfileIndex);
        router.push({
          pathname: "/payment",
          params: { user: JSON.stringify(currentProfile) },
        });
        return;
      }

      if (result?.matched) {
        console.log('Match found!', result);
        router.push({
          pathname: "/match",
          params: { user: JSON.stringify(currentProfile) },
        });
      } else {
        console.log('No match, continuing to next profile');
      }
    } catch (error) {
      console.error('❌ Error making swipe:', error);
      // Revert the profile index on error
      setCurrentProfileIndex(currentProfileIndex);
      
      // Show error message to user
      Alert.alert(
        'Swipe Error',
        'Failed to record your swipe. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      // Clear loading state
      setSwipingProfile(null);
    }
  };

  const handleActionButton = (action: 'dislike' | 'like' | 'bookmark') => {
    const currentProfile = datingProfiles[currentProfileIndex];
    if (!currentProfile || swipingProfile === currentProfile.id) return;
    
    const direction = action === 'dislike' ? 'left' : action === 'like' ? 'right' : 'up';
    // Call handleSwipe immediately for instant feedback
    handleSwipe(direction);
  };

  const handleViewProfile = (userId: number) => {
    setSelectedUserId(userId);
    setProfileModalVisible(true);
  };

  const handleCloseProfile = () => {
    setProfileModalVisible(false);
    setSelectedUserId(null);
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

  const addNewPost = (postData: { images: string[]; caption: string; location: string }) => {
    // Note: This function now only logs since we're using API posts
    // In a real implementation, you would make an API call to create a new post
    console.log('Adding new post:', postData);
    // Refresh posts to get the latest data
    refresh();
  };

  const renderPostCard = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4]}
      onPress={() => {
        console.log('Post tapped:', item.id);
        // Convert API Post to GenericPost format
        const genericPost: GenericPost = {
          id: item.id,
          user: {
            name: `${item.user.firstname} ${item.user.lastname}`,
            avatar: "", // Not used anymore, we use initials instead
            userId: item.user.id // Add userId for profile viewing
          },
          timestamp: getTimeAgo(item.createdAt),
          location: "", // API doesn't provide location
          caption: item.content,
          images: item.attachments.length > 0 ? item.attachments.map(att => att.mediaUrl) : [],
          likes: item.likeCount,
          comments: 0, // API doesn't provide comment count
          shares: 0, // API doesn't provide share count
          isBookmarked: false, // API doesn't provide bookmark status
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
            <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{`${item.user.firstname} ${item.user.lastname}`}</Text>
            <Text style={[tw.textGray500, tw.textSm]}>{getTimeAgo(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
          <Ionicons
            name="bookmark-outline"
            size={24}
            color="#6b7280"
          />
        </TouchableOpacity>
      </View>
      
      {/* Content/Caption - Always show above media */}
      {item.content && (
        <View style={[tw.pX4, tw.pB3]}>
          <Text style={[tw.textGray800, tw.textBase]} numberOfLines={3}>
            {renderCaptionWithHashtags(item.content)}
          </Text>
        </View>
      )}
      
      {/* Main Image or Grid for Travel */}
      {profileType === 'travel' ? (
        <View style={[tw.pX4, tw.pB2]}> 
          {item.attachments && item.attachments.length === 1 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedImage(item.attachments[0].mediaUrl);
                setImageModalVisible(true);
              }}
            >
              <ImageWithFallback
                source={{ uri: item.attachments[0].mediaUrl }}
                style={[tw.wFull, { height: 240 }, tw.roundedLg]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {item.attachments && item.attachments.length === 2 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {item.attachments.map((attachment, idx) => (
                <TouchableOpacity
                  key={attachment.id}
                  style={{ flex: 1 }}
                  onPress={() => {
                    setSelectedImage(attachment.mediaUrl);
                    setImageModalVisible(true);
                  }}
                >
                  <ImageWithFallback
                    source={{ uri: attachment.mediaUrl }}
                    style={[{ width: '100%', height: 180, borderRadius: 12 }]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {item.attachments && item.attachments.length >= 3 && (
            <View style={{ flexDirection: 'row', gap: 8, height: 200 }}>
              <TouchableOpacity
                style={{ flex: 2, marginRight: 4 }}
                onPress={() => {
                  setSelectedImage(item.attachments[0].mediaUrl);
                  setImageModalVisible(true);
                }}
              >
                <ImageWithFallback
                  source={{ uri: item.attachments[0].mediaUrl }}
                  style={[{ width: '100%', height: '100%', borderRadius: 12, flex: 1 }]} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                {[item.attachments[1], item.attachments[2]].map((attachment, idx) => (
                  <TouchableOpacity
                    key={attachment.id}
                    style={{ flex: 1, marginBottom: idx === 0 ? 4 : 0 }}
                    onPress={() => {
                      setSelectedImage(attachment.mediaUrl);
                      setImageModalVisible(true);
                    }}
                  >
                    <ImageWithFallback
                      source={{ uri: attachment.mediaUrl }}
                      style={[{ width: '100%', height: '100%', borderRadius: 12, flex: 1 }]} 
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={[tw.pX4, tw.pB2]}>
          <ImageWithFallback
            source={{ uri: item.attachments && item.attachments.length > 0 ? item.attachments[0].mediaUrl : "https://picsum.photos/400/300?random=1" }}
            style={[tw.wFull, { height: 240 }, tw.roundedLg]}
            resizeMode="cover"
          />
        </View>
      )}
      {/* Engagement Metrics */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pX4, tw.pB4]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <TouchableOpacity 
            style={[tw.flexRow, tw.itemsCenter, tw.mR6]}
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
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>
              {formatNumber(optimisticLikeCounts.get(item.id) ?? item.likeCount)}
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
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(0)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter]}>
            <Ionicons name="arrow-redo-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(0)}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setImageModalVisible(false)}
        >
          {selectedImage && (
            <ImageWithFallback
              source={{ uri: selectedImage }}
              style={{ width: '90%', height: '60%', borderRadius: 16 }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );

  const renderDatingInterface = () => {
    const visibleProfiles = datingProfiles.slice(currentProfileIndex, currentProfileIndex + 2);
    
    // Show skeleton while loading (but not if there's an error)
    if (datingLoading && !datingError) {
      return (
        <View style={[tw.flex1, tw.relative, { paddingBottom: 120 }]}>
          <View style={[tw.flex1, tw.justifyCenter, tw.pT4]}>
            {[1, 2].map((index) => (
              <DatingMatchSkeleton key={index} />
            ))}
          </View>
        </View>
      );
    }

    // Show error state if there's an error
    if (datingError) {
      return (
        <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
          <Ionicons name="alert-circle-outline" size={80} color="#ef4444" />
          <Text style={[tw.textRed500, tw.textXl, tw.fontBold, tw.mT4, tw.textCenter]}>
            Failed to load matches
          </Text>
          <Text style={[tw.textGray500, tw.textBase, tw.mT2, tw.textCenter]}>
            {datingError}
          </Text>
          <TouchableOpacity
            style={[tw.bgRed500, tw.roundedFull, tw.pX6, tw.pY3, tw.mT6]}
            onPress={refreshDating}
          >
            <Text style={[tw.textWhite, tw.fontBold]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (currentProfileIndex >= datingProfiles.length) {
      console.log('No more profiles', datingProfiles);
      return (
        <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
          <Ionicons name="heart-outline" size={80} color="#fb6c31" />
          <Text style={[tw.textGray900, tw.textXl, tw.fontBold, tw.mT4, tw.textCenter]}>
            No more profiles
          </Text>
          <Text style={[tw.textGray600, tw.textBase, tw.mT2, tw.textCenter]}>
            Check back later for new matches!
          </Text>
          <TouchableOpacity
            style={[tw.bgPink700, tw.roundedFull, tw.pX6, tw.pY3, tw.mT6]}
            onPress={() => {
              setCurrentProfileIndex(0);
              refreshDating();
            }}
          >
            <Text style={[tw.textWhite, tw.fontBold]}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[tw.flex1, tw.relative, { paddingBottom: 120 }]}>
        {/* Cards Stack */}
        <View style={[tw.flex1, tw.justifyCenter, tw.pT4]}>
          {visibleProfiles.reverse().map((profile, index) => (
            <DatingCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              onViewProfile={handleViewProfile}
              isTopCard={index === visibleProfiles.length - 1}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={[tw.bottom0, tw.left0, tw.right0, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.pB6, tw.pT4, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <TouchableOpacity
            style={[
              tw.bgRed500, 
              tw.roundedFull, 
              tw.w16, 
              tw.h16, 
              tw.justifyCenter, 
              tw.itemsCenter, 
              tw.mR6, 
              tw.shadowLg,
              swipingProfile ? { opacity: 0.5 } : {}
            ]}
            onPress={() => handleActionButton('dislike')}
            disabled={!!swipingProfile}
          >
            {swipingProfile ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="close" size={32} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              tw.bgBlue500, 
              tw.roundedFull, 
              tw.w16, 
              tw.h16, 
              tw.justifyCenter, 
              tw.itemsCenter, 
              tw.mR6, 
              tw.shadowLg,
              swipingProfile ? { opacity: 0.5 } : {}
            ]}
            onPress={() => handleActionButton('bookmark')}
            disabled={!!swipingProfile}
          >
            {swipingProfile ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="star" size={28} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              tw.bgGreen500, 
              tw.roundedFull, 
              tw.w16, 
              tw.h16, 
              tw.justifyCenter, 
              tw.itemsCenter, 
              tw.shadowLg,
              swipingProfile ? { opacity: 0.5 } : {}
            ]}
            onPress={() => handleActionButton('like')}
            disabled={!!swipingProfile}
          >
            {swipingProfile ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="heart" size={32} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Search functionality based on profile type
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        posts: apiPosts,
        datingProfiles: datingProfiles,
        networkingProfiles: [],
        networkingPosts: networkingPosts
      };
    }

    const query = searchQuery.toLowerCase();

    if (profileType === 'travel') {
      const filteredPosts = apiPosts.filter(post =>
        post.user.firstname.toLowerCase().includes(query) ||
        post.user.lastname.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.content.split(' ').some(word => word.startsWith('#') && word.toLowerCase().includes(query))
      );
      return { posts: filteredPosts, datingProfiles: [], networkingProfiles: [], networkingPosts: [] };
    }

    if (profileType === 'networking') {
      // Since we don't have real networking profiles API yet, return empty array
      const filteredNetworkingProfiles: any[] = [];

      const filteredNetworkingPosts = networkingPosts.filter(post =>
        post.user.firstname.toLowerCase().includes(query) ||
        post.user.lastname.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.content.split(' ').some(word => word.startsWith('#') && word.toLowerCase().includes(query))
      );

      return { 
        posts: [], 
        datingProfiles: [], 
        networkingProfiles: filteredNetworkingProfiles, 
        networkingPosts: filteredNetworkingPosts 
      };
    }

    if (profileType === 'dating') {
      const filteredDatingProfiles = datingProfiles.filter(profile =>
        profile.firstName.toLowerCase().includes(query) ||
        profile.middleName.toLowerCase().includes(query) ||
        profile.gender.toLowerCase().includes(query)
      );
      return { posts: [], datingProfiles: filteredDatingProfiles, networkingProfiles: [], networkingPosts: [] };
    }

    // Default: search across all content
    const filteredPosts = apiPosts.filter(post =>
      post.user.firstname.toLowerCase().includes(query) ||
      post.user.lastname.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );

    const filteredDatingProfiles = datingProfiles.filter(profile =>
      profile.firstName.toLowerCase().includes(query) ||
      profile.middleName.toLowerCase().includes(query) ||
      profile.gender.toLowerCase().includes(query)
    );

    return { 
      posts: filteredPosts, 
      datingProfiles: filteredDatingProfiles, 
      networkingProfiles: [], 
      networkingPosts: [] 
    };
  }, [searchQuery, profileType, apiPosts, datingProfiles]);

  const getSearchPlaceholder = () => {
    switch (profileType) {
      case 'travel':
        return "Search posts, places, hashtags...";
      case 'networking':
        return "Search people, companies, skills...";
      case 'dating':
        return "Search profiles, interests...";
      default:
        return "Search for people, places, posts...";
    }
  };

  const getSearchIcon = () => {
    if (searchQuery.trim()) {
      return "close-circle";
    }
    return "search";
  };

  const handleSearchIconPress = () => {
    if (searchQuery.trim()) {
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (text.trim()) {
      setShowSearchResults(true);
      // Trigger search with debounce
      const timeoutId = setTimeout(() => {
        if (profileType === 'networking') {
          networkingSearchPosts(text.trim());
        } else {
          searchPosts(text.trim());
        }
      }, 500);
      setSearchTimeout(timeoutId);
    } else {
      setShowSearchResults(false);
      // Reset to normal posts when search is cleared
      if (profileType === 'networking') {
        networkingRefresh();
      } else {
        refresh();
      }
    }
  };

  const handleTouchOutside = () => {
    if (showSearchResults) {
      setShowSearchResults(false);
    }
  };

  const renderSearchResults = () => {
    if (!showSearchResults || !searchQuery.trim()) return null;

    const { posts, datingProfiles, networkingProfiles, networkingPosts } = filteredContent;
    const totalResults = posts.length + datingProfiles.length + networkingProfiles.length + networkingPosts.length;
    
    console.log('Search results debug:', {
      showSearchResults,
      searchQuery: searchQuery.trim(),
      totalResults,
      postsLength: posts.length,
      profileType
    });

    // Show skeleton while loading (but not if there are errors)
    if ((postsLoading || (profileType === 'networking' && networkingPostsLoading)) && 
        !postsError && !networkingPostsError) {
      return (
        <View style={[tw.bgWhite, tw.roundedLg, tw.mX4, tw.shadow, { zIndex: 1000, position: 'absolute', top: 80, left: 0, right: 0 }]}>
          <View style={[tw.p4, tw.borderB, tw.borderGray200]}>
            <View style={[tw.w32, tw.h4, tw.bgGray200, tw.rounded]} />
          </View>
          <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
            {[1, 2, 3].map((index) => (
              <SearchResultSkeleton key={index} />
            ))}
          </ScrollView>
        </View>
      );
    }

    // Show error state if there are errors
    if (postsError || networkingPostsError) {
      return (
        <View style={[tw.bgWhite, tw.roundedLg, tw.mX4, tw.p6, tw.shadow, { zIndex: 1000, position: 'absolute', top: 80, left: 0, right: 0 }]}>
          <View style={[tw.itemsCenter, tw.pY4]}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={[tw.textRed500, tw.textLg, tw.fontMedium, tw.mT2, tw.textCenter]}>
              Failed to load search results
            </Text>
            <Text style={[tw.textGray500, tw.textSm, tw.mT1, tw.textCenter]}>
              {postsError || networkingPostsError}
            </Text>
            <TouchableOpacity 
              style={[tw.bgRed500, tw.pX4, tw.pY2, tw.roundedLg, tw.mT4]}
              onPress={() => {
                if (profileType === 'networking') {
                  networkingRefresh();
                } else {
                  refresh();
                }
              }}
            >
              <Text style={[tw.textWhite, tw.fontMedium]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (totalResults === 0) {
      return (
        <View style={[tw.bgWhite, tw.roundedLg, tw.mX4, tw.p6, tw.shadow, { zIndex: 1000, position: 'absolute', top: 80, left: 0, right: 0 }]}>
          <View style={[tw.itemsCenter, tw.pY4]}>
            <Ionicons name="search-outline" size={48} color="#9ca3af" />
            <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT2]}>No results found</Text>
            <Text style={[tw.textGray400, tw.textSm, tw.mT1, tw.textCenter]}>
              Try adjusting your search terms
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[tw.bgWhite, tw.roundedLg, tw.mX4, tw.shadow, { maxHeight: 400, zIndex: 1000, position: 'absolute', top: 80, left: 0, right: 0 }]}>
        <View style={[tw.p4, tw.borderB, tw.borderGray200]}>
          <Text style={[tw.textGray600, tw.fontMedium]}>
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
          </Text>
        </View>
        
        <ScrollView 
          style={{ maxHeight: 350 }} 
          showsVerticalScrollIndicator={false}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (layoutMeasurement.height + contentOffset.y >= 
                contentSize.height - paddingToBottom) {
              if (profileType === 'networking') {
                if (networkingHasMore && !networkingPostsLoading) {
                  networkingLoadMore();
                }
              } else {
                if (hasMore && !postsLoading) {
                  loadMore();
                }
              }
            }
          }}
          scrollEventThrottle={400}
          refreshControl={
            <RefreshControl
              refreshing={profileType === 'networking' ? networkingPostsLoading : postsLoading}
              onRefresh={profileType === 'networking' ? networkingRefresh : refresh}
              colors={["#fb6c31"]}
              tintColor="#fb6c31"
            />
          }
        >
          {/* Travel Posts */}
          {profileType === 'travel' && posts.map(post => (
            <TouchableOpacity
              key={`post-${post.id}`}
              style={[tw.p4, tw.borderB, tw.borderGray100]}
              onPress={() => {
                console.log('Viewing profile:', post.user);
                // Convert API Post to GenericPost format
                const genericPost: GenericPost = {
                  id: post.id,
                  user: {
                    name: `${post.user.firstname} ${post.user.lastname}`,
                    avatar: "", // Not used anymore, we use initials instead
                    userId: post.user.id // Add userId for profile viewing
                  },
                  timestamp: getTimeAgo(post.createdAt),
                  location: "",
                  caption: post.content,
                  images: post.attachments.length > 0 ? post.attachments.map(att => att.mediaUrl) : [],
                  likes: post.likeCount,
                  comments: 0,
                  shares: 0,
                  isBookmarked: false,
                };
                setSelectedPost(genericPost);
                setSinglePostVisible(true);
                setShowSearchResults(false);
              }}
            >
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <TouchableOpacity 
                  style={[tw.flexRow, tw.itemsCenter, tw.flex1]}
                  onPress={(e) => {
                    e.stopPropagation();
                    
                    handleViewProfile(post.user.id);
                    setShowSearchResults(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
                    <Text style={[tw.textGray700, tw.fontBold, tw.textSm]}>
                      {getUserInitials(post.user.firstname, post.user.lastname)}
                    </Text>
                  </View>
                  <View style={[tw.flex1]}>
                    <Text style={[tw.textGray900, tw.fontMedium]}>{`${post.user.firstname} ${post.user.lastname}`}</Text>
                    <Text style={[tw.textGray500, tw.textSm]} numberOfLines={2}>{post.content}</Text>
                    <Text style={[tw.textGray400, tw.textXs]}>{getTimeAgo(post.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}

          {/* Networking Posts */}
          {profileType === 'networking' && networkingPosts.map(post => (
            <TouchableOpacity
              key={`networking-post-${post.id}`}
              style={[tw.p4, tw.borderB, tw.borderGray100]}
              onPress={() => {
                // Convert API Post to GenericPost format
                const genericPost: GenericPost = {
                  id: post.id,
                  user: {
                    name: `${post.user.firstname} ${post.user.lastname}`,
                    avatar: "", // Not used anymore, we use initials instead
                    userId: post.user.id // Add userId for profile viewing
                  },
                  timestamp: getTimeAgo(post.createdAt),
                  location: "",
                  caption: post.content,
                  images: post.attachments.length > 0 ? post.attachments.map(att => att.mediaUrl) : [],
                  likes: post.likeCount,
                  comments: 0,
                  shares: 0,
                  isBookmarked: false,
                };
                setSelectedPost(genericPost);
                setSinglePostVisible(true);
                setShowSearchResults(false);
              }}
            >
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <TouchableOpacity 
                  style={[tw.flexRow, tw.itemsCenter, tw.flex1]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleViewProfile(post.user.id);
                    setShowSearchResults(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
                    <Text style={[tw.textGray700, tw.fontBold, tw.textSm]}>
                      {getUserInitials(post.user.firstname, post.user.lastname)}
                    </Text>
                  </View>
                  <View style={[tw.flex1]}>
                    <Text style={[tw.textGray900, tw.fontMedium]}>{`${post.user.firstname} ${post.user.lastname}`}</Text>
                    <Text style={[tw.textGray500, tw.textSm]} numberOfLines={2}>{post.content}</Text>
                    <Text style={[tw.textGray400, tw.textXs]}>{getTimeAgo(post.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}

          {/* Networking Profiles */}
          {profileType === 'networking' && networkingProfiles.map(profile => (
            <TouchableOpacity
              key={`networking-${profile.id}`}
              style={[tw.p4, tw.borderB, tw.borderGray100]}
              onPress={() => {
                setShowSearchResults(false);
                // Navigate to networking search or profile view
                router.push('/networking/search');
              }}
            >
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <ImageWithFallback source={{ uri: profile.photo }} style={[tw.w10, tw.h10, tw.rounded, tw.mR3]} />
                <View style={[tw.flex1]}>
                  <Text style={[tw.textGray900, tw.fontMedium]}>{profile.name}</Text>
                  <Text style={[tw.textGray500, tw.textSm]} numberOfLines={1}>{profile.headline}</Text>
                  <Text style={[tw.textGray400, tw.textXs]}>{profile.industries.join(', ')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}

          {/* Dating Profiles */}
          {profileType === 'dating' && datingProfiles.map(profile => (
            <TouchableOpacity
              key={`dating-${profile.id}`}
              style={[tw.p4, tw.borderB, tw.borderGray100]}
              onPress={() => {
                setShowSearchResults(false);
                // Could navigate to dating profile view
              }}
            >
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <ImageWithFallback 
                  source={profile.mediaList && profile.mediaList.length > 0 
                    ? { uri: profile.mediaList[0].mediaUrl }
                    : null
                  } 
                  fallbackSource={require('../../assets/images/default_avatar.jpg')}
                  style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3]} 
                />
                <View style={[tw.flex1]}>
                  <Text style={[tw.textWhite, tw.fontMedium]}>{profile.firstName} {profile.middleName}, {profile.age}</Text>
                  <Text style={[tw.textGray500, tw.textSm]} numberOfLines={2}>{profile.gender}</Text>
                  <Text style={[tw.textGray400, tw.textXs]}>{profile.distance}km away</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Loading indicator for search results */}
          {((profileType === 'networking' && networkingHasMore && networkingPostsLoading) || 
            (profileType !== 'networking' && hasMore && postsLoading)) && (
            <View style={[tw.pY4, tw.itemsCenter]}>
              <ActivityIndicator size="small" color="#fb6c31" />
              <Text style={[tw.textGray500, tw.textSm, tw.mT2]}>Loading more results...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const unreadNotificationsCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={[tw.flex1, tw.bgGray100]}>
      {/* Top Navigation with Logo and Search */}
      <View style={[tw.pX4, tw.pT2, tw.pB4]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
          {/* Logo and Profile Type Indicator */}
          <View style={[tw.flexRow, tw.itemsCenter, tw.mR3]}>
            <Image
              source={require("../../assets/images/afroma_logo.png")}
              style={[tw.w8, tw.h8]}
              resizeMode="contain"
            />
            {/* Profile Type Badge */}
            {profileType && (
              <TouchableOpacity 
                style={[
                  tw.mL2, 
                  tw.pX2, 
                  tw.pY1, 
                  tw.roundedFull,
                  tw.flexRow,
                  tw.itemsCenter,
                  profileType === 'dating' ? tw.bgPink100 : 
                  profileType === 'networking' ? tw.bgBlue100 : 
                  tw.bgGreen100
                ]}
                onPress={() => router.push('/profile')}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={
                    profileType === 'dating' ? 'heart' : 
                    profileType === 'networking' ? 'people' : 
                    'airplane'
                  } 
                  size={12} 
                  color={
                    profileType === 'dating' ? '#ec4899' : 
                    profileType === 'networking' ? '#3b82f6' : 
                    '#10b981'
                  } 
                />
                {/* <Text style={[
                  tw.mL1, 
                  tw.textXs, 
                  tw.fontMedium,
                  profileType === 'dating' ? tw.textPink700 : 
                  profileType === 'networking' ? tw.textBlue700 : 
                  tw.textGreen700
                ]}>
                  {profileType === 'dating' ? 'Dating' : 
                   profileType === 'networking' ? 'Networking' : 
                   'Travel'}
                </Text> */}
                <Ionicons 
                  name="chevron-down" 
                  size={10} 
                  color={
                    profileType === 'dating' ? '#ec4899' : 
                    profileType === 'networking' ? '#3b82f6' : 
                    '#10b981'
                  } 
                  style={[tw.mL1]}
                />
              </TouchableOpacity>
            )}
          </View>
          {/* Search Bar */}
          <View style={[
            tw.flex1, 
            tw.flexRow, 
            tw.itemsCenter, 
            tw.bgWhite, 
            tw.roundedFull, 
            tw.pX4, 
            tw.pY3, 
            tw.shadow,
            tw.border,
            tw.borderGray300,
            searchQuery.trim() && { borderColor: '#fb6c31', borderWidth: 2 }
          ]}>
            <TextInput
              style={[tw.flex1, tw.textBase, tw.textGray700]}
              placeholder={getSearchPlaceholder()}
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            <TouchableOpacity onPress={handleSearchIconPress}>
              <Ionicons 
                name={getSearchIcon()} 
                size={20} 
                color={searchQuery.trim() ? "#fb6c31" : "#6b7280"} 
              />
            </TouchableOpacity>
          </View>
          {/* Notification Button */}
          {/* <View style={[tw.mL3]}>
            <NotificationBadge
              count={unreadNotificationsCount}
              onPress={() => router.push('/notifications')}
              size="medium"
            />
          </View> */}
        </View>
        
        {/* Search Results */}
        {renderSearchResults()}
      </View>

      {/* Backdrop for search results */}
      {showSearchResults && (
        <TouchableOpacity
          style={[
            tw.absolute,
            tw.top0,
            tw.left0,
            tw.right0,
            tw.bottom0,
            { backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1 }
          ]}
          activeOpacity={1}
          onPress={handleTouchOutside}
        />
      )}

      {/* Filter Tabs */}
      {/* <View style={[tw.pX4, tw.pB4]}>
        <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB3]}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTER_TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(index)}
              style={[
                tw.pX4,
                tw.pY2,
                tw.roundedFull,
                tw.mR3,
                tw.border,
                activeTab === index ? tw.bgGray900 : tw.bgWhite,
                activeTab === index ? tw.borderGray900 : tw.borderGray300,
              ]}
            >
              <Text
                style={[
                  tw.textSm,
                  tw.fontMedium,
                  activeTab === index ? tw.textWhite : tw.textGray700,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View> */}
      {/* Content */}
      {showDating ? (
        renderDatingInterface()
      ) : profileType === 'networking' ? (
        <Networking 
          filteredProfiles={filteredContent.networkingProfiles}
        />
      ) : postsLoading && filteredContent.posts.length === 0 && !postsError ? (
        <View style={[tw.flex1]}>
          {[1, 2, 3].map((index) => (
            <PostSkeleton key={index} />
          ))}
        </View>
      ) : postsError ? (
        <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.pX4]}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[tw.textRed500, tw.textLg, tw.fontMedium, tw.mT2, tw.textCenter]}>
            Failed to load posts
          </Text>
          <Text style={[tw.textGray500, tw.textSm, tw.mT1, tw.textCenter]}>
            {postsError}
          </Text>
          <TouchableOpacity 
            style={[tw.bgRed500, tw.pX4, tw.pY2, tw.roundedLg, tw.mT4]}
            onPress={refresh}
          >
            <Text style={[tw.textWhite, tw.fontMedium]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredContent.posts}
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
        onLike={(postId) => {
          toggleBookmark(postId);
        }}
        onComment={(postId) => {
          console.log('Comment on post:', postId);
        }}
        onShare={(postId) => {
          console.log('Share post:', postId);
        }}
        onViewProfile={handleViewProfile}
        profileType={profileType || 'travel'}
      />

      {/* User Profile View */}
      <UserProfileView
        visible={profileModalVisible}
        onClose={handleCloseProfile}
        userId={selectedUserId || 0}
      />

      {/* Floating Action Button */}
      {(profileType === 'travel' || profileType === 'networking') && (
        <TouchableOpacity
          style={[
            tw.absolute,
            { bottom: 72, right: 24 },
            tw.bgPink700,
            tw.roundedFull,
            tw.w12,
            tw.h12,
            tw.justifyCenter,
            tw.itemsCenter,
            tw.shadow,
            { elevation: 8 }
          ]}
          onPress={() => {
            setNewPostData(null);
            router.push(`/posts/create?profileType=${profileType}`);
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
