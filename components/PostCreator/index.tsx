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
import { useCreatePost } from "@/hooks/useCreatePost";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_MAPS_API_KEY = "AIzaSyBYRk6B2lK6YxM1MNzgvc9nXr6GsCw5CEo";

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
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const captionInputRef = useRef<TextInput>(null);
  
  // Use the create post hook
  const { createPost, loading: isPosting, error, success, reset } = useCreatePost();
  
  // Use the media upload hook
  const { uploadImages, uploadVideos, loading: isUploading, error: uploadError, success: uploadSuccess, reset: resetUpload } = useMediaUpload();

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

  const pickVideos = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets) {
        const newVideos = result.assets.map(asset => asset.uri);
        setSelectedVideos(prev => [...prev, ...newVideos].slice(0, 3)); // Limit to 3 videos
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick videos. Please try again.');
    }
  };

  const recordVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to record videos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedVideos(prev => [...prev, result.assets[0].uri].slice(0, 3));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!caption.trim() && selectedImages.length === 0 && selectedVideos.length === 0) {
      Alert.alert('Empty Post', 'Please add some content, images, or videos to your post.');
      return;
    }

    try {
      let mediaFileIds: number[] = [];
      
      // Upload images if any are selected
      if (selectedImages.length > 0) {
        const uploadedIds = await uploadImages(selectedImages);
        if (uploadedIds) {
          mediaFileIds = [...mediaFileIds, ...uploadedIds];
        } else {
          Alert.alert('Error', uploadError || 'Failed to upload images. Please try again.');
          return;
        }
      }

      // Upload videos if any are selected
      if (selectedVideos.length > 0) {
        const uploadedVideoIds = await uploadVideos(selectedVideos);
        if (uploadedVideoIds) {
          mediaFileIds = [...mediaFileIds, ...uploadedVideoIds];
        } else {
          Alert.alert('Error', uploadError || 'Failed to upload videos. Please try again.');
          return;
        }
      }

      // Create post using the API with media file IDs
      const response = await createPost(caption.trim(), mediaFileIds);
      
      if (response && response.success) {
        // Call the callback with the post data
        const postData = {
          images: selectedImages,
          videos: selectedVideos,
          caption: caption.trim(),
          location: location.trim(),
        };
        
        onPostCreated?.(postData);
        
        // Navigate back
        router.back();
      } else {
        Alert.alert('Error', error || 'Failed to create post. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const canPost = caption.trim().length > 0 || selectedImages.length > 0 || selectedVideos.length > 0;

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
            disabled={!canPost || isPosting || isUploading}
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
              {isPosting || isUploading ? 'Posting...' : 'Post'}
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

            {/* Location Input with Google Places */}
            <View style={[tw.mB4]}>
              <View style={[tw.flexRow, tw.itemsCenter, tw.mB2]}>
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <Text style={[tw.textGray700, tw.fontMedium, tw.mL2]}>
                  Location
                </Text>
              </View>
              <GooglePlacesAutocomplete
                placeholder={config.locationPlaceholder}
                onPress={(data, details = null) => {
                  console.log("Selected location:", data);
                  setLocation(data.description);
                }}
                query={{
                  key: GOOGLE_MAPS_API_KEY,
                  language: 'en',
                  types: 'establishment|geocode',
                }}
                styles={{
                  container: {
                    flex: 0,
                    zIndex: 1,
                  },
                  textInputContainer: {
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    paddingHorizontal: 0,
                  },
                  textInput: {
                    backgroundColor: '#f9fafb',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: '#374151',
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                  },
                  listView: {
                    backgroundColor: 'white',
                    borderRadius: 8,
                    marginTop: 4,
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  },
                  row: {
                    backgroundColor: 'white',
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  },
                  description: {
                    color: '#374151',
                    fontSize: 14,
                  },
                }}
                enablePoweredByContainer={false}
                fetchDetails={true}
                debounce={300}
                minLength={2}
                renderLeftButton={() => (
                  <View style={[tw.justifyCenter, tw.itemsCenter, tw.mL3]}>
                    <Ionicons name="search" size={20} color="#6b7280" />
                  </View>
                )}
                renderRightButton={() => {
                  if (location) {
                    return (
                      <TouchableOpacity
                        style={[tw.justifyCenter, tw.itemsCenter, tw.mR3]}
                        onPress={() => setLocation('')}
                      >
                        <Ionicons name="close-circle" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    );
                  }
                  return null;
                }}
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

            {/* Selected Videos */}
            {selectedVideos.length > 0 && (
              <View style={[tw.mB4]}>
                <Text style={[tw.textGray700, tw.fontMedium, tw.mB2]}>
                  Videos ({selectedVideos.length}/3)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedVideos.map((video, index) => (
                    <View key={index} style={[tw.mR3, tw.relative]}>
                      <View style={[tw.w20, tw.h20, tw.roundedLg, tw.bgGray200, tw.justifyCenter, tw.itemsCenter]}>
                        <Ionicons name="play-circle" size={32} color="#6b7280" />
                      </View>
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
                        onPress={() => removeVideo(index)}
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
              
              <View style={[tw.flexRow, { gap: 12 }]}>
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
                    Photos
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

              <View style={[tw.flexRow, { gap: 12 }, tw.mT3]}>
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
                  onPress={pickVideos}
                >
                  <Ionicons name="videocam-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray700, tw.fontMedium, tw.mL2]}>
                    Videos
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
                  onPress={recordVideo}
                >
                  <Ionicons name="recording-outline" size={20} color="#6b7280" />
                  <Text style={[tw.textGray700, tw.fontMedium, tw.mL2]}>
                    Record
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