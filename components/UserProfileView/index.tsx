import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';
import { useRouter } from 'expo-router';
import ImageWithFallback from '@/components/ImageWithFallback';
import PhotoViewer from '@/components/PhotoViewer';
import { getUserInitials } from '@/utils/userInitials';
import useApiRequest from '@/hooks/useApiRequest';
import useCurrentUserProfile from '@/hooks/useCurrentUserProfile';
import { ApiResponse } from '@/types';

interface GalleryItem {
  id: number;
  thumbnailUrl: string;
  mediaUrl: string;
  fileName: string;
  featured: boolean;
  mediaType: string;
}

interface Answer {
  id: number;
  text: string;
}

interface ProfileAnswer {
  id: number;
  question: string;
  answers: Answer[];
}

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  gender: string;
  interestedIn: string;
  bio?: string;
  dateOfBirth: string;
  gallery?: GalleryItem[];
  publicFigure: boolean;
  latitude: number;
  longitude: number;
  profileType: string;
  profileTypes: string[];
  hasPendingRequest: boolean;
  answers?: ProfileAnswer[];
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
  const { profile: currentUserProfile, fetchProfile: fetchCurrentUserProfile, loading: loadingCurrentUser } = useCurrentUserProfile();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [sendingRequest, setSendingRequest] = useState(false);

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

  // Get featured image from gallery
  const getFeaturedImage = () => {
    if (!profile?.gallery || profile.gallery.length === 0) return null;
    const featured = profile.gallery.find(item => item.featured);
    return featured ? featured.mediaUrl : profile.gallery[0].mediaUrl;
  };

  // Get profile image (featured or first gallery image)
  const getProfileImage = () => {
    return getFeaturedImage();
  };

  // Check if answers match between two profiles
  const doAnswersMatch = (userAnswer: Answer, currentUserAnswer: Answer) => {
    return userAnswer.id === currentUserAnswer.id;
  };

  // Find matching questions between profiles
  const getMatchingQuestions = () => {
    if (!profile?.answers || !currentUserProfile?.answers) return [];
    
    const matchingQuestions = profile.answers.map(userAnswer => {
      const currentUserAnswer = currentUserProfile.answers?.find(
        curr => curr.id === userAnswer.id
      );
      
      if (!currentUserAnswer) return null;
      
      const matchingAnswers = userAnswer.answers.filter(userAns =>
        currentUserAnswer.answers.some(currAns => 
          doAnswersMatch(userAns, currAns)
        )
      );
      
      return {
        question: userAnswer.question,
        userAnswers: userAnswer.answers,
        currentUserAnswers: currentUserAnswer.answers,
        matchingAnswers,
        hasMatches: matchingAnswers.length > 0
      };
    }).filter(Boolean);
    
    return matchingQuestions;
  };

  // Calculate compatibility percentage
  const getCompatibilityPercentage = () => {
    const matchingQuestions = getMatchingQuestions();
    if (matchingQuestions.length === 0) return 0;
    
    const questionsWithMatches = matchingQuestions.filter(q => q && q.hasMatches).length;
    return Math.round((questionsWithMatches / matchingQuestions.length) * 100);
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
        setProfile(result as unknown as UserProfile);
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

  const handleConnect = async () => {
    if (!profile || sendingRequest) return;
    try {
      setSendingRequest(true);
      const response = await send('post', '/friendship/request', {
        receiverId: profile.id
      });
      if (response?.success || response?.id) {
        setProfile(prev => prev ? { ...prev, hasPendingRequest: true } as UserProfile : prev);
        Alert.alert('Success', 'Friend request sent!');
      } else {
        Alert.alert('Error', response?.message || 'Failed to send friend request. Please try again.');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleMessage = async () => {
    if (!profile) return;
    const payload: any = {
      id: profile.id,
      firstName: profile.firstname || '',
      firstname: profile.firstname || '',
      middleName: '',
      lastName: profile.lastname || '',
      lastname: profile.lastname || '',
      // Intentionally omit avatar so chat uses the real chat path (non-networking)
      mediaList: Array.isArray(profile.gallery) ? profile.gallery.map((g) => ({
        id: g.id,
        thumbnailUrl: g.thumbnailUrl,
        mediaUrl: g.mediaUrl || g.thumbnailUrl,
        fileName: g.fileName,
        featured: !!g.featured,
        mediaType: g.mediaType || 'PHOTO',
      })) : [],
    };
    let currentId = currentUserProfile?.id;
    if (!currentId) {
      try {
        const me: any = await send('get', '/users/me');
        currentId = me?.id;
      } catch (e) {
        console.error('Failed to fetch current user id for chat:', e);
      }
    }
    if (!currentId) {
      Alert.alert('Error', 'Unable to open chat. Please try again.');
      return;
    }
    router.push({ pathname: '/chats/room', params: { user: JSON.stringify(payload), currentUserId: String(currentId) } });
  };

  const handleViewPosts = () => {
    // TODO: Navigate to user's posts
    Alert.alert('Posts', 'View user posts feature coming soon!');
  };

  const handlePhotoPress = (photoIndex: number) => {
    setSelectedPhotoIndex(photoIndex);
    setShowPhotoViewer(true);
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
                  <View style={[tw.w20, tw.h20, tw.roundedFull, tw.mR4, tw.overflowHidden]}>
                    {getProfileImage() ? (
                      <ImageWithFallback
                        source={{ uri: getProfileImage()! }}
                        style={[tw.wFull, tw.hFull]}
                        resizeMode="cover"
                        fallbackSource={null}
                      />
                    ) : (
                      <View style={[tw.wFull, tw.hFull, tw.bgGray300, tw.justifyCenter, tw.itemsCenter]}>
                        <Text style={[tw.textGray700, tw.fontBold, tw.textLg]}>
                          {getUserInitials(profile.firstname, profile.lastname)}
                        </Text>
                      </View>
                    )}
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

                {/* Bio Section */}
                {profile.bio && (
                  <View style={[tw.mB4]}>
                    <Text style={[tw.textGray900, tw.fontBold, tw.textBase, tw.mB2]}>About</Text>
                    <Text style={[tw.textGray700, tw.textBase]}>{profile.bio}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                {/* <View style={[tw.flexRow, tw.spaceX3]}>
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
                </View> */}
              </View>

              {/* Friendship Status & Actions */}
              <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
                  <View style={[tw.flexRow, tw.itemsCenter]}>
                    <Ionicons 
                      name={profile.friend ? 'checkmark-done-circle' : profile.hasPendingRequest ? 'time' : 'person-add'} 
                      size={20} 
                      color={profile.friend ? '#10b981' : profile.hasPendingRequest ? '#f59e0b' : '#fb6c31'} 
                    />
                    <Text style={[tw.mL2, tw.textGray900, tw.fontMedium]}>
                      {profile.friend ? 'You are friends' : profile.hasPendingRequest ? 'Friend request pending' : 'Not friends'}
                    </Text>
                  </View>
                  <View style={[tw.flexRow, tw.itemsCenter]}>
                    {profile.friend && (
                      <TouchableOpacity
                        style={[tw.bgBlue500, tw.roundedLg, tw.pX4, tw.pY2, tw.mR2]}
                        onPress={handleMessage}
                      >
                        <Text style={[tw.textWhite, tw.fontMedium]}>Message</Text>
                      </TouchableOpacity>
                    )}
                    {!profile.friend && !profile.hasPendingRequest && (
                      <TouchableOpacity
                        style={[tw.bgPink700, tw.roundedLg, tw.pX4, tw.pY2, sendingRequest ? tw.opacity50 : null]}
                        onPress={handleConnect}
                        disabled={sendingRequest}
                      >
                        <Text style={[tw.textWhite, tw.fontMedium]}>{sendingRequest ? 'Sending...' : 'Add Friend'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Profile Details */}
              <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB4]}>Profile Details</Text>
                
                <View style={[tw.flexRow, tw.justifyBetween, tw.mB3]}>
                  <Text style={[tw.textGray600, tw.textBase]}>Gender:</Text>
                  <Text style={[tw.textGray900, tw.textBase, tw.fontMedium]}>{profile.gender}</Text>
                </View>
                
                {/* {profile.interestedIn && (
                  <View style={[tw.flexRow, tw.justifyBetween, tw.mB3]}>
                    <Text style={[tw.textGray600, tw.textBase]}>Interested In:</Text>
                    <Text style={[tw.textGray900, tw.textBase, tw.fontMedium]}>{profile.interestedIn}</Text>
                  </View>
                )} */}
                
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

              {/* Gallery Section */}
              {profile.gallery && profile.gallery.length > 0 && (
                <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                  <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB4]}>Photos</Text>
                  <View style={[tw.flexRow, tw.flexWrap, { gap: 8 }]}>
                    {profile.gallery.slice(0, 6).map((item, index) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[tw.roundedLg, tw.overflowHidden, { width: '30%', aspectRatio: 1 }]}
                        onPress={() => handlePhotoPress(index)}
                      >
                        <ImageWithFallback
                          source={{ uri: item.thumbnailUrl }}
                          style={[tw.wFull, tw.hFull]}
                          resizeMode="cover"
                          fallbackSource={null}
                        />
                        {index === 5 && profile.gallery && profile.gallery.length > 6 && (
                          <View style={[tw.absolute, tw.inset0, tw.bgBlack, tw.opacity50, tw.justifyCenter, tw.itemsCenter]}>
                            <Text style={[tw.textWhite, tw.fontBold, tw.textLg]}>
                              +{profile.gallery.length - 6}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Profile Answers Section */}
              {profile.answers && profile.answers.length > 0 && (
                <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                  <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB4]}>Profile Questions</Text>
                  {profile.answers.slice(0, 3).map((answer, index) => (
                    <View key={answer.id} style={[tw.mB4, index === 2 ? tw.mB0 : tw.mB4]}>
                      <Text style={[tw.textGray700, tw.fontMedium, tw.textBase, tw.mB2]}>
                        {answer.question}
                      </Text>
                      <View style={[tw.flexRow, tw.flexWrap]}>
                        {answer.answers.map((ans, ansIndex) => (
                          <View key={ans.id} style={[tw.bgGray100, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
                            <Text style={[tw.textGray700, tw.textSm]}>{ans.text}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                  {profile.answers.length > 3 && (
                    <TouchableOpacity
                      style={[tw.itemsCenter, tw.mT2]}
                      onPress={async () => {
                        // Fetch current user profile when opening questions modal
                        if (!currentUserProfile) {
                          await fetchCurrentUserProfile();
                        }
                        setShowQuestionsModal(true);
                      }}
                    >
                      <Text style={[tw.textPink700, tw.fontMedium]}>
                        View all {profile.answers.length} questions
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Additional Actions */}
              {/* <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
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
              </View> */}
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* Profile Questions Modal */}
      <Modal
        visible={showQuestionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQuestionsModal(false)}
      >
        <View style={[tw.flex1, tw.bgGray100]}>
          {/* Header */}
          <View style={[tw.bgWhite, tw.pX4, tw.pT12, tw.pB4, tw.borderB, tw.borderGray200, tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
            <TouchableOpacity onPress={() => setShowQuestionsModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={[tw.textGray900, tw.textLg, tw.fontBold]}>Profile Questions</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Content */}
          <ScrollView style={[tw.flex1]} showsVerticalScrollIndicator={false}>
            {profile?.answers && currentUserProfile?.answers && !loadingCurrentUser ? (
              <View style={[tw.p4]}>
                {/* Compatibility Score */}
                <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                  <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB2]}>Compatibility</Text>
                  <View style={[tw.flexRow, tw.itemsCenter, tw.mB2]}>
                    <Text style={[tw.textGray700, tw.textBase]}>You have </Text>
                    <Text style={[tw.textPink700, tw.fontBold, tw.textBase]}>
                      {getCompatibilityPercentage()}%
                    </Text>
                    <Text style={[tw.textGray700, tw.textBase]}> compatibility</Text>
                  </View>
                  <Text style={[tw.textGray500, tw.textSm]}>
                    Based on {getMatchingQuestions().length} shared questions
                  </Text>
                </View>

                {/* Questions List */}
                {getMatchingQuestions().map((question, index) => {
                  if (!question) return null;
                  
                  return (
                    <View key={index} style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow]}>
                      <Text style={[tw.textGray900, tw.fontBold, tw.textBase, tw.mB3]}>
                        {question.question}
                      </Text>
                      
                      {/* User's Answers */}
                      <View style={[tw.mB3]}>
                        <Text style={[tw.textGray600, tw.textSm, tw.fontMedium, tw.mB2]}>
                          {profile?.firstname}'s answers:
                        </Text>
                        <View style={[tw.flexRow, tw.flexWrap]}>
                          {question.userAnswers.map((answer, ansIndex) => (
                            <View 
                              key={ansIndex} 
                              style={[
                                tw.roundedFull, 
                                tw.pX3, 
                                tw.pY1, 
                                tw.mR2, 
                                tw.mB1,
                                question.matchingAnswers.some(match => match.id === answer.id)
                                  ? tw.bgGreen100
                                  : tw.bgGray100
                              ]}
                            >
                              <Text style={[
                                tw.textSm,
                                question.matchingAnswers.some(match => match.id === answer.id)
                                  ? tw.textGreen700
                                  : tw.textGray700
                              ]}>
                                {answer.text}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Current User's Answers */}
                      <View>
                        <Text style={[tw.textGray600, tw.textSm, tw.fontMedium, tw.mB2]}>
                          Your answers:
                        </Text>
                        <View style={[tw.flexRow, tw.flexWrap]}>
                          {question.currentUserAnswers.map((answer, ansIndex) => (
                            <View 
                              key={ansIndex} 
                              style={[
                                tw.roundedFull, 
                                tw.pX3, 
                                tw.pY1, 
                                tw.mR2, 
                                tw.mB1,
                                question.matchingAnswers.some(match => match.id === answer.id)
                                  ? tw.bgGreen100
                                  : tw.bgBlue100
                              ]}
                            >
                              <Text style={[
                                tw.textSm,
                                question.matchingAnswers.some(match => match.id === answer.id)
                                  ? tw.textGreen700
                                  : tw.textBlue700
                              ]}>
                                {answer.text}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Match Indicator */}
                      {question.hasMatches && (
                        <View style={[tw.flexRow, tw.itemsCenter, tw.mT3]}>
                          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                          <Text style={[tw.textGreen700, tw.textSm, tw.fontMedium, tw.mL1]}>
                            You have matching answers!
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}

                {getMatchingQuestions().length === 0 && (
                  <View style={[tw.bgWhite, tw.roundedLg, tw.p6, tw.mB4, tw.shadow, tw.itemsCenter]}>
                    <Ionicons name="help-circle-outline" size={48} color="#9ca3af" />
                    <Text style={[tw.textGray500, tw.textBase, tw.mT2, tw.textCenter]}>
                      No shared questions found between your profiles
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, tw.p8]}>
                <ActivityIndicator size="large" color="#fb6c31" />
                <Text style={[tw.textGray500, tw.textBase, tw.mT2]}>
                  {loadingCurrentUser ? 'Loading your profile...' : 'Loading questions...'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Photo Viewer */}
      {profile?.gallery && (
        <PhotoViewer
          visible={showPhotoViewer}
          onClose={() => setShowPhotoViewer(false)}
          photos={profile.gallery}
          initialIndex={selectedPhotoIndex}
        />
      )}
    </Modal>
  );
};

export default UserProfileView;
