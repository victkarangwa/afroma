import ModalComponent from "@/components/Modal";
import TextComponent from "@/components/Text";
import { profileTabs } from "@/constants";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse, ProfileQuestionsResponse, ProfileQuestion } from "@/types";
import {
  getCustomPlaceholder,
  separateTextWithSpace,
  transformToProfileAnswer,
} from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button, Checkbox, RadioButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { tw } from "react-native-tailwindcss";
import PictureForm from "./pictures";
import Spinner from "@/components/Spinner";
import { debounce } from "lodash";

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [profileFields, setProfileFields] = useState<ProfileQuestionsResponse>([]);
  const [userInput, setUserInput] = useState<any>({});
  const [visible, setVisible] = React.useState(false);
  const [profile, setProfile] = useState<any>({});
  const [profileAnswers, setProfileAnswers] = useState<any>({});
  const [updatedProfile, setUpdatedProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [currentStep, setCurrentStep] = useState(Number(params.step ?? 0));

  // Helper function to get display text for answers
  const getAnswerDisplayText = (questionId: number, userAnswers: any) => {
    const answer = userAnswers[questionId];
    if (!answer) return "Not answered";
    
    if (Array.isArray(answer)) {
      // For multiSelect, find the option texts
      const currentQuestion = profileFields
        .flatMap(group => group.questions)
        .find(q => q.id === questionId);
      
      if (currentQuestion) {
        return answer
          .map(optionId => 
            currentQuestion.options.find(opt => opt.id === optionId)?.optionText
          )
          .filter(Boolean)
          .join(", ");
      }
    } else {
      // For singleSelect, find the option text
      const currentQuestion = profileFields
        .flatMap(group => group.questions)
        .find(q => q.id === questionId);
      
      if (currentQuestion) {
        const option = currentQuestion.options.find(opt => opt.id === answer);
        return option?.optionText || "Not answered";
      }
    }
    
    return "Not answered";
  };

  // Function to handle form submission
  const handleSubmitAnswers = () => {
    console.log("User Input Data:", userInput);
    
    // Transform the data for API submission
    const transformedAnswers = Object.keys(userInput).map(questionId => {
      const question = profileFields
        .flatMap(group => group.questions)
        .find(q => q.id === parseInt(questionId));
      
      if (!question) return null;
      
      const answer = userInput[questionId];
      let answers = [];
      
      if (Array.isArray(answer)) {
        // Multi-select answers
        answers = answer.map(optionId => {
          const option = question.options.find(opt => opt.id === optionId);
          return {
            id: optionId,
            text: option?.optionText || "",
            weight: option?.weight || 0
          };
        });
      } else {
        // Single-select answer
        const option = question.options.find(opt => opt.id === answer);
        answers = [{
          id: answer,
          text: option?.optionText || "",
          weight: option?.weight || 0
        }];
      }
      
      return {
        id: parseInt(questionId),
        question: question.question,
        fieldType: question.fieldType,
        answers: answers
      };
    }).filter(Boolean);
    
    console.log("Transformed Answers for API:", transformedAnswers);
    
    // Here you can add the actual API call
    // await send("post", "/user-profiling/save/answers", transformedAnswers);
  };

  const geProfileFields = async () => {
    const result = await send(
      "get",
      "/settings/profile-questions"
    );

    if (result?.errors) {
      return;
    }
    setProfileFields((result as unknown as ProfileQuestionsResponse) || []);
  };

  const getMyBasicProfile = async () => {
    const result = await send("get", "/users/me");

    if (result?.errors) {
      return;
    }
    setProfile(result);
  };

  const getMyProfileAnswers = async () => {
    setLoadingProfile(true);
    const result = await send(
      "get",
      "/user-profiling/answers"
    );

    if (result?.errors) {
      return;
    }
    setProfileAnswers(result);
    setLoadingProfile(false);
  };

  useEffect(() => {
    geProfileFields();
    getMyBasicProfile();
    getMyProfileAnswers();
  }, [updatedProfile]);

  // Initialize user input with existing answers
  useEffect(() => {
    if (profileAnswers && profileAnswers.length > 0) {
      const initialAnswers: any = {};
      profileAnswers.forEach((answer: any) => {
        if (answer.answers && answer.answers.length > 0) {
          // Convert answer objects to option IDs
          const question = profileFields
            .flatMap(group => group.questions)
            .find(q => q.id === answer.id);
          
          if (question) {
            const optionIds = answer.answers.map((ans: any) => {
              const option = question.options.find(opt => opt.optionText === ans.text);
              return option?.id;
            }).filter(Boolean);
            
            if (optionIds.length > 0) {
              initialAnswers[answer.id] = question.fieldType === 'multiSelect' ? optionIds : optionIds[0];
            }
          }
        }
      });
      setUserInput(initialAnswers);
    }
  }, [profileAnswers, profileFields]);



  const handleContinue = async (action: string) => {
    if (action === "next") {
      if (currentStep === profileFields.length - 1) {
        return;
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      if (currentStep !== 0) setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={[tw.bgGray100, tw.hFull]}>
      <ModalComponent
        title="Error"
        description={error ?? "An error occurred. Please try again."}
        visible={visible}
        onDismiss={() => setVisible(false)}
      />
      <GestureHandlerRootView>
        <TextComponent
          style={[tw.textXl, tw.fontBold, tw.textBlack, tw.p2, tw.textCenter]}
        >
          {Number(params.tab) === 1
            ? profileFields[currentStep]?.title
            : "Personal Info"}
        </TextComponent>
        {Number(params.tab) === 1 && profileFields.length > 0 && (
          <View style={[tw.flex, tw.flexRow, tw.justifyAround, tw.itemsCenter]}>
            <TouchableOpacity
              onPress={() => handleContinue("back")}
              style={[
                tw.mY4,
                tw.p2,
                { backgroundColor: "#38364a" },
                tw.roundedFull,
                tw.shadow2xl,
              ]}
            >
              <Ionicons name="arrow-back" size={24} style={[tw.textPink700]} />
            </TouchableOpacity>
            <View style={[tw.relative, tw.w2_4]}>
              <View
                style={[
                  tw.absolute,
                  tw.h2,
                  tw.wFull,
                  tw.roundedFull,
                  tw.bgBlack,
                  tw.opacity25,
                ]}
              ></View>
              <View
                style={[
                  tw.h2,
                  {
                    width: `${
                      ((currentStep + 1) / profileFields.length) * 100
                    }%`,
                  },
                  tw.roundedFull,
                  tw.bgPink100,
                ]}
              ></View>
            </View>
            <TouchableOpacity
              onPress={() =>
                currentStep !== profileFields.length - 1
                  ? handleContinue("next")
                  : router.push("/profile")
              }
              style={[
                tw.mY4,
                tw.p2,
                { backgroundColor: "#38364a" },
                tw.roundedFull,
                tw.shadow2xl,
              ]}
            >
              {currentStep !== profileFields.length - 1 ? (
                <Ionicons
                  name="arrow-forward"
                  size={24}
                  style={[tw.textPink700]}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  style={[tw.textPink700]}
                />
              )}
            </TouchableOpacity>
          </View>
        )}
        {loadingProfile ? (
          <Spinner />
        ) : (
          <ScrollView style={[tw.mX4]}>
            {/* {Number(params.tab) === 1 ? ( */}

              <View style={[tw.mY3]}>
                <View>
                  {profileFields[currentStep]?.questions?.map(
                    (question: ProfileQuestion, index: number) => {
                      return (
                        <View key={index} style={[tw.mY3, tw.bgWhite, tw.p4, tw.rounded]}>
                          <TextComponent
                            style={[tw.textBase, tw.fontBold, tw.mB3, tw.textBlack]}
                          >
                            {question.question}
                          </TextComponent>
                          
                          {question.fieldType === 'singleSelect' && (
                            <RadioButton.Group
                              value={userInput[question.id]}
                              onValueChange={(newValue) => {
                                setUserInput((prevState: any) => ({
                                  ...prevState,
                                  [question.id]: newValue
                                }));
                              }}
                            >
                              {question.options.map((option: any, optIndex: number) => (
                                <View
                                  key={optIndex}
                                  style={[tw.rounded, tw.p2, tw.bgGray100, tw.mB2]}
                                >
                                  <RadioButton.Item 
                                    label={option.optionText} 
                                    value={option.id}
                                    labelStyle={[tw.textSm]}
                                  />
                                </View>
                              ))}
                            </RadioButton.Group>
                          )}

                          {question.fieldType === 'multiSelect' && (
                            <View>
                              {question.options.map((option: any, optIndex: number) => (
                                <View key={optIndex} style={[tw.mB2]}>
                                  <Checkbox.Item
                                    status={userInput[question.id]?.includes(option.id) ? "checked" : "unchecked"}
                                    label={option.optionText}
                                    labelStyle={[tw.textSm]}
                                    onPress={() => {
                                      const currentValues = userInput[question.id] || [];
                                      const updatedValues = currentValues.includes(option.id)
                                        ? currentValues.filter((item: number) => item !== option.id)
                                        : [...currentValues, option.id];

                                      setUserInput((prevState: any) => ({
                                        ...prevState,
                                        [question.id]: updatedValues
                                      }));
                                    }}
                                  />
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      );
                    }
                  )}
                  
                  {/* Submit Button */}
                  <View style={[tw.mT6, tw.mB4]}>
                    <Button
                      mode="contained"
                      onPress={handleSubmitAnswers}
                      style={[tw.pY2]}
                      buttonColor="#38364a"
                    >
                      Save Answers
                    </Button>
                  </View>
                </View>
              </View>
            {/* ) : ( */}
              {/* <View style={[tw.flex]}>
                <PictureForm profile={profile} />
                <View style={[tw.mT4, tw.p4]}>
                  <TextComponent style={[tw.textCenter, tw.textGray600]}>
                    Personal information editing is not available in this view.
                  </TextComponent>
                </View>
              </View>
            )} */}
          </ScrollView>
        )}
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
