import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';
import { Comment, CreateCommentRequest, CommentListResponse } from '@/types';
import { getUserInitials } from '@/utils/userInitials';
import { getTimeAgo } from '@/utils/timeAgo';
import useApiRequest from '@/hooks/useApiRequest';

interface CommentSectionProps {
  postId: number;
  visible: boolean;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  visible,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { send } = useApiRequest<CommentListResponse>();

  // Load comments
  const loadComments = async (page = 1, append = false) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const response = await send('post', `/comment/list-by-post/${postId}`, {
        page: page,
        pageSize: 10,
      });
      
      if (response?.success && response?.list) {
        if (append) {
          setComments(prev => [...prev, ...response.list]);
        } else {
          setComments(response.list);
        }
        setHasMore(response.currentPage < response.totalPages);
        setCurrentPage(response.currentPage);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Submit new comment
  const submitComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    try {
      setSubmitting(true);
      const commentData: CreateCommentRequest = {
        comment: newComment.trim(),
        postId: postId,
      };
      
      const response = await send('post', '/comment/save', commentData);
      
      if (response?.success) {
        setNewComment('');
        // Reload comments to show the new comment
        loadComments(1, false);
      } else {
        Alert.alert('Error', response?.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Load comments when component mounts or postId changes
  useEffect(() => {
    if (visible && postId) {
      loadComments(1, false);
    }
  }, [visible, postId]);

  // Refresh comments when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadComments(1, false);
    }
  }, [visible]);

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[tw.flexRow, tw.p4, tw.borderB, tw.borderGray100]}>
      {/* User Avatar */}
      <View style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
        <Text style={[tw.textGray700, tw.fontBold, tw.textSm]}>
          {getUserInitials(item.user.firstname, item.user.lastname)}
        </Text>
      </View>
      
      {/* Comment Content */}
      <View style={[tw.flex1]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.mB1]}>
          <Text style={[tw.textGray900, tw.fontBold, tw.textSm]}>
            {item.user.firstname} {item.user.lastname}
          </Text>
          <Text style={[tw.textGray500, tw.textXs, tw.mL2]}>
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>
        <Text style={[tw.textGray800, tw.textSm]}>
          {item.comment}
        </Text>
      </View>
    </View>
  );

  const loadMoreComments = () => {
    if (hasMore && !loading) {
      loadComments(currentPage + 1, true);
    }
  };

  if (!visible) return null;

  return (
    <View style={[tw.flex1, tw.bgWhite]}>
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.borderB, tw.borderGray200]}>
        <Text style={[tw.textGray900, tw.fontBold, tw.textLg]}>Comments</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id.toString()}
        style={[tw.flex1]}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreComments}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => 
          loading ? (
            <View style={[tw.pY4, tw.itemsCenter]}>
              <ActivityIndicator size="small" color="#fb6c31" />
            </View>
          ) : null
        }
        ListEmptyComponent={() => 
          !loading ? (
            <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
              <Ionicons name="chatbubble-outline" size={48} color="#9ca3af" />
              <Text style={[tw.textGray500, tw.textLg, tw.fontMedium, tw.mT4, tw.textCenter]}>
                No comments yet
              </Text>
              <Text style={[tw.textGray400, tw.textBase, tw.mT2, tw.textCenter]}>
                Be the first to comment!
              </Text>
            </View>
          ) : null
        }
      />

      {/* Comment Input */}
      <View style={[tw.p4, tw.borderT, tw.borderGray200, tw.bgGray100]}>
        <View style={[tw.flexRow, tw.itemsEnd]}>
          <View style={[tw.flex1, tw.mR3]}>
            <TextInput
              style={[
                tw.bgWhite,
                tw.border,
                tw.borderGray300,
                tw.roundedLg,
                tw.pX4,
                tw.pY3,
                tw.textBase,
                tw.textGray900,
                { minHeight: 40, maxHeight: 100 }
              ]}
              placeholder="Write a comment..."
              placeholderTextColor="#9ca3af"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            style={[
              tw.bgPink700,
              tw.roundedLg,
              tw.pX4,
              tw.pY3,
              tw.justifyCenter,
              tw.itemsCenter,
              { minHeight: 40 },
              (!newComment.trim() || submitting) && tw.opacity50
            ]}
            onPress={submitComment}
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[tw.textGray400, tw.textXs, tw.mT2, tw.textRight]}>
          {newComment.length}/500
        </Text>
      </View>
    </View>
  );
};

export default CommentSection; 