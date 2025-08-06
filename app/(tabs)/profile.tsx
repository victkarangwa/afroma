import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import { useRouter, useFocusEffect } from "expo-router";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { removeUserData } from "@/utils";
import * as ImagePicker from "expo-image-picker";
import LocalStorage from "@/utils/storage";
import { clearAuthData } from "@/utils/auth";
import localStore from "@/utils/localValues";
import NotificationBadge from "@/components/NotificationBadge";
import { MOCK_NOTIFICATIONS } from "@/components/NotificationCenter";

// Patch type for localStore to include profileType
type LocalStoreType = typeof localStore & { profileType: string };
const localStoreTyped = localStore as LocalStoreType;

// Mock data for posts
const MOCK_USER_POSTS = [
  {
    id: 1,
    user: { name: "Alex Tangishaka", avatar: "https://randomuser.me/api/portraits/women/5.jpg" },
    timestamp: "3d ago",
    content: "Going on vacation! Catch you all in 10 days. No call!!!!",
    likes: 261,
    comments: 12,
    shares: 0,
  },
  {
    id: 2,
    user: { name: "Gedeon Izabayo", avatar: "https://randomuser.me/api/portraits/women/5.jpg" },
    timestamp: "4d ago", 
    content: "1 day to go!",
    likes: 189,
    comments: 8,
    shares: 2,
  },
];

const PROFILE_TABS = ["Travel", "Networking", "Relationshions"];

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { loading, send } = useApiRequest<ApiResponse>();
  
  const [profile, setProfile] = useState<any>({});
  const [activeTab, setActiveTab] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [profileType, setProfileType] = useState<'travel' | 'networking' | 'dating'>('travel');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Calculate age from dateOfBirth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  // On mount, read profileType from local storage
  useEffect(() => {
    (async () => {
      const storedType = await LocalStorage.getItem<'travel' | 'networking' | 'dating'>(localStoreTyped.profileType);
      if (storedType) setProfileType(storedType);
    })();
  }, []);

  const getMyBasicProfile = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      
      const result = await send("get", "/users/me");
      if (result?.errors) {
        console.error("Error fetching user profile:", result.errors);
        setProfileError(result.errors);
        handleLogout();
        return;
      }
      console.log("User profile data:", result);
      setProfile(result);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileError("Failed to load profile");
      handleLogout();
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getMyBasicProfile();
    }, [])
  );

  const handleLogout = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              try {
                // Clear authentication data
                await clearAuthData();
                
                // Clear any other user data
                removeUserData();
                
                // Navigate to login screen
                router.replace("/getStarted/login");
              } catch (error) {
                console.error("Error during logout:", error);
                Alert.alert("Error", "Failed to logout. Please try again.");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      // Handle image upload here
    }
  };

  const renderPost = ({ item }: { item: typeof MOCK_USER_POSTS[0] }) => (
    <View style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.p4, tw.shadow]}>
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.mB3]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <Image
            source={{ uri: item.user.avatar }}
            style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3]}
          />
          <View>
            <Text style={[tw.textGray900, tw.fontBold]}>{item.user.name}</Text>
            <Text style={[tw.textGray500, tw.textSm]}>{item.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
      
      <Text style={[tw.textGray800, tw.mB3]}>{item.content}</Text>
      
      <View style={[tw.flexRow, tw.itemsCenter]}>
        <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
          <Ionicons name="heart-outline" size={18} color="#fb6c31" />
          <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
          <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
          <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
          <Ionicons name="arrow-redo-outline" size={18} color="#6b7280" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[tw.mL8]}>
          <Ionicons name="bookmark-outline" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Handle profile switch and navigate to Home
  const handleProfileSwitch = async (type: 'travel' | 'networking' | 'dating') => {
    setProfileType(type);
    setModalVisible(false);
    await LocalStorage.setItem(localStoreTyped.profileType, type);
    let profileTypeParam = 'main';
    if (type === 'dating') profileTypeParam = 'dating';
    else if (type === 'networking') profileTypeParam = 'networking';
    router.replace({ pathname: '/(tabs)', params: { profileType: profileTypeParam } });
  };

  // Profile type descriptions
  const profileOptions = [
    {
      key: 'travel',
      label: 'Travel',
      description: 'Connect with fellow travelers, share experiences, and find travel buddies.'
    },
    {
      key: 'networking',
      label: 'Networking',
      description: 'Expand your professional network, collaborate, and discover new opportunities.'
    },
    {
      key: 'dating',
      label: 'Dating & Relationship',
      description: 'Meet new people, find matches, and build meaningful relationships.'
    },
  ];

  const unreadNotificationsCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={[tw.flex1, tw.bgGray100]}>
      {/* Header */}
      <View style={[tw.bgWhite, tw.pX4, tw.pT4, tw.pB4, tw.shadow]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
          <Text style={[tw.textGray900, tw.fontBold, tw.textXl]}>Profile</Text>
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <NotificationBadge
              count={unreadNotificationsCount}
              onPress={() => router.push('/notifications')}
              size="medium"
            />
            <TouchableOpacity style={[tw.mL4]} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={24} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={[tw.mL4]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Cover Photo */}
        <View style={[tw.relative]}>
          {/* Cover Photo */}
          <TouchableOpacity>
            <Image
              source={{ uri: "https://picsum.photos/400/250?random=cover" }}
              style={[tw.wFull, { height: 200 }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          {/* Settings Icon */}
          <TouchableOpacity
            style={[tw.absolute, tw.top0, tw.right0, tw.m4, tw.bgBlack, tw.opacity50, tw.roundedFull, tw.p2]}
            onPress={() => router.push("/settings")}
          >
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>

          {/* Profile Picture positioned at bottom center of cover photo */}
          <TouchableOpacity
            onPress={pickImage}
            style={[tw.absolute, { bottom: -50, left: '50%', marginLeft: -50 }]}
          >
            <View style={[tw.relative]}>
              <Image
                source={{
                  uri: profile?.profilePicture || 
                       profile?.gallery?.find((img: any) => img.featured)?.thumbnailUrl || 
                       "https://randomuser.me/api/portraits/women/5.jpg"
                }}
                style={[tw.w24, tw.h24, tw.roundedFull, tw.border4, tw.borderWhite]}
              />
              {isUploading && (
                <View style={[tw.absolute, tw.inset0, tw.justifyCenter, tw.itemsCenter, tw.bgBlack, tw.opacity50, tw.roundedFull]}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              )}
              {/* Profile Type Tag */}
              <View style={[tw.absolute, { bottom: -12, left: '50%', transform: [{ translateX: -30 }] }, tw.bgGray900, tw.pX3, tw.pY1, tw.roundedFull, tw.itemsCenter, tw.justifyCenter, { minWidth: 60, zIndex: 2 }]}> 
                <Text style={[tw.textWhite, tw.textXs, tw.fontBold, { textAlign: 'center' }]}> 
                  {profile?.profileType || profileType === 'travel' && 'Travel' || profileType === 'networking' && 'Networking' || profileType === 'dating' && 'Dating'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={[tw.pX6, tw.mT24]}>
          {/* Profile Actions Row */}
          <View style={[tw.flexRow, tw.justifyCenter, tw.itemsCenter, tw.mB6]}> 
            {/* Switch Profile Icon */}
            <TouchableOpacity
              style={[tw.bgGray900, tw.roundedFull, tw.p3, tw.mR4, { shadowColor: '#fb6c31', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 3 }]}
              onPress={() => setModalVisible(true)}
              accessibilityLabel="Switch Profile"
            >
              <Ionicons name="swap-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
            {/* Edit Profile Icon */}
            <TouchableOpacity
              style={[tw.bgPink700, tw.roundedFull, tw.p3, tw.mR4, { shadowColor: '#fb6c31', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 3 }]}
              onPress={() => router.push("/form/profile")}
              accessibilityLabel="Edit Profile"
            >
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Modal for Profile Options */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor: 'rgba(0,0,0,0.4)' }]}> 
              <View style={[tw.bgWhite, tw.roundedLg, tw.p8, tw.wFull, tw.mX8]}> 
                <Text style={[tw.textGray900, tw.textLg, tw.fontBold, tw.mB4, tw.textCenter]}>Select Profile Type</Text>
                {profileOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[tw.pY4, tw.pX4, tw.rounded, tw.mB3, option.key === profileType ? tw.bgGray200 : tw.bgGray100]}
                    onPress={() => handleProfileSwitch(option.key as any)}
                  >
                    <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{option.label}</Text>
                    <Text style={[tw.textGray600, tw.textSm, tw.mT1]}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[tw.itemsCenter, tw.mT2]} onPress={() => setModalVisible(false)}>
                  <Text style={[tw.textPink700, tw.fontBold]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Profile Info */}
          <View style={[tw.itemsCenter, tw.mY4]}>
            {isLoadingProfile ? (
              <View style={[tw.itemsCenter, tw.pY4]}>
                <Text style={[tw.textGray600, tw.textBase]}>Loading profile...</Text>
              </View>
            ) : profileError ? (
              <View style={[tw.itemsCenter, tw.pY4]}>
                <Text style={[tw.textRed600, tw.textBase, tw.textCenter]}>{profileError}</Text>
                <TouchableOpacity 
                  style={[tw.mT2, tw.bgPink700, tw.pX4, tw.pY2, tw.rounded]}
                  onPress={getMyBasicProfile}
                >
                  <Text style={[tw.textWhite, tw.fontBold]}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={[tw.textGray900, tw.text2xl, tw.fontBold]}>
                  {"Tangishaka Loic"}
                </Text>
                <Text style={[tw.textGray600, tw.textBase, tw.mT1]}>
                  {profile?.city || profile?.location || "Location not set"}
                  {profile?.latitude && profile?.longitude && profile.latitude !== 0 && profile.longitude !== 0 ? 
                    ` (${profile.latitude.toFixed(2)}, ${profile.longitude.toFixed(2)})` : ""}
                </Text>
                <Text style={[tw.textGray700, tw.textBase, tw.mT2, tw.textCenter]}>
                  {profile?.bio || profile?.description || 
                    `${profile?.gender || ""}${profile?.dateOfBirth ? ` • ${calculateAge(profile.dateOfBirth)} years old` : ""}${profile?.profileType ? ` • ${profile.profileType}` : ""}`
                  }
                </Text>
              </>
            )}
          </View>



          {/* Additional Profile Details */}
          {!isLoadingProfile && !profileError && profile && (
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.mB4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB3]}>Profile Details</Text>
              <View style={[tw.flexRow, tw.justifyBetween, tw.mB2]}>
                <Text style={[tw.textGray600, tw.textBase]}>Gender:</Text>
                <Text style={[tw.textGray900, tw.textBase, tw.fontBold]}>{profile.gender || "Not specified"}</Text>
              </View>
              {profile.interestedIn && (
                <View style={[tw.flexRow, tw.justifyBetween, tw.mB2]}>
                  <Text style={[tw.textGray600, tw.textBase]}>Interested In:</Text>
                  <Text style={[tw.textGray900, tw.textBase, tw.fontBold]}>{profile.interestedIn}</Text>
                </View>
              )}
              {profile.dateOfBirth && (
                <View style={[tw.flexRow, tw.justifyBetween, tw.mB2]}>
                  <Text style={[tw.textGray600, tw.textBase]}>Age:</Text>
                  <Text style={[tw.textGray900, tw.textBase, tw.fontBold]}>{calculateAge(profile.dateOfBirth)} years old</Text>
                </View>
              )}
              <View style={[tw.flexRow, tw.justifyBetween, tw.mB2]}>
                <Text style={[tw.textGray600, tw.textBase]}>Account Type:</Text>
                <Text style={[tw.textGray900, tw.textBase, tw.fontBold]}>
                  {profile.publicFigure ? "Public Figure" : "Regular User"}
                </Text>
              </View>
              {profile.profileTypes && profile.profileTypes.length > 0 && (
                <View style={[tw.flexRow, tw.justifyBetween, tw.mB2]}>
                  <Text style={[tw.textGray600, tw.textBase]}>Profile Types:</Text>
                  <Text style={[tw.textGray900, tw.textBase, tw.fontBold]}>{profile.profileTypes.join(", ")}</Text>
                </View>
              )}
            </View>
          )}

          {/* Logout Button */}
          <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.mB16, tw.shadow]}>
            <TouchableOpacity
              style={[tw.bgRed500, tw.pY3, tw.pX4, tw.roundedLg, tw.itemsCenter]}
              onPress={handleLogout}
            >
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <Ionicons name="log-out-outline" size={20} color="white" style={[tw.mR2]} />
                <Text style={[tw.textWhite, tw.fontBold, tw.textBase]}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          {/* <View style={[tw.flexRow, tw.justifyBetween, tw.mB4]}>
            {PROFILE_TABS.map((tab, index) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(index)}
                style={[
                  tw.flex1,
                  tw.pY2,
                  tw.itemsCenter,
                  index === activeTab && tw.bgGray900,
                  index === activeTab && tw.roundedFull,
                  index !== activeTab && tw.bgTransparent,
                ]}
              >
                <Text
                  style={[
                    tw.fontBold,
                    index === activeTab ? tw.textWhite : tw.textGray600,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View> */}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
