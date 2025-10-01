import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, RadioButton, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tw } from 'react-native-tailwindcss';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

import useApiRequest from '@/hooks/useApiRequest';
import { ApiResponse } from '@/types';
import Spinner from '@/components/Spinner';

const BasicProfileScreen: React.FC = () => {
  const router = useRouter();
  const { loading, send, error } = useApiRequest<ApiResponse>();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    gender: '',
    dateOfBirth: '',
    bio: '',
    interestedIn: ''
  });
  
  // Photo management
  const [gallery, setGallery] = useState<any[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean[]>([]);
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Primary colors
  const primaryColor = '#fb6c31';
  const backgroundColor = '#f8f9fa';

  // Gender options
  const genderOptions = [
    { id: 'Male', label: 'Male' },
    { id: 'Female', label: 'Female' },
    // { id: 'Other', label: 'Other' }
  ];

  // Interested In options (for dating profiles)
  const interestedInOptions = [
    { id: 'Male', label: 'Male' },
    { id: 'Female', label: 'Female' },
    { id: 'Both', label: 'Both' },
  ];

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const result = await send('get', '/users/me');
      if (result && !result.errors) {
        setUserProfile(result);
        
        // Initialize form data with existing profile
        setFormData({
          gender: result.gender || '',
          dateOfBirth: result.dateOfBirth || '',
          bio: result.bio || '',
          interestedIn: result.interestedIn || ''
        });
        
        // Initialize gallery with existing photos
        setGallery(result.gallery || []);
        
        // Set date picker to existing date if available
        if (result.dateOfBirth) {
          setSelectedDate(new Date(result.dateOfBirth));
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchUserProfile();
      setIsLoading(false);
    };
    initializeData();
  }, []);

  // Handle date picker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    
    // Format date for API (YYYY-MM-DD)
    const formattedDate = currentDate.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      dateOfBirth: formattedDate
    }));
  };

  // Convert image to base64
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  // Upload single photo
  const uploadPhoto = async (imageUri: string, isFeatured: boolean = false) => {
    try {
      console.log('Uploading photo:', imageUri);
      
      // Convert image to base64
      const base64Content = await convertImageToBase64(imageUri);
      
      // Prepare upload data
      const uploadData = {
        fileContent: base64Content,
        mediaType: 'PHOTO',
        fileRefType: 'PROFILE',
        featured: isFeatured
      };
      
      console.log('Upload data prepared:', { ...uploadData, fileContent: '[BASE64_DATA]' });
      
      // Upload to API
      const result = await send('post', '/media/upload', uploadData);
      
      if (result && !result.errors) {
        console.log('✅ Photo upload successful:', result);
        return result;
      } else {
        console.error('❌ Photo upload failed:', result?.errors);
        throw new Error(result?.errors?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      throw error;
    }
  };

  // Handle image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const isFirstPhoto = gallery.length === 0; // First photo is featured
        
        // Add to gallery with uploading state
        const newPhotoIndex = gallery.length;
        setGallery(prev => [...prev, { uri: imageUri, uploading: true }]);
        setUploadingPhotos(prev => [...prev, true]);
        
        try {
          // Upload photo
          const uploadResult = await uploadPhoto(imageUri, isFirstPhoto);
          
          // Update gallery with uploaded photo data
          setGallery(prev => prev.map((photo, index) => 
            index === newPhotoIndex 
              ? { ...uploadResult.data, uploaded: true }
              : photo
          ));
          
          console.log('Photo uploaded successfully');
        } catch (error) {
          // Remove failed upload from gallery
          setGallery(prev => prev.filter((_, index) => index !== newPhotoIndex));
          Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
        } finally {
          setUploadingPhotos(prev => prev.filter((_, index) => index !== newPhotoIndex));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Remove image from gallery
  const removeImage = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setGallery(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // Submit profile updates (basic fields only)
  const handleSubmit = async () => {
    console.log('=== BASIC PROFILE SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Gallery (photos uploaded separately):', gallery);
    
    // Validation
    if (!formData.gender) {
      Alert.alert('Validation Error', 'Please select your gender.');
      return;
    }
    
    if (!formData.dateOfBirth) {
      Alert.alert('Validation Error', 'Please select your date of birth.');
      return;
    }
    
    // Validate interestedIn for dating profiles
    if ((userProfile?.profileType === 'DATING' || userProfile?.profileTypes?.includes('DATING')) && !formData.interestedIn) {
      Alert.alert('Validation Error', 'Please select who you are interested in.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for API (only basic profile fields)
      const submitData: any = {
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio
      };
      
      // Add interestedIn only for dating profiles
      if (userProfile?.profileType === 'DATING' || userProfile?.profileTypes?.includes('DATING')) {
        submitData.interestedIn = formData.interestedIn;
      }
      
      console.log('Submitting to API:', submitData);
      
      // Submit to API
      const result = await send('put', '/users/profile', submitData);
      
      if (result && !result.errors) {
        console.log('✅ Profile Update Response:', result);
        
        Alert.alert(
          'Success!',
          'Your profile has been updated successfully. Photos are uploaded separately.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        console.error('❌ Profile Update Error:', result?.errors || 'Unknown error');
        
        Alert.alert(
          'Error',
          result?.errors?.message || 'Failed to update your profile. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Submission Error:', error);
      
      Alert.alert(
        'Error',
        'Failed to update your profile. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor }]}>
        <Spinner />
        <Text style={[tw.mT4, tw.textGray600]}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw.flex1, { backgroundColor }]}>
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[tw.textWhite, tw.textLg, tw.fontBold]}>
          Basic Profile
        </Text>
        <View style={[tw.w6]} />
      </View>

      <ScrollView style={[tw.flex1, tw.pX4]} showsVerticalScrollIndicator={false}>
        {/* Gender Selection */}
        <View style={[tw.bgWhite, tw.p4, tw.rounded, tw.mT4, tw.shadow]}>
          <Text style={[tw.textBase, tw.fontBold, tw.mB3, { color: primaryColor }]}>
            Gender
          </Text>
          
          <RadioButton.Group
            value={formData.gender}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[tw.flexRow, tw.itemsCenter, tw.p2, tw.rounded, tw.mB1]}
                onPress={() => setFormData(prev => ({ ...prev, gender: option.id }))}
              >
                <RadioButton
                  value={option.id}
                  color={primaryColor}
                />
                <Text style={[tw.mL2, tw.flex1, tw.textSm]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </RadioButton.Group>
        </View>

        {/* Interested In (only for dating profiles) */}
        {(userProfile?.profileType === 'DATING' || userProfile?.profileTypes?.includes('DATING')) && (
          <View style={[tw.bgWhite, tw.p4, tw.rounded, tw.mT3, tw.shadow]}>
            <Text style={[tw.textBase, tw.fontBold, tw.mB3, { color: primaryColor }]}>
              Interested In
            </Text>
            
            <RadioButton.Group
              value={formData.interestedIn}
              onValueChange={(value) => setFormData(prev => ({ ...prev, interestedIn: value }))}
            >
              {interestedInOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[tw.flexRow, tw.itemsCenter, tw.p2, tw.rounded, tw.mB1]}
                  onPress={() => setFormData(prev => ({ ...prev, interestedIn: option.id }))}
                >
                  <RadioButton
                    value={option.id}
                    color={primaryColor}
                  />
                  <Text style={[tw.mL2, tw.flex1, tw.textSm]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </View>
        )}

        {/* Date of Birth */}
        <View style={[tw.bgWhite, tw.p4, tw.rounded, tw.mT3, tw.shadow]}>
          <Text style={[tw.textBase, tw.fontBold, tw.mB3, { color: primaryColor }]}>
            Date of Birth
          </Text>
          
          <TouchableOpacity
            style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p3, tw.bgGray100, tw.rounded]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[tw.textSm, tw.textGray700]}>
              {formData.dateOfBirth 
                ? new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Select your date of birth'
              }
            </Text>
            <Ionicons name="calendar-outline" size={20} color={primaryColor} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Bio */}
        <View style={[tw.bgWhite, tw.p4, tw.rounded, tw.mT3, tw.shadow]}>
          <Text style={[tw.textBase, tw.fontBold, tw.mB3, { color: primaryColor }]}>
            Bio
          </Text>
          
          <Text style={[tw.textSm, tw.textGray600, tw.mB3]}>
            Tell others about yourself (optional)
          </Text>
          
          <TextInput
            style={[
              tw.bgGray100,
              tw.p3,
              tw.rounded,
              tw.textSm,
              tw.textGray700,
              { minHeight: 80, textAlignVertical: 'top' }
            ]}
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            placeholder="Write a short bio about yourself..."
            placeholderTextColor="#9ca3af"
            multiline={true}
            numberOfLines={4}
            maxLength={500}
          />
          
          <Text style={[tw.textXs, tw.textGray500, tw.mT1, tw.textRight]}>
            {formData.bio.length}/500 characters
          </Text>
        </View>

        {/* Profile Photos */}
        <View style={[tw.bgWhite, tw.p4, tw.rounded, tw.mT3, tw.shadow]}>
          <Text style={[tw.textBase, tw.fontBold, tw.mB3, { color: primaryColor }]}>
            Profile Photos
          </Text>
          
          <Text style={[tw.textSm, tw.textGray600, tw.mB3]}>
            Add photos to your profile (up to 6 photos)
          </Text>
          
          {/* Photo Grid */}
          <View style={[tw.flexRow, tw.flexWrap, { gap: 8 }]}>
            {gallery.map((photo, index) => (
              <View key={index} style={[tw.relative, tw.w20, tw.h20, tw.rounded, tw.overflowHidden]}>
                <Image
                  source={{ uri: photo.uri || photo.mediaUrl }}
                  style={[tw.wFull, tw.hFull]}
                  resizeMode="cover"
                />
                
                {/* Upload status indicator */}
                {photo.uploading && (
                  <View style={[tw.absolute, tw.inset0, tw.bgBlack, tw.opacity50, tw.itemsCenter, tw.justifyCenter]}>
                    <Spinner />
                  </View>
                )}
                
                {/* Featured indicator */}
                {photo.featured && (
                  <View style={[tw.absolute, { top: 4, left: 4 }, tw.bgYellow500, tw.roundedFull, tw.p1]}>
                    <Ionicons name="star" size={12} color="white" />
                  </View>
                )}
                
                <TouchableOpacity
                  style={[tw.absolute, { top: 4, right: 4 }, tw.bgRed500, tw.roundedFull, tw.p1]}
                  onPress={() => removeImage(index)}
                  disabled={photo.uploading}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Add Photo Button */}
            {gallery.length < 6 && (
              <TouchableOpacity
                style={[tw.w20, tw.h20, tw.bgGray200, tw.rounded, tw.itemsCenter, tw.justifyCenter, tw.border2, tw.borderDashed, tw.borderGray400]}
                onPress={pickImage}
              >
                <Ionicons name="camera-outline" size={24} color={primaryColor} />
                <Text style={[tw.textXs, tw.textCenter, tw.textGray600, tw.mT1]}>
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[tw.textXs, tw.textGray500, tw.mT2]}>
            {gallery.length}/6 photos added
            {gallery.some(photo => photo.uploading) && ' • Uploading...'}
          </Text>
        </View>

        {/* Submit Button */}
        <View style={[tw.mT6, tw.mB4]}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[tw.pY2]}
            buttonColor={primaryColor}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BasicProfileScreen;
