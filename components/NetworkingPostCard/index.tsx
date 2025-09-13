import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getUserInitials } from "@/utils/userInitials";
import { NetworkingPost } from "../NetworkingCard";

interface NetworkingPostCardProps {
  post: NetworkingPost;
  onPress?: () => void;
  onToggleBookmark?: (postId: number) => void;
  formatNumber?: (num: number) => string;
}

const NetworkingPostCard: React.FC<NetworkingPostCardProps> = ({ 
  post, 
  onPress,
  onToggleBookmark,
  formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString()
}) => {
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

  return (
    <TouchableOpacity 
      style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4, tw.overflowHidden]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.pB2]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <View style={[tw.w10, tw.h10, tw.roundedFull, tw.mR3, tw.overflowHidden]}>
            {post.user.avatar ? (
              <ImageWithFallback
                source={{ uri: post.user.avatar }}
                style={[tw.wFull, tw.hFull]}
                resizeMode="cover"
                fallbackSource={null}
              />
            ) : (
              <View style={[tw.wFull, tw.hFull, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
                <Text style={[tw.textGray700, tw.fontBold, tw.textSm]}>
                  {getUserInitials(post.user.name.split(' ')[0] || '', post.user.name.split(' ')[1] || '')}
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text style={[tw.textGray900, tw.fontBold, tw.textBase]}>{post.user.name}</Text>
            <Text style={[tw.textGray700, tw.textSm]}>{post.user.headline}</Text>
            {post.location && (
              <Text style={[tw.textGray500, tw.textXs]}>{post.location}</Text>
            )}
            <Text style={[tw.textGray500, tw.textSm]}>{post.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onToggleBookmark?.(post.id)}>
          <Ionicons
            name={post.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={post.isBookmarked ? "#fb6c31" : "#6b7280"}
          />
        </TouchableOpacity>
      </View>

      {/* Images */}
      <View style={[tw.pX4, tw.pB2]}>
        {post.images.length === 1 && (
          <Image
            source={{ uri: post.images[0] }}
            style={[tw.wFull, { height: 240 }, tw.roundedLg]}
            resizeMode="cover"
          />
        )}
        {post.images.length === 2 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {post.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={[{ width: '50%', height: 180, borderRadius: 12 }]}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
        {post.images.length >= 3 && (
          <View style={{ flexDirection: 'row', gap: 8, height: 200 }}>
            <Image
              source={{ uri: post.images[0] }}
              style={[{ width: '66%', height: '100%', borderRadius: 12 }]}
              resizeMode="cover"
            />
            <View style={{ width: '33%', justifyContent: 'space-between' }}>
              {[post.images[1], post.images[2]].map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={[{ width: '100%', height: '48%', borderRadius: 12 }]}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={[tw.pX4, tw.pB3]}>
          <Text style={[tw.textGray800, tw.textBase]} numberOfLines={4}>
            <Text style={[tw.fontBold]}>{post.user.name}</Text>
            <Text> {renderCaptionWithHashtags(post.caption)}</Text>
          </Text>
        </View>
      )}

      {/* Engagement Metrics */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pX4, tw.pB4]}>
        <View style={[tw.flexRow, tw.itemsCenter]}>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <Ionicons name="heart-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(post.likes)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter, tw.mR6]}>
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(post.comments)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[tw.flexRow, tw.itemsCenter]}>
            <Ionicons name="arrow-redo-outline" size={20} color="#6b7280" />
            <Text style={[tw.textGray600, tw.textSm, tw.mL1]}>{formatNumber(post.shares)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NetworkingPostCard; 