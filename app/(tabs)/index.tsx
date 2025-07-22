import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, PanResponder, Animated, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import { useRouter, useFocusEffect } from "expo-router";
import LocalStorage from "@/utils/storage";
import localStore from "@/utils/localValues";
import Networking from "@/components/Networking";
import SinglePostView, { GenericPost } from "@/components/SinglePostView";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Mock data for dating profiles
const MOCK_DATING_PROFILES = [
  {
    id: 1,
    name: "Emma Gasana",
    age: 28,
    bio: "Adventure seeker, coffee lover, and travel enthusiast. Looking for someone to explore the world with!",
    images: [
      "https://randomuser.me/api/portraits/women/6.jpg",
      "https://randomuser.me/api/portraits/women/7.jpg",
      "https://randomuser.me/api/portraits/women/8.jpg"
    ],
    distance: "2 miles away",
    interests: ["Travel", "Photography", "Hiking", "Coffee"],
    verified: true,
  },
  {
    id: 2,
    name: "Marcus Keshua",
    age: 32,
    bio: "Fitness enthusiast and chef. Love cooking new recipes and staying active. Let's grab a healthy meal together!",
    images: [
      "https://randomuser.me/api/portraits/men/7.jpg",
      "https://randomuser.me/api/portraits/men/8.jpg",
      "https://randomuser.me/api/portraits/men/9.jpg"
    ],
    distance: "5 miles away",
    interests: ["Fitness", "Cooking", "Music", "Reading"],
    verified: false,
  },
  {
    id: 3,
    name: "Sofia Jayjay",
    age: 26,
    bio: "Artist and yoga instructor. Finding beauty in everyday moments. Love deep conversations and weekend getaways.",
    images: [
      "https://randomuser.me/api/portraits/women/9.jpg",
      "https://randomuser.me/api/portraits/women/10.jpg",
      "https://randomuser.me/api/portraits/women/11.jpg"
    ],
    distance: "1 mile away",
    interests: ["Art", "Yoga", "Meditation", "Nature"],
    verified: true,
  },
  {
    id: 4,
    name: "James Mthongozi",
    age: 30,
    bio: "Tech entrepreneur with a passion for innovation. When I'm not coding, you'll find me rock climbing or playing guitar.",
    images: [
      "https://randomuser.me/api/portraits/men/10.jpg",
      "https://randomuser.me/api/portraits/men/11.jpg",
      "https://randomuser.me/api/portraits/men/12.jpg"
    ],
    distance: "3 miles away",
    interests: ["Technology", "Rock Climbing", "Music", "Startups"],
    verified: true,
  },
];

// Mock data for posts
const MOCK_POSTS = [
  {
    id: 1,
    user: { name: "Michelle Ogilvy", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
    timestamp: "1h ago",
    image: "https://picsum.photos/400/300?random=1",
    likes: 18600,
    comments: 4700,
    shares: 12400,
    isBookmarked: false,
    location: "Kigali, Rwanda",
    caption: "Exploring the beautiful landscapes of Rwanda! The mountains here are absolutely breathtaking. #TravelRwanda #Adventure",
    pictures: [
      "https://picsum.photos/400/300?random=1",
      "https://picsum.photos/400/300?random=11",
      "https://picsum.photos/400/300?random=21"
    ],
  },
  {
    id: 2,
    user: { name: "Brandon Loia", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
    timestamp: "1h ago",
    image: "https://picsum.photos/400/300?random=2",
    likes: 15200,
    comments: 3800,
    shares: 9600,
    isBookmarked: true,
    location: "Nairobi, Kenya",
    caption: "Just finished an amazing networking event in Nairobi! Met so many inspiring entrepreneurs. The tech scene here is incredible! #Networking #TechAfrica",
    pictures: [
      "https://picsum.photos/400/300?random=2",
      "https://picsum.photos/400/300?random=12"
    ],
  },
  {
    id: 3,
    user: { name: "Sarah Chen", avatar: "https://randomuser.me/api/portraits/women/3.jpg" },
    timestamp: "2h ago",
    image: "https://picsum.photos/400/300?random=3",
    likes: 22100,
    comments: 5200,
    shares: 14800,
    isBookmarked: false,
    location: "Cape Town, South Africa",
    caption: "Cape Town never disappoints! The views from Table Mountain are absolutely stunning. Perfect weather for hiking today! #CapeTown #Travel",
    pictures: [
      "https://picsum.photos/400/300?random=3"
    ],
  },
  {
    id: 4,
    user: { name: "David Martinez", avatar: "https://randomuser.me/api/portraits/men/4.jpg" },
    timestamp: "3h ago",
    image: "https://picsum.photos/400/300?random=4",
    likes: 8900,
    comments: 1200,
    shares: 3400,
    isBookmarked: false,
    location: "Accra, Ghana",
    caption: "Excited to be speaking at the African Tech Summit in Accra! Great discussions about the future of fintech in Africa. #TechSummit #Fintech #Ghana",
    pictures: [
      "https://picsum.photos/400/300?random=4",
      "https://picsum.photos/400/300?random=14",
      "https://picsum.photos/400/300?random=24",
      "https://picsum.photos/400/300?random=34"
    ],
  },
];

const FILTER_TABS = ["All", "People", "Posts", "Events", "Groups"];

// Dating Card Component
const DatingCard = ({ profile, onSwipe, isTopCard }: { 
  profile: typeof MOCK_DATING_PROFILES[0], 
  onSwipe: (direction: 'left' | 'right' | 'up') => void,
  isTopCard: boolean 
}) => {
  const pan = new Animated.ValueXY();
  const scale = new Animated.Value(1);
  const rotate = new Animated.Value(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: (_, gestureState) => {
      const rotation = gestureState.dx / screenWidth * 30;
      rotate.setValue(rotation);
      Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      })(_, gestureState);
    },
    onPanResponderRelease: (_, gestureState) => {
      pan.flattenOffset();
      const { dx, dy } = gestureState;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (absDy > 100 && dy < 0) {
        onSwipe('up');
        animateOffScreen(0, -screenHeight);
      } else if (absDx > 120) {
        if (dx > 0) {
          onSwipe('right');
          animateOffScreen(screenWidth, 0);
        } else {
          onSwipe('left');
          animateOffScreen(-screenWidth, 0);
        }
      } else {
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  const animateOffScreen = (x: number, y: number) => {
    Animated.parallel([
      Animated.timing(pan, {
        toValue: { x, y },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Use the first image only for consistency with post card
  const mainImage = profile.images[0];

  const rotateInterpolation = rotate.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
    <Animated.View
      style={[
        tw.bgWhite,
        tw.roundedLg,
        tw.mB4,
        tw.shadow,
        tw.mX4,
        { position: 'absolute', width: screenWidth - 32, height: screenHeight * 0.48, zIndex: isTopCard ? 2 : 1,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: rotateInterpolation },
            { scale: scale },
          ],
          opacity: !isTopCard ? 0.8 : 1,
        },
      ]}
      {...(isTopCard ? panResponder.panHandlers : {})}
    >
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.pB2]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <Image
            source={{ uri: mainImage }}
            style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3]}
          />
          <View>
            <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{profile.name}, {profile.age}</Text>
            <Text style={[tw.textGray500, tw.textSm]}>{profile.distance}</Text>
          </View>
        </View>
        {profile.verified && (
          <View style={[tw.bgGray900, tw.roundedFull, tw.p1]}>
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </View>

      {/* Main Image */}
      <View style={[tw.pX4, tw.pB2]}>
        <Image
          source={{ uri: mainImage }}
          style={[tw.wFull, { height: 240 }, tw.roundedLg]}
          resizeMode="cover"
        />
      </View>

      {/* Profile Info */}
      <View style={[tw.pX4, tw.pB4]}> 
        <Text style={[tw.textGray800, tw.mB2]} numberOfLines={2}>{profile.bio}</Text>
        <View style={[tw.flexRow, tw.flexWrap, tw.mB2]}>
          {profile.interests.slice(0, 3).map((interest, index) => (
            <View key={index} style={[tw.bgGray200, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
              <Text style={[tw.textGray700, tw.textXs]}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};



const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [datingProfiles, setDatingProfiles] = useState(MOCK_DATING_PROFILES);
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

  // On mount and on focus, read profileType from local storage
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        console.log('Home screen focused'); // Debug log
        const storedType = await LocalStorage.getItem<'travel' | 'networking' | 'dating'>(localStore.profileType);
        if (storedType) setProfileType(storedType);
        setShowDating(storedType === 'dating');
        
        // Check for new post data from local storage
        const newPost = await LocalStorage.getItem('newPost');
        console.log('Checking for new post data:', newPost); // Debug log
        if (newPost && typeof newPost === 'object' && 'images' in newPost && 'caption' in newPost && 'location' in newPost) {
          console.log('Found new post data, adding to feed'); // Debug log
          addNewPost(newPost as { images: string[]; caption: string; location: string });
          await LocalStorage.removeItem('newPost'); // Clear the data
        }
      })();
    }, [])
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const toggleBookmark = (postId: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    console.log(`Swiped ${direction} on ${datingProfiles[currentProfileIndex]?.name}`);
    
    // Move to next profile
    setTimeout(() => {
      setCurrentProfileIndex(prev => prev + 1);
    }, 300);
  };

  const handleActionButton = (action: 'dislike' | 'like' | 'bookmark') => {
    const direction = action === 'dislike' ? 'left' : action === 'like' ? 'right' : 'up';
    handleSwipe(direction);
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
    const newPost: typeof MOCK_POSTS[0] = {
      id: Date.now(), // Use timestamp as unique ID
      user: { 
        name: "You", 
        avatar: "https://randomuser.me/api/portraits/men/1.jpg" // Default avatar
      },
      timestamp: "Just now",
      image: postData.images[0], // Use first image as main image
      likes: 0,
      comments: 0,
      shares: 0,
      isBookmarked: false,
      location: postData.location,
      caption: postData.caption,
      pictures: postData.images,
    };

    console.log('Adding new post:', newPost); // Debug log
    setPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts];
      console.log('Updated posts count:', updatedPosts.length); // Debug log
      return updatedPosts;
    });
  };

  const renderPostCard = ({ item }: { item: typeof MOCK_POSTS[0] }) => (
    <TouchableOpacity 
      style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4]}
      onPress={() => {
        // Convert MOCK_POSTS item to GenericPost format
        const genericPost: GenericPost = {
          id: item.id,
          user: item.user,
          timestamp: item.timestamp,
          location: item.location,
          caption: item.caption,
          images: item.pictures || [item.image],
          likes: item.likes,
          comments: item.comments,
          shares: item.shares,
          isBookmarked: item.isBookmarked,
        };
        setSelectedPost(genericPost);
        setSinglePostVisible(true);
      }}
    >
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.pB2]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <Image
            source={{ uri: item.user.avatar }}
            style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3]}
          />
          <View>
            <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{item.user.name}</Text>
            {/* Show location if profileType is travel */}
            {profileType === 'travel' && item.location && (
              <Text style={[tw.textGray500, tw.textXs]}>{item.location}</Text>
            )}
            <Text style={[tw.textGray500, tw.textSm]}>{item.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
          <Ionicons
            name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={item.isBookmarked ? "#fb6c31" : "#6b7280"}
          />
        </TouchableOpacity>
      </View>
      {/* Main Image or Grid for Travel */}
      {profileType === 'travel' ? (
        <View style={[tw.pX4, tw.pB2]}> 
          {item.pictures && item.pictures.length === 1 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedImage(item.pictures[0]);
                setImageModalVisible(true);
              }}
            >
              <Image
                source={{ uri: item.pictures[0] }}
                style={[tw.wFull, { height: 240 }, tw.roundedLg]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {item.pictures && item.pictures.length === 2 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {item.pictures.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={{ flex: 1 }}
                  onPress={() => {
                    setSelectedImage(img);
                    setImageModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: img }}
                    style={[{ width: '100%', height: 180, borderRadius: 12 }]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {item.pictures && item.pictures.length >= 3 && (
            <View style={{ flexDirection: 'row', gap: 8, height: 200 }}>
              <TouchableOpacity
                style={{ flex: 2, marginRight: 4 }}
                onPress={() => {
                  setSelectedImage(item.pictures[0]);
                  setImageModalVisible(true);
                }}
              >
                <Image
                  source={{ uri: item.pictures[0] }}
                  style={[{ width: '100%', height: '100%', borderRadius: 12, flex: 1 }]} 
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                {[item.pictures[1], item.pictures[2]].map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{ flex: 1, marginBottom: idx === 0 ? 4 : 0 }}
                    onPress={() => {
                      setSelectedImage(img);
                      setImageModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: img }}
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
          <Image
            source={{ uri: item.image }}
            style={[tw.wFull, { height: 240 }, tw.roundedLg]}
            resizeMode="cover"
          />
        </View>
      )}
      {/* Caption for Travel and Networking */}
      {(profileType === 'travel' || profileType === 'networking' || profileType === null) && item.caption && (
        <View style={[tw.pX4, tw.pB3]}>
          <Text style={[tw.textGray800, tw.textBase]} numberOfLines={3}>
            <Text style={[tw.fontBold]}>{item.user.name}</Text>
            <Text style={[tw.textSm]}> {renderCaptionWithHashtags(item.caption)}</Text>
          </Text>
        </View>
      )}
      {/* Engagement Metrics */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pX4, tw.pB4]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <Ionicons name="heart-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(item.likes)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(item.comments)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter]}>
            <Ionicons name="arrow-redo-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(item.shares)}</Text>
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
            <Image
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
    
    if (currentProfileIndex >= datingProfiles.length) {
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
              setDatingProfiles([...MOCK_DATING_PROFILES]);
            }}
          >
            <Text style={[tw.textWhite, tw.fontBold]}>Reset Profiles</Text>
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
              isTopCard={index === visibleProfiles.length - 1}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={[ tw.bottom0, tw.left0, tw.right0, tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.pB4, tw.pT4, tw.bgGray100]}>
          <TouchableOpacity
            style={[tw.bgRed500, tw.roundedFull, tw.w16, tw.h16, tw.justifyCenter, tw.itemsCenter, tw.mR4, tw.shadow]}
            onPress={() => handleActionButton('dislike')}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[tw.bgGray900, tw.roundedFull, tw.w16, tw.h16, tw.justifyCenter, tw.itemsCenter, tw.mR4, tw.shadow]}
            onPress={() => handleActionButton('bookmark')}
          >
            <Ionicons name="bookmark" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[tw.bgGreen500, tw.roundedFull, tw.w16, tw.h16, tw.justifyCenter, tw.itemsCenter, tw.shadow]}
            onPress={() => handleActionButton('like')}
          >
            <Ionicons name="heart" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[tw.flex1, tw.bgGray100]}>
      {/* Top Navigation with Logo and Search */}
      <View style={[tw.pX4, tw.pT2, tw.pB4]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
          {/* Logo */}
          <View style={[tw.mR3]}>
            <Image
              source={require("../../assets/images/afroma_logo.png")}
              style={[tw.w8, tw.h8]}
              resizeMode="contain"
            />
          </View>
          {/* Search Bar */}
          <View style={[tw.flex1, tw.flexRow, tw.itemsCenter, tw.bgWhite, tw.roundedFull, tw.pX4, tw.pY3, tw.shadow]}>
            <TextInput
              style={[tw.flex1, tw.textBase, tw.textGray700]}
              placeholder="Search for person, places, posts..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <Ionicons name="search" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Filter Tabs */}
      <View style={[tw.pX4, tw.pB4]}>
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
      </View>
      {/* Content */}
      {showDating ? (
        renderDatingInterface()
              ) : profileType === 'networking' ? (
          <Networking />
        ) : (
        <FlatList
          data={posts}
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
        onLike={(postId) => {
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === postId ? { ...post, likes: post.likes + 1 } : post
            )
          );
        }}
        onComment={(postId) => {
          console.log('Comment on post:', postId);
        }}
        onShare={(postId) => {
          console.log('Share post:', postId);
        }}
        profileType={profileType}
      />

      {/* Floating Action Button */}
      {(profileType === 'travel' || profileType === 'networking') && (
        <TouchableOpacity
          style={[
            tw.absolute,
            { bottom: 72, right: 24 },
            profileType === 'travel' ? tw.bgPink700 : tw.bgPurple600,
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
