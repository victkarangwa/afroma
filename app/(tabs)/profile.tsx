import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import { useRouter, useFocusEffect } from "expo-router";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse } from "@/types";
import { removeUserData } from "@/utils";
import * as ImagePicker from "expo-image-picker";

// Mock data for posts
const MOCK_USER_POSTS = [
  {
    id: 1,
    user: { name: "Alex Tsimikas", avatar: "https://randomuser.me/api/portraits/women/5.jpg" },
    timestamp: "3d ago",
    content: "Going on vacation! Catch you all in 10 days. No call!!!!",
    likes: 261,
    comments: 12,
    shares: 0,
  },
  {
    id: 2,
    user: { name: "Alex Tsimikas", avatar: "https://randomuser.me/api/portraits/women/5.jpg" },
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

  const getMyBasicProfile = async () => {
    const result = await send("get", "/bonded-user-service/users/me");
    if (result?.errors) {
      handleLogout();
      return;
    }
    setProfile(result);
  };

  useFocusEffect(
    React.useCallback(() => {
      getMyBasicProfile();
    }, [])
  );

  const handleLogout = async () => {
    // const result = await send("post", "/bonded-user-service/auth/logout");
    // removeUserData();
    // router.push({ pathname: "/getStarted/login" });
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

  return (
    <SafeAreaView style={[tw.flex1, tw.bgGray100]}>
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
                  uri: profile?.gallery?.find((img: any) => img.featured)?.thumbnailUrl || 
                       "https://randomuser.me/api/portraits/women/5.jpg"
                }}
                style={[tw.w24, tw.h24, tw.roundedFull, tw.border4, tw.borderWhite]}
              />
              {isUploading && (
                <View style={[tw.absolute, tw.inset0, tw.justifyCenter, tw.itemsCenter, tw.bgBlack, tw.opacity50, tw.roundedFull]}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={[tw.pX6, tw.mT16]}>
          {/* Profile Info */}
          <View style={[tw.itemsCenter]}>
            <Text style={[tw.textGray900, tw.text2xl, tw.fontBold]}>
              {profile?.firstname || "Alex"} {profile?.lastname || "Tsimikas"}
            </Text>
            <Text style={[tw.textGray600, tw.textBase, tw.mT1]}>
              Brooklyn, NY
            </Text>
            <Text style={[tw.textGray700, tw.textBase, tw.mT2, tw.textCenter]}>
              Writer by Profession. Artist by Passion!
            </Text>
          </View>

          {/* Stats */}
          <View style={[tw.flexRow, tw.justifyCenter, tw.mT6, tw.mB6]}>
            <View style={[tw.itemsCenter, tw.mR8]}>
              <Text style={[tw.textGray900, tw.textLg, tw.fontBold]}>2,447</Text>
              <Text style={[tw.textGray600, tw.textSm]}>Followers</Text>
            </View>
            <View style={[tw.itemsCenter, tw.mR8]}>
              <Text style={[tw.textGray900, tw.textLg, tw.fontBold]}>1,589</Text>
              <Text style={[tw.textGray600, tw.textSm]}>Following</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[tw.bgPink700, tw.roundedFull, tw.pY3, tw.pX8, tw.itemsCenter, tw.mB6]}
            onPress={() => router.push("/form/profile")}
          >
            <Text style={[tw.textWhite, tw.fontBold]}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Tab Navigation */}
          <View style={[tw.flexRow, tw.justifyBetween, tw.mB4]}>
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
          </View>

          {/* Posts Content */}
          {activeTab === 0 && (
            <FlatList
              data={MOCK_USER_POSTS}
              renderItem={renderPost}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={[{ paddingBottom: 100 }]}
            />
          )}

          {/* Other tabs content */}
          {activeTab !== 0 && (
            <View style={[tw.itemsCenter, tw.pY16]}>
              <Text style={[tw.textGray500, tw.textBase]}>
                {PROFILE_TABS[activeTab]} content coming soon
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
