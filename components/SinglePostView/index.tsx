import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Generic post interface that works across all profile types
export interface GenericPost {
  id: number;
  user: {
    name: string;
    avatar: string;
    headline?: string;
  };
  timestamp: string;
  location?: string;
  caption?: string;
  images: string[];
  likes: number;
  comments: number;
  shares: number;
  isBookmarked: boolean;
  tags?: string[];
}

interface SinglePostViewProps {
  visible: boolean;
  post: GenericPost | null;
  onClose: () => void;
  onToggleBookmark?: (postId: number) => void;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  profileType?: 'travel' | 'networking' | 'dating' | null;
}

const SinglePostView: React.FC<SinglePostViewProps> = ({
  visible,
  post,
  onClose,
  onToggleBookmark,
  onLike,
  onComment,
  onShare,
  profileType,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log('SinglePostView props:', { visible, post: post?.id, profileType });

  if (!post) {
    console.log('No post provided to SinglePostView');
    return null;
  }

  if (!visible) {
    console.log('SinglePostView not visible');
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
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

  const getProfileTypeColor = () => {
    switch (profileType) {
      case 'travel':
        return 'bg-blue-500';
      case 'networking':
        return 'bg-purple-500';
      case 'dating':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      transparent={false}
      statusBarTranslucent={false}
      hardwareAccelerated={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={[tw.flex1, tw.bgBlack]}>
        {/* Header */}
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.bgBlack]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <View style={[tw.w8, tw.h8, tw.roundedFull, getProfileTypeColor(), tw.justifyCenter, tw.itemsCenter, tw.mR2]}>
              <Ionicons 
                name={profileType === 'travel' ? 'airplane' : profileType === 'networking' ? 'business' : profileType === 'dating' ? 'heart' : 'create'} 
                size={16} 
                color="white" 
              />
            </View>
            <Text style={[tw.textWhite, tw.fontBold, tw.textLg]}>Post</Text>
          </View>
          
          <TouchableOpacity onPress={() => onToggleBookmark?.(post.id)}>
            <Ionicons
              name={post.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={post.isBookmarked ? "#fb6c31" : "white"}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={[tw.flex1]} showsVerticalScrollIndicator={false}>
          {/* Images */}
          <View style={[tw.relative]}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                setCurrentImageIndex(index);
              }}
            >
              {post.images.map((image, index) => (
                <View key={index} style={[{ width: screenWidth, height: screenHeight * 0.5 }]}>
                  <Image
                    source={{ uri: image }}
                    style={[{ width: '100%', height: '100%' }]}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Image Indicators */}
            {post.images.length > 1 && (
              <View style={[tw.absolute, { bottom: 16 }, tw.left0, tw.right0, tw.flexRow, tw.justifyCenter]}>
                {post.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      tw.w2,
                      tw.h2,
                      tw.roundedFull,
                      tw.mX1,
                      currentImageIndex === index ? tw.bgWhite : tw.bgGray500,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Post Content */}
          <View style={[tw.bgWhite, tw.flex1, tw.p4]}>
            {/* User Info */}
            <View style={[tw.flexRow, tw.itemsCenter, tw.mB3]}>
              <Image
                source={{ uri: post.user.avatar }}
                style={[tw.w12, tw.h12, tw.roundedFull, tw.mR3]}
              />
              <View style={[tw.flex1]}>
                <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{post.user.name}</Text>
                {post.user.headline && (
                  <Text style={[tw.textGray700, tw.textSm]}>{post.user.headline}</Text>
                )}
                {post.location && (
                  <Text style={[tw.textGray500, tw.textSm]}>{post.location}</Text>
                )}
                <Text style={[tw.textGray500, tw.textSm]}>{post.timestamp}</Text>
              </View>
            </View>

            {/* Full Caption */}
            {post.caption && (
              <View style={[tw.mB4]}>
                <Text style={[tw.textGray800, tw.textBase]}>
                  <Text style={[tw.fontBold]}>{post.user.name}</Text>
                  <Text> {renderCaptionWithHashtags(post.caption)}</Text>
                </Text>
              </View>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <View style={[tw.flexRow, tw.flexWrap, tw.mB4]}>
                {post.tags.map((tag, index) => (
                  <View key={index} style={[tw.bgGray200, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
                    <Text style={[tw.textGray700, tw.textXs]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Engagement Metrics */}
            <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pT3, tw.borderT, tw.borderGray200]}>
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <TouchableOpacity 
                  style={[tw.flexRow, tw.itemsCenter, tw.mR6]}
                  onPress={() => onLike?.(post.id)}
                >
                  <Ionicons name="heart-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(post.likes)}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[tw.flexRow, tw.itemsCenter, tw.mR6]}
                  onPress={() => onComment?.(post.id)}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(post.comments)}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[tw.flexRow, tw.itemsCenter]}
                  onPress={() => onShare?.(post.id)}
                >
                  <Ionicons name="arrow-redo-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(post.shares)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default SinglePostView; 