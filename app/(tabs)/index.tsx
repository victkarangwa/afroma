import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, PanResponder, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Mock data for dating profiles
const MOCK_DATING_PROFILES = [
  {
    id: 1,
    name: "Emma Wilson",
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
    name: "Marcus Thompson",
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
    name: "Sofia Rodriguez",
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
    name: "James Park",
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
  },
];

// Mock data for networking profiles
const MOCK_NETWORKING_PROFILES = [
  {
    id: 1,
    name: "Linda Mensah",
    headline: "Product Manager at FinTech Africa",
    summary: "Building digital products for financial inclusion. Passionate about mentoring women in tech.",
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
    industries: ["Technology", "Finance"],
    collaboration: ["Mentoring", "Partnerships"],
  },
  {
    id: 2,
    name: "Kwame Boateng",
    headline: "Founder, EduConnect",
    summary: "Connecting students with global learning opportunities. Always open to new partnerships.",
    photo: "https://randomuser.me/api/portraits/men/13.jpg",
    industries: ["Education", "Technology"],
    collaboration: ["Partnerships", "Job Opportunities"],
  },
  {
    id: 3,
    name: "Fatima Diallo",
    headline: "Marketing Strategist",
    summary: "Helping brands grow in Africa. Let’s collaborate on creative campaigns!",
    photo: "https://randomuser.me/api/portraits/women/14.jpg",
    industries: ["Marketing", "Design"],
    collaboration: ["Partnerships", "Mentoring"],
  },
  {
    id: 4,
    name: "Samuel Okoro",
    headline: "Healthcare Consultant",
    summary: "Improving healthcare systems across West Africa. Interested in health tech partnerships.",
    photo: "https://randomuser.me/api/portraits/men/14.jpg",
    industries: ["Healthcare", "Consulting"],
    collaboration: ["Job Opportunities", "Partnerships"],
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

// Networking Card Component
const NetworkingCard = ({ profile }: { profile: typeof MOCK_NETWORKING_PROFILES[0] }) => (
  <View style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4, tw.p4, tw.flexRow]}> 
    <Image
      source={{ uri: profile.photo }}
      style={[tw.w20, tw.h20, tw.rounded]}
      resizeMode="cover"
    />
    <View style={[tw.flex1, tw.mL4, tw.justifyCenter]}> 
      <Text style={[tw.textGray900, tw.fontBold, tw.textLg]}>{profile.name}</Text>
      <Text style={[tw.textGray700, tw.textBase, tw.mT1]}>{profile.headline}</Text>
      <Text style={[tw.textGray600, tw.textSm, tw.mT2]} numberOfLines={3}>{profile.summary}</Text>
      <View style={[tw.flexRow, tw.flexWrap, tw.mT2]}> 
        {profile.industries.map((industry, idx) => (
          <View key={idx} style={[tw.bgGray200, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
            <Text style={[tw.textGray700, tw.textXs]}>{industry}</Text>
          </View>
        ))}
      </View>
      <View style={[tw.flexRow, tw.flexWrap, tw.mT1]}> 
        {profile.collaboration.map((item, idx) => (
          <View key={idx} style={[tw.bgPink100, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
            <Text style={[tw.textPink700, tw.textXs, tw.fontBold]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [datingProfiles, setDatingProfiles] = useState(MOCK_DATING_PROFILES);
  const [networkingProfiles] = useState(MOCK_NETWORKING_PROFILES);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showDating, setShowDating] = useState(false);

  React.useEffect(() => {
    if (params.profileType === 'dating') {
      setShowDating(true);
    } else {
      setShowDating(false);
    }
  }, [params.profileType]);

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

  const renderPostCard = ({ item }: { item: typeof MOCK_POSTS[0] }) => (
    <View style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4]}>
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.pB2]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <Image
            source={{ uri: item.user.avatar }}
            style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3]}
          />
          <View>
            <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{item.user.name}</Text>
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

      {/* Main Image */}
      <View style={[tw.pX4, tw.pB2]}>
        <Image
          source={{ uri: item.image }}
          style={[tw.wFull, { height: 240 }, tw.roundedLg]}
          resizeMode="cover"
        />
      </View>

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
    </View>
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
      ) : params.profileType === 'networking' ? (
        <FlatList
          data={networkingProfiles}
          renderItem={({ item }) => <NetworkingCard profile={item} />}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 80 }]}
            />
          ) : (
        <FlatList
          data={posts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 80 }]}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
