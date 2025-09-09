import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Checkbox, RadioButton, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tw } from 'react-native-tailwindcss';

import useApiRequest from '@/hooks/useApiRequest';
import { ApiResponse, ProfileQuestionsResponse, ProfileQuestion } from '@/types';
import Spinner from '@/components/Spinner';

const ProfileQuestionsScreen: React.FC = () => {
  const router = useRouter();
  const { loading, send, error } = useApiRequest<ApiResponse>();
  
  const [profileFields, setProfileFields] = useState<ProfileQuestionsResponse>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Primary colors
  const primaryColor = '#fb6c31';
  const accentColor = '#ff6b9d';
  const backgroundColor = '#f8f9fa';

  // Fetch profile questions
  const fetchProfileQuestions = async () => {
    try {
      const result = await send('get', '/settings/profile-questions');
      if (result && !result.errors) {
        setProfileFields(result as unknown as ProfileQuestionsResponse);
      }
    } catch (err) {
      console.error('Error fetching profile questions:', err);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const result = await send('get', '/users/me');
      if (result && !result.errors) {
        setUserProfile(result);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Fetch existing answers
  const fetchUserAnswers = async () => {
    try {
      const result = await send('get', '/user-profiling/answers');
      if (result && !result.errors) {
        // Transform existing answers to our format
        const transformedAnswers: any = {};
        result.forEach((answer: any) => {
          if (answer.answers && answer.answers.length > 0) {
            const question = profileFields
              .flatMap(group => group.questions)
              .find(q => q.id === answer.id);
            
            if (question) {
              const optionIds = answer.answers.map((ans: any) => {
                const option = question.options.find(opt => opt.optionText === ans.text);
                return option?.id;
              }).filter(Boolean);
              
              if (optionIds.length > 0) {
                transformedAnswers[answer.id] = question.fieldType === 'multiSelect' ? optionIds : optionIds[0];
              }
            }
          }
        });
        setUserAnswers(transformedAnswers);
      }
    } catch (err) {
      console.error('Error fetching user answers:', err);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchProfileQuestions();
      await fetchUserProfile();
      setIsLoading(false);
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (profileFields.length > 0) {
      fetchUserAnswers();
    }
  }, [profileFields]);

  // Filter questions based on user's profile type
  const getFilteredQuestions = () => {
    if (!userProfile?.profileType) return profileFields;
    
    return profileFields.filter(group => 
      group.profileType === userProfile.profileType || 
      group.profileType === '' || 
      !group.profileType
    );
  };

  const filteredQuestions = getFilteredQuestions();

  // Handle answer selection
  const handleAnswerChange = (questionId: number, fieldType: string, optionId: number) => {
    setUserAnswers((prev: any) => {
      if (fieldType === 'multiSelect') {
        const currentValues = prev[questionId] || [];
        const updatedValues = currentValues.includes(optionId)
          ? currentValues.filter((id: number) => id !== optionId)
          : [...currentValues, optionId];
        return { ...prev, [questionId]: updatedValues };
      } else {
        return { ...prev, [questionId]: optionId };
      }
    });
  };

  // Submit answers
  const handleSubmit = async () => {
    console.log('=== PROFILE QUESTIONS SUBMISSION ===');
    console.log('User Profile Type:', userProfile?.profileType);
    console.log('Raw User Answers:', userAnswers);
    
    // Check if there are any answers to submit
    if (Object.keys(userAnswers).length === 0) {
      Alert.alert(
        'No Answers',
        'Please answer at least one question before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Transform answers to the required API format
    const formattedAnswers = Object.keys(userAnswers).map(questionId => {
      const question = filteredQuestions
        .flatMap(group => group.questions)
        .find(q => q.id === parseInt(questionId));
      
      if (!question) return null;
      
      const answer = userAnswers[questionId];
      
      // Format according to API requirements
      const formattedAnswer = {
        profileQuestionId: parseInt(questionId),
        answerOptionIds: Array.isArray(answer) ? answer : [answer],
        freeText: null // Set to null for now, can be used for text-based questions
      };
      
      return formattedAnswer;
    }).filter(Boolean);
    
    console.log('Formatted Answers for API:', formattedAnswers);
    console.log('Formatted Answers (JSON):', JSON.stringify(formattedAnswers, null, 2));
    
    try {
      // Show loading state
      setIsLoading(true);
      
      // Submit to API
      const result = await send('post', '/user-profiling/save/answers', formattedAnswers);
      
      if (result && !result.errors) {
        console.log('✅ API Response:', result);
        
        // Show success message
        Alert.alert(
          'Success!',
          'Your profile questions have been saved successfully.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        console.error('❌ API Error:', result?.errors || 'Unknown error');
        
        // Show error message
        Alert.alert(
          'Error',
          result?.errors?.message || 'Failed to save your answers. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Submission Error:', error);
      
      // Show error message
      Alert.alert(
        'Error',
        'Failed to save your answers. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation functions
  const handleNext = () => {
    if (currentStep < filteredQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor }]}>
        <Spinner />
        <Text style={[tw.mT4, tw.textGray600]}>Loading profile info...</Text>
      </SafeAreaView>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <SafeAreaView style={[tw.flex1, tw.justifyCenter, tw.itemsCenter, { backgroundColor }]}>
        <Ionicons name="help-circle-outline" size={64} color={primaryColor} />
        <Text style={[tw.mT4, tw.textCenter, tw.textGray600, tw.pX8]}>
          No profile questions available for your profile type: {userProfile?.profileType || 'Unknown'}
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={[tw.mT4]}
          buttonColor={primaryColor}
        >
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const currentGroup = filteredQuestions[currentStep];

  return (
    <SafeAreaView style={[tw.flex1, { backgroundColor }]}>
      {/* Header */}
      <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.p4, { backgroundColor: primaryColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[tw.textWhite, tw.textLg, tw.fontBold]}>
          Account Profile
        </Text>
        <View style={[tw.w6]} />
      </View>

      {/* Progress Indicator */}
      <View style={[tw.pX4, tw.pY2, tw.bgWhite]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.mB2]}>
          <Text style={[tw.textSm, tw.textGray600]}>
            Step {currentStep + 1} of {filteredQuestions.length}
          </Text>
          <Text style={[tw.textSm, tw.textGray600]}>
            {userProfile?.profileType || 'General'} Profile
          </Text>
        </View>
        <View style={[tw.h2, tw.bgGray200, tw.roundedFull, tw.overflowHidden]}>
          <View
            style={[
              tw.hFull,
              tw.roundedFull,
              { backgroundColor: primaryColor },
              { width: `${((currentStep + 1) / filteredQuestions.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Question Group Title */}
      <View style={[tw.p4, tw.bgWhite, tw.mB2]}>
        <Text style={[tw.textXl, tw.fontBold, tw.textCenter, { color: primaryColor }]}>
          {currentGroup.title}
        </Text>
        {/* <Text style={[tw.textSm, tw.textCenter, tw.textGray600, tw.mT1]}>
          {currentGroup.questions.length} question{currentGroup.questions.length !== 1 ? 's' : ''}
        </Text> */}
      </View>

      {/* Questions */}
      <ScrollView style={[tw.flex1, tw.pX4]} showsVerticalScrollIndicator={false}>
        {currentGroup.questions.map((question: ProfileQuestion, index: number) => (
          <View key={question.id} style={[tw.bgWhite, tw.p4, tw.rounded, tw.mB3, tw.shadow]}>
            <Text style={[tw.textBase, tw.fontBold, tw.mB3, { color: primaryColor }]}>
              {question.question}
            </Text>

            {question.fieldType === 'singleSelect' && (
              <RadioButton.Group
                value={userAnswers[question.id]}
                onValueChange={(value) => handleAnswerChange(question.id, 'singleSelect', value)}
              >
                {question.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[tw.flexRow, tw.itemsCenter, tw.p2, tw.rounded, tw.mB1]}
                    onPress={() => handleAnswerChange(question.id, 'singleSelect', option.id)}
                  >
                    <RadioButton
                      value={option.id}
                      color={primaryColor}
                    />
                    <Text style={[tw.mL2, tw.flex1, tw.textSm]}>
                      {option.optionText}
                    </Text>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            )}

            {question.fieldType === 'multiSelect' && (
              <View>
                {question.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[tw.flexRow, tw.itemsCenter, tw.p2, tw.rounded, tw.mB1]}
                    onPress={() => handleAnswerChange(question.id, 'multiSelect', option.id)}
                  >
                    <Checkbox
                      status={userAnswers[question.id]?.includes(option.id) ? 'checked' : 'unchecked'}
                      onPress={() => handleAnswerChange(question.id, 'multiSelect', option.id)}
                      color={primaryColor}
                    />
                    <Text style={[tw.mL2, tw.flex1, tw.textSm]}>
                      {option.optionText}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Navigation and Submit */}
      <View style={[tw.p4, tw.bgWhite, tw.borderT, tw.borderGray200]}>
        <View style={[tw.flexRow, tw.justifyBetween, tw.itemsCenter, tw.mB3]}>
          <Button
            mode="outlined"
            onPress={handlePrevious}
            disabled={currentStep === 0}
            style={[tw.flex1, tw.mR2]}
            textColor={primaryColor}
            buttonColor="transparent"
          >
            Previous
          </Button>
          
          {currentStep < filteredQuestions.length - 1 ? (
            <Button
              mode="contained"
              onPress={handleNext}
              style={[tw.flex1, tw.mL2]}
              buttonColor={primaryColor}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={[tw.flex1, tw.mL2]}
              buttonColor={primaryColor}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Update Profile'}
            </Button>
          )}
        </View>
        
        <Text style={[tw.textXs, tw.textCenter, tw.textGray500]}>
          {Object.keys(userAnswers).length > 0 
            ? `${Object.keys(userAnswers).length} question${Object.keys(userAnswers).length !== 1 ? 's' : ''} answered`
            : 'Your answers will be saved and used for better matching'
          }
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default ProfileQuestionsScreen;
