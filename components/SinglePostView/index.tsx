import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getUserInitials } from "@/utils/userInitials";
import CommentSection from "../CommentSection";
import { Comment, CommentListResponse } from "@/types";
import useApiRequest from "@/hooks/useApiRequest";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Generic post interface that works across all profile types
export interface GenericPost {
  id: number;
  user: {
    name: string;
    avatar?: string; // Optional since we use initials instead
    photo?: string; // User's profile photo
    headline?: string;
    userId?: number; // Add userId for profile viewing
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
  onViewProfile?: (userId: number) => void;
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
  onViewProfile,
  profileType,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  const { send } = useApiRequest<CommentListResponse>();

  // Load comments when post is visible
  const loadComments = async () => {
    if (!post || commentsLoading) return;
    
    try {
      setCommentsLoading(true);
      const response = await send('post', `/comment/list-by-post/${post.id}`, {
        page: 1,
        pageSize: 10,
      });
      
      if (response?.success && response?.list) {
        setComments(response.list);
        setCommentCount(response.totalRecords || response.list.length);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Load comments when component becomes visible
  useEffect(() => {
    if (visible && post) {
      loadComments();
    }
  }, [visible, post?.id]);

  // console.log('SinglePostView props:', { visible, post: post?.id, profileType });

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
                  <ImageWithFallback
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
            <TouchableOpacity 
              style={[tw.flexRow, tw.itemsCenter, tw.mB3]}
              // onPress={() => post.user.userId && onViewProfile?.(post.user.userId)}
              activeOpacity={0.7}
              disabled={!post.user.userId}
            >
              <View style={[tw.w12, tw.h12, tw.roundedFull, tw.mR3, tw.overflowHidden]}>
                {post.user.photo ? (
                  <ImageWithFallback
                    source={{ uri: post.user.photo }}
                    style={[tw.wFull, tw.hFull]}
                    resizeMode="cover"
                    fallbackSource={null}
                  />
                ) : (
                  <View style={[tw.wFull, tw.hFull, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
                    <Text style={[tw.textGray700, tw.fontBold, tw.textSm]}>
                      {(() => {
                        const nameParts = post.user.name.split(' ');
                        return getUserInitials(nameParts[0] || '', nameParts[1] || '');
                      })()}
                    </Text>
                  </View>
                )}
              </View>
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
              {post.user.userId && (
                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
              )}
            </TouchableOpacity>

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
                  onPress={() => setShowComments(true)}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(commentCount)}</Text>
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

            {/* Comments Preview */}
            {commentsLoading ? (
              <View style={[tw.pT3, tw.borderT, tw.borderGray200]}>
                <View style={[tw.pY2, tw.itemsCenter]}>
                  <ActivityIndicator size="small" color="#fb6c31" />
                  <Text style={[tw.textGray500, tw.textSm, tw.mT2]}>Loading comments...</Text>
                </View>
              </View>
            ) : comments.length > 0 ? (
              <View style={[tw.pT3, tw.borderT, tw.borderGray200]}>
                <TouchableOpacity 
                  style={[tw.pY2]}
                  onPress={() => setShowComments(true)}
                >
                  <Text style={[tw.textGray600, tw.fontMedium, tw.textSm, tw.mB2]}>
                    View all {commentCount} comments
                  </Text>
                  {/* Show first 2 comments as preview */}
                  {comments.slice(0, 2).map((comment, index) => (
                    <View key={comment.id} style={[tw.flexRow, tw.mB2]}>
                      <View style={[tw.w8, tw.h8, tw.roundedFull, tw.mR2, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
                        <Text style={[tw.textGray700, tw.fontBold, tw.textXs]}>
                          {getUserInitials(comment.user.firstname, comment.user.lastname)}
                        </Text>
                      </View>
                      <View style={[tw.flex1]}>
                        <Text style={[tw.textGray900, tw.fontMedium, tw.textSm]}>
                          {comment.user.firstname} {comment.user.lastname}
                        </Text>
                        <Text style={[tw.textGray800, tw.textSm]} numberOfLines={2}>
                          {comment.comment}
                        </Text>
                      </View>
                    </View>
                  ))}
                  {commentCount > 2 && (
                    <Text style={[tw.textGray500, tw.textSm, tw.mT1]}>
                      View {commentCount - 2} more comments
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : commentCount === 0 && !commentsLoading ? (
              <View style={[tw.pT3, tw.borderT, tw.borderGray200]}>
                <TouchableOpacity 
                  style={[tw.pY2]}
                  onPress={() => setShowComments(true)}
                >
                  <Text style={[tw.textGray500, tw.textSm]}>
                    Be the first to comment
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Comment Section Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComments(false)}
      >
        <CommentSection
          postId={post.id}
          visible={showComments}
          onClose={() => setShowComments(false)}
        />
      </Modal>
    </Modal>
  );
};

export default SinglePostView; 