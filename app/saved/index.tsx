import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';
import { useRouter } from 'expo-router';
import { useBookmarks } from '@/hooks/useBookmarks';
import ImageWithFallback from '@/components/ImageWithFallback';
import { PostSkeleton } from '@/components/Skeleton';
import UserProfileView from '@/components/UserProfileView';

// Mocked bookmarked dating profiles (to be replaced with API later)
const MOCK_BOOKMARKED_PROFILES = [
  {
    matchId: 7,
    matchedUserId: 100032,
    profile: {
      id: 100032,
      firstname: "Male",
      lastname: "Guy",
      gender: "Male",
      interestedIn: "Female",
      dateOfBirth: "1998-10-14T00:00:00.000+00:00",
      gallery: [
        {
          id: 55,
          thumbnailUrl: "https://uat-user-api.bondedapp.io/afroma-master-service/media/stream/1jd6mzehoxnmm9wx.jpg",
          mediaUrl: "https://uat-user-api.bondedapp.io/afroma-master-service/media/stream/1jd6mzehoxnmm9wx.jpg",
          fileName: "1jd6mzehoxnmm9wx.jpg",
          featured: true,
          mediaType: "PHOTO"
        }
      ],
      profileType: "DATING",
      profileTypes: ["DATING"],
      latitude: 37.785834,
      longitude: -122.406417
    }
  }
];

const SavedPostsScreen: React.FC = () => {
  const router = useRouter();
  const { bookmarkedPosts, removeBookmark, loading } = useBookmarks();
  const [refreshing, setRefreshing] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const calculateAge = (dobIso: string) => {
    if (!dobIso) return null;
    const birthDate = new Date(dobIso);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleRemoveBookmark = (postId: number) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this post from your saved items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeBookmark(postId)
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // The useBookmarks hook will automatically reload when the component re-renders
    setTimeout(() => setRefreshing(false), 1000);
  };

  const viewProfile = (userId: number) => {
    setSelectedUserId(userId);
    setProfileModalVisible(true);
  };

  const messageProfile = (entry: any) => {
    const p = entry.profile;
    const payload = {
      id: p.id,
      firstName: p.firstname || '',
      firstname: p.firstname || '',
      middleName: '',
      lastName: p.lastname || '',
      lastname: p.lastname || '',
      mediaList: Array.isArray(p.gallery) ? p.gallery.map((g: any) => ({
        id: g.id,
        thumbnailUrl: g.thumbnailUrl,
        mediaUrl: g.mediaUrl || g.thumbnailUrl,
        fileName: g.fileName,
        featured: !!g.featured,
        mediaType: g.mediaType || 'PHOTO',
      })) : [],
    };
    router.push({ pathname: '/chats/room', params: { user: JSON.stringify(payload) } });
  };

  const renderProfile = ({ item }: { item: any }) => {
    const p = item.profile;
    const featured = Array.isArray(p.gallery) ? p.gallery.find((g: any) => g.featured) : null;
    const avatarUri = featured?.thumbnailUrl || featured?.mediaUrl || '';
    const age = calculateAge(p.dateOfBirth);
    return (
      <View style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.mX4, tw.shadow, tw.p4]}> 
        <View style={[tw.flexRow, tw.itemsCenter]}> 
          <Image
            source={avatarUri ? { uri: avatarUri } : require('../../assets/images/default_avatar.jpg')}
            style={[tw.w16, tw.h16, tw.roundedFull, tw.mR4]}
          />
          <View style={[tw.flex1]}> 
            <Text style={[tw.textGray900, tw.fontBold, tw.textLg]}>{p.firstname} {p.lastname}{age ? `, ${age}` : ''}</Text>
            <Text style={[tw.textGray500, tw.textSm]}>{p.gender}{p.interestedIn ? ` • Interested in ${p.interestedIn}` : ''}</Text>
          </View>
        </View>
        <View style={[tw.flexRow, tw.justifyBetween, tw.mT4]}> 
          <TouchableOpacity
            style={[tw.flex1, tw.roundedFull, tw.itemsCenter, tw.justifyCenter, tw.pY3, tw.mR2, { backgroundColor: '#fb6c31' }]}
            onPress={() => messageProfile(item)}
            activeOpacity={0.9}
          >
            <Text style={[tw.textWhite, tw.fontBold]}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[tw.flex1, tw.roundedFull, tw.itemsCenter, tw.justifyCenter, tw.pY3, tw.mL2, tw.border, { borderColor: '#fb6c31' }]}
            onPress={() => viewProfile(p.id)}
            activeOpacity={0.9}
          >
            <Text style={[{ color: '#fb6c31' }, tw.fontBold]}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.mX4, tw.shadow]}>
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.pB2]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <ImageWithFallback
            source={
              item.user.avatar
                ? { uri: item.user.avatar }
                : require("../../assets/images/default_avatar.jpg")
            }
            style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3]}
            cache="memory"
            priority="normal"
          />
          <View>
            <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>
              {item.user.firstname} {item.user.lastname}
            </Text>
            <Text style={[tw.textGray500, tw.textSm]}>
              {getTimeAgo(item.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveBookmark(item.id)}
          style={[tw.p2]}
        >
          <Ionicons name="bookmark" size={20} color="#fb6c31" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={[tw.pX4, tw.pB3]}>
        <Text style={[tw.textGray900, tw.textBase, tw.leading5]}>
          {item.content}
        </Text>
      </View>

      {/* Images */}
      {item.attachments && item.attachments.length > 0 && (
        <View style={[tw.pX4, tw.pB3]}>
          {item.attachments.length === 1 ? (
            <ImageWithFallback
              source={{ uri: item.attachments[0].mediaUrl }}
              style={[tw.wFull, { height: 240 }, tw.roundedLg]}
              resizeMode="cover"
              cache="memory"
              priority="normal"
            />
          ) : (
            <View style={[tw.flexRow, { gap: 4 }]}>
              {item.attachments.slice(0, 3).map((attachment: any, index: number) => (
                <ImageWithFallback
                  key={attachment.id}
                  source={{ uri: attachment.mediaUrl }}
                  style={[
                    tw.roundedLg,
                    { 
                      flex: 1, 
                      height: 120,
                      marginRight: index < 2 ? 4 : 0
                    }
                  ]}
                  resizeMode="cover"
                  cache="memory"
                  priority="normal"
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Engagement Metrics */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pX4, tw.pB4, tw.borderT, tw.borderGray200, tw.pT3]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <View style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <Ionicons name="heart-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>
              {formatNumber(item.likeCount)}
            </Text>
          </View>
          <View style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>0</Text>
          </View>
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <Ionicons name="arrow-redo-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>0</Text>
          </View>
        </View>
        <Text style={[tw.textGray400, tw.textXs]}>
          Saved {getTimeAgo(item.bookmarkedAt)}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.pX8]}>
      <View style={[tw.w24, tw.h24, tw.roundedFull, tw.bgGray100, tw.justifyCenter, tw.itemsCenter, tw.mB4]}>
        <Ionicons name="bookmark-outline" size={48} color="#9ca3af" />
      </View>
      <Text style={[tw.textGray900, tw.fontBold, tw.textXl, tw.textCenter, tw.mB2]}>
        No Saved Posts Yet
      </Text>
      <Text style={[tw.textGray500, tw.textBase, tw.textCenter, tw.leading5]}>
        When you bookmark posts you love, they'll appear here for easy access.
      </Text>
      <TouchableOpacity
        style={[tw.bgOrange500, tw.pX6, tw.pY3, tw.roundedFull, tw.mT6]}
        onPress={() => router.back()}
      >
        <Text style={[tw.textWhite, tw.fontBold, tw.textBase]}>
          Explore Posts
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[tw.flex1, tw.bgGray100]}>
      {/* Header */}
      <View style={[tw.bgWhite, tw.pX4, tw.pY3, tw.borderB, tw.borderGray200, tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[tw.flexRow, tw.itemsCenter]}
        >
          <Ionicons name="chevron-back-outline" size={24} color="#374151" />
          <Text style={[tw.textGray900, tw.textBase, tw.fontMedium, tw.mL2]}>
            Saved Profiles
          </Text>
        </TouchableOpacity>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <Ionicons name="bookmark" size={20} color="#fb6c31" />
          <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{bookmarkedPosts.length}</Text>
        </View>
      </View>

      {/* Bookmarked Dating Profiles (mocked) */}
      <View style={[tw.mT4]}>
        <Text style={[tw.mX4, tw.mB2, tw.textGray900, tw.fontBold, tw.textBase]}>Bookmarked Profiles</Text>
        {MOCK_BOOKMARKED_PROFILES.length === 0 ? (
          <View style={[tw.itemsCenter, tw.mY4]}>
            <Text style={[tw.textGray500]}>No bookmarked profiles yet.</Text>
          </View>
        ) : (
          <FlatList
            data={MOCK_BOOKMARKED_PROFILES}
            renderItem={renderProfile}
            keyExtractor={(item) => `profile-${item.matchedUserId}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[tw.mB2]}
          />
        )}
      </View>

      {/* Content */}
      {/* {loading ? (
        <View style={[tw.flex1, tw.pT4]}>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </View>
      ) : bookmarkedPosts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={bookmarkedPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fb6c31"
            />
          }
          contentContainerStyle={[tw.pT4]}
        />
      )} */}

      {/* User Profile Modal */}
      <UserProfileView
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userId={selectedUserId || 0}
      />
    </SafeAreaView>
  );
};

export default SavedPostsScreen;
