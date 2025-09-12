import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';
import { useRouter } from 'expo-router';
import ImageWithFallback from '@/components/ImageWithFallback';
import { getUserInitials } from '@/utils/userInitials';
import useApiRequest from '@/hooks/useApiRequest';
import { ApiResponse } from '@/types';

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  gender: string;
  interestedIn: string;
  dateOfBirth: string;
  publicFigure: boolean;
  latitude: number;
  longitude: number;
  profileType: string;
  profileTypes: string[];
  hasPendingRequest: boolean;
  friend: boolean;
}

interface UserProfileViewProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({
  visible,
  onClose,
  userId
}) => {
  const router = useRouter();
  const { loading, send } = useApiRequest<ApiResponse>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Format distance (if we had location data)
  const formatDistance = (lat: number, lng: number) => {
    // This would require the current user's location to calculate distance
    // For now, just return a placeholder
    return "Distance not available";
  };

  // Get profile display name
  const getDisplayName = () => {
    if (!profile) return '';
    return `${profile.firstname} ${profile.lastname}`;
  };

  // Get profile type display
  const getProfileTypeDisplay = () => {
    if (!profile) return '';
    const types = profile.profileTypes || [profile.profileType];
    return types.map(type => {
      switch (type.toUpperCase()) {
        case 'DATING': return 'Dating';
        case 'NETWORKING': return 'Networking';
        case 'TRAVEL': return 'Travel';
        default: return type;
      }
    }).join(', ');
  };

  // Fetch user profile
  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      setLoadingProfile(true);
      setError(null);
      
      const result = await send('get', `/profile/${userId}`);
      
      if (result?.errors) {
        setError(result.errors);
        return;
      }
      
      if (result) {
        setProfile(result);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch profile when modal opens
  useEffect(() => {
    if (visible && userId) {
      fetchProfile();
    }
  }, [visible, userId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setProfile(null);
      setError(null);
    }
  }, [visible]);

  const handleConnect = () => {
    // TODO: Implement connection request
    Alert.alert('Connect', 'Connection request feature coming soon!');
  };

  const handleMessage = () => {
    // TODO: Implement messaging
    Alert.alert('Message', 'Messaging feature coming soon!');
  };

  const handleViewPosts = () => {
    // TODO: Navigate to user's posts
    Alert.alert('Posts', 'View user posts feature coming soon!');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[tw.flex1, tw.bgGray100]}>
        {/* Header */}
        <View style={[tw.bgWhite, tw.pX4, tw.pT12, tw.pB4, tw.borderB, tw.borderGray200, tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={[tw.textGray900, tw.textLg, tw.fontBold]}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView style={[tw.flex1]} showsVerticalScrollIndicator={false}>
          {loadingProfile ? (
            <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
              <ActivityIndicator size="large" color="#fb6c31" />
              <Text style={[tw.textGray500, tw.textBase, tw.mT4]}>Loading profile...</Text>
            </View>
          ) : error ? (
            <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text style={[tw.textRed500, tw.textLg, tw.fontMedium, tw.mT2, tw.textCenter]}>
                Failed to load profile
              </Text>
              <Text style={[tw.textGray500, tw.textSm, tw.mT1, tw.textCenter]}>
                {error}
              </Text>
              <TouchableOpacity 
                style={[tw.bgRed500, tw.pX4, tw.pY2, tw.roundedLg, tw.mT4]}
                onPress={fetchProfile}
              >
                <Text style={[tw.textWhite, tw.fontMedium]}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : profile ? (
            <View style={[tw.p4]}>
              {/* Profile Header */}
              <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                <View style={[tw.flexRow, tw.itemsCenter, tw.mB4]}>
                  <View style={[tw.w20, tw.h20, tw.roundedFull, tw.bgGray300, tw.justifyCenter, tw.itemsCenter, tw.mR4]}>
                    <Text style={[tw.textGray700, tw.fontBold, tw.textLg]}>
                      {getUserInitials(profile.firstname, profile.lastname)}
                    </Text>
                  </View>
                  <View style={[tw.flex1]}>
                    <Text style={[tw.textGray900, tw.fontBold, tw.textXl]}>{getDisplayName()}</Text>
                    <Text style={[tw.textGray600, tw.textBase, tw.mT1]}>
                      {profile.publicFigure ? 'Public Figure' : 'Regular User'}
                    </Text>
                    <Text style={[tw.textGray500, tw.textSm, tw.mT1]}>
                      {getProfileTypeDisplay()}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={[tw.flexRow, tw.spaceX3]}>
                  <TouchableOpacity
                    style={[tw.flex1, tw.bgPink700, tw.roundedLg, tw.pY3, tw.flexRow, tw.itemsCenter, tw.justifyCenter]}
                    onPress={handleConnect}
                  >
                    <Ionicons name="person-add" size={20} color="white" />
                    <Text style={[tw.textWhite, tw.fontMedium, tw.mL2]}>
                      {profile.hasPendingRequest ? 'Pending' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[tw.flex1, tw.bgBlue500, tw.roundedLg, tw.pY3, tw.flexRow, tw.itemsCenter, tw.justifyCenter]}
                    onPress={handleMessage}
                  >
                    <Ionicons name="chatbubble" size={20} color="white" />
                    <Text style={[tw.textWhite, tw.fontMedium, tw.mL2]}>Message</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Profile Details */}
              <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB4]}>Profile Details</Text>
                
                <View style={[tw.flexRow, tw.justifyBetween, tw.mB3]}>
                  <Text style={[tw.textGray600, tw.textBase]}>Gender:</Text>
                  <Text style={[tw.textGray900, tw.textBase, tw.fontMedium]}>{profile.gender}</Text>
                </View>
                
                {profile.interestedIn && (
                  <View style={[tw.flexRow, tw.justifyBetween, tw.mB3]}>
                    <Text style={[tw.textGray600, tw.textBase]}>Interested In:</Text>
                    <Text style={[tw.textGray900, tw.textBase, tw.fontMedium]}>{profile.interestedIn}</Text>
                  </View>
                )}
                
                {profile.dateOfBirth && (
                  <View style={[tw.flexRow, tw.justifyBetween, tw.mB3]}>
                    <Text style={[tw.textGray600, tw.textBase]}>Age:</Text>
                    <Text style={[tw.textGray900, tw.textBase, tw.fontMedium]}>
                      {calculateAge(profile.dateOfBirth)} years old
                    </Text>
                  </View>
                )}
                
                <View style={[tw.flexRow, tw.justifyBetween, tw.mB3]}>
                  <Text style={[tw.textGray600, tw.textBase]}>Account Type:</Text>
                  <Text style={[tw.textGray900, tw.textBase, tw.fontMedium]}>
                    {profile.publicFigure ? 'Public Figure' : 'Regular User'}
                  </Text>
                </View>
                
                {profile.profileTypes && profile.profileTypes.length > 0 && (
                  <View style={[tw.mT3]}>
                    <Text style={[tw.textGray600, tw.textBase, tw.mB2]}>Profile Types:</Text>
                    <View style={[tw.flexRow, tw.flexWrap]}>
                      {profile.profileTypes.map((type, index) => (
                        <View key={index} style={[tw.bgGray200, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
                          <Text style={[tw.textGray700, tw.textXs, tw.fontMedium]}>
                            {type === 'DATING' ? 'Dating' : 
                             type === 'NETWORKING' ? 'Networking' : 
                             type === 'TRAVEL' ? 'Travel' : type}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Additional Actions */}
              <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB4]}>More Actions</Text>
                
                <TouchableOpacity
                  style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pY3, tw.borderB, tw.borderGray200]}
                  onPress={handleViewPosts}
                >
                  <View style={[tw.flexRow, tw.itemsCenter]}>
                    <Ionicons name="images" size={20} color="#6b7280" />
                    <Text style={[tw.textGray900, tw.textBase, tw.mL3]}>View Posts</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.pY3]}
                  onPress={() => {
                    // TODO: Implement report user
                    Alert.alert('Report', 'Report user feature coming soon!');
                  }}
                >
                  <View style={[tw.flexRow, tw.itemsCenter]}>
                    <Ionicons name="flag" size={20} color="#6b7280" />
                    <Text style={[tw.textGray900, tw.textBase, tw.mL3]}>Report User</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default UserProfileView;
