import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

interface PostCreatorProps {
  profileType: 'travel' | 'networking' | 'dating' | null;
  onPostCreated?: (postData: {
    images: string[];
    caption: string;
    location: string;
  }) => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ profileType, onPostCreated }) => {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const captionInputRef = useRef<TextInput>(null);

  const getProfileTypeConfig = () => {
    switch (profileType) {
      case 'travel':
        return {
          title: "Share Your Journey",
          placeholder: "What's your travel story? Share your experiences, tips, or memories...",
          locationPlaceholder: "Where are you?",
          icon: "airplane",
          color: "bg-blue-500",
        };
      case 'networking':
        return {
          title: "Share Your Experience",
          placeholder: "Share about events, conferences, workshops, or networking experiences...",
          locationPlaceholder: "Event location",
          icon: "business",
          color: "bg-purple-500",
        };
      case 'dating':
        return {
          title: "Share Your Moment",
          placeholder: "Share your dating experiences, tips, or memorable moments...",
          locationPlaceholder: "Where are you?",
          icon: "heart",
          color: "bg-pink-500",
        };
      default:
        return {
          title: "Create Post",
          placeholder: "What's on your mind?",
          locationPlaceholder: "Location",
          icon: "create",
          color: "bg-gray-500",
        };
    }
  };

  const config = getProfileTypeConfig();

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5)); // Limit to 5 images
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImages(prev => [...prev, result.assets[0].uri].slice(0, 5));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!caption.trim() && selectedImages.length === 0) {
      Alert.alert('Empty Post', 'Please add some content or images to your post.');
      return;
    }

    setIsPosting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const postData = {
        images: selectedImages,
        caption: caption.trim(),
        location: location.trim(),
      };

      onPostCreated?.(postData);
      
      // Navigate back
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = caption.trim().length > 0 || selectedImages.length > 0;

  return (
    <SafeAreaView style={[tw.flex1, tw.bgWhite]}>
      <KeyboardAvoidingView 
        style={[tw.flex1]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, tw.borderB, tw.borderGray200]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <View style={[tw.flexRow, tw.itemsCenter]}>
            <View style={[tw.w8, tw.h8, tw.roundedFull, config.color, tw.justifyCenter, tw.itemsCenter, tw.mR2]}>
              <Ionicons name={config.icon as any} size={16} color="white" />
            </View>
            <Text style={[tw.textGray900, tw.fontBold, tw.textLg]}>{config.title}</Text>
          </View>
          
          <TouchableOpacity
            onPress={handlePost}
            disabled={!canPost || isPosting}
            style={[
              tw.pX4,
              tw.pY2,
              tw.roundedFull,
              canPost ? tw.bgBlue500 : tw.bgGray300,
            ]}
          >
            <Text style={[
              tw.fontBold,
              canPost ? tw.textWhite : tw.textGray500,
            ]}>
              {isPosting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={[tw.flex1]} showsVerticalScrollIndicator={false}>
          {/* Content */}
          <View style={[tw.p4]}>
            {/* Caption Input */}
            <TextInput
              ref={captionInputRef}
              style={[
                tw.textBase,
                tw.textGray900,
                tw.minH32,
                tw.p0,
                tw.mB4,
              ]}
              placeholder={config.placeholder}
              placeholderTextColor="#9ca3af"
              value={caption}
              onChangeText={setCaption}
              multiline
              textAlignVertical="top"
              autoFocus
            />

            {/* Location Input */}
            <View style={[tw.flexRow, tw.itemsCenter, tw.mB4]}>
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <TextInput
                style={[
                  tw.flex1,
                  tw.textBase,
                  tw.textGray700,
                  tw.mL2,
                ]}
                placeholder={config.locationPlaceholder}
                placeholderTextColor="#9ca3af"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Selected Images */}
            {selectedImages.length > 0 && (
              <View style={[tw.mB4]}>
                <Text style={[tw.textGray700, tw.fontMedium, tw.mB2]}>
                  Images ({selectedImages.length}/5)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={[tw.mR3, tw.relative]}>
                      <Image
                        source={{ uri: image }}
                        style={[tw.w20, tw.h20, tw.roundedLg]}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={[
                          tw.absolute,
                          { top: -8, right: -8 },
                          tw.bgRed500,
                          tw.roundedFull,
                          tw.w6,
                          tw.h6,
                          tw.justifyCenter,
                          tw.itemsCenter,
                        ]}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Media Options */}
            <View style={[tw.borderT, tw.borderGray200, tw.pT4]}>
              <Text style={[tw.textGray700, tw.fontMedium, tw.mB3]}>
                Add Media
              </Text>
              
              <View style={[tw.flexRow, tw.spaceX4]}>
                <TouchableOpacity
                  style={[
                    tw.flex1,
                    tw.flexRow,
                    tw.itemsCenter,
                    tw.justifyCenter,
                    tw.pY3,
                    tw.border,
                    tw.borderGray300,
                    tw.roundedLg,
                  ]}
                  onPress={pickImages}
                >
                  <Ionicons name="images-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray700, tw.fontMedium, tw.mL2]}>
                    Gallery
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    tw.flex1,
                    tw.flexRow,
                    tw.itemsCenter,
                    tw.justifyCenter,
                    tw.pY3,
                    tw.border,
                    tw.borderGray300,
                    tw.roundedLg,
                  ]}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray700, tw.fontMedium, tw.mL2]}>
                    Camera
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostCreator; 