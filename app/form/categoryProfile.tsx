import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { tw } from "react-native-tailwindcss";
import ButtonComponent from "@/components/Button";
import NavBar from "@/components/navigation/NavBar";
import { Chip, ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";

// Mock data for category-specific fields
const MARITAL_STATUS = ["Single", "Divorced", "Widowed", "Separated"];
const COMMITMENT_INTENT = ["Long-term relationship", "Marriage", "Casual dating", "Friendship first"];
const FAMILY_GOALS = ["Want children", "Don't want children", "Have children", "Open to children"];
const GENDER_PREFERENCES = ["Men", "Women", "Non-binary", "Everyone"];

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Marketing", "Design", "Consulting", "Other"];
const COLLABORATION_INTERESTS = ["Mentoring", "Partnerships", "Job Opportunities"];

const TRAVEL_INTERESTS = ["Adventure", "Cultural", "Luxury", "Budget", "Solo", "Group", "Food & Wine", "Nature"];
const DESTINATIONS = ["Europe", "Asia", "Africa", "Americas", "Oceania", "Middle East"];

const COUNTRY_LIST = [
  "Europe", "Asia", "Africa", "Americas", "Oceania", "Middle East"
];

const CategoryProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const purpose = params.purpose as string || "relationship"; // Default to relationship

  const [step, setStep] = useState(0);
  
  // Define steps based on purpose
  const getStepsForPurpose = () => {
    switch (purpose) {
      case "relationship":
        return ["Commitment & Status", "Family & Children", "Preferences & Bio"];
      case "networking":
        return ["Professional Info", "Industries & Skills", "Collaboration"];
      case "travel":
        return ["Travel Style", "Destinations", "Content & Bio"];
      default:
        return ["Basic Info"];
    }
  };

  const steps = getStepsForPurpose();
  const totalSteps = steps.length;

  // State for relationship fields
  const [commitmentIntent, setCommitmentIntent] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [hasChildren, setHasChildren] = useState("");
  const [familyGoals, setFamilyGoals] = useState("");
  const [genderPreferences, setGenderPreferences] = useState<string[]>([]);
  const [personalBio, setPersonalBio] = useState("");

  // State for networking fields
  const [professionalHeadline, setProfessionalHeadline] = useState("");
  const [summaryBio, setSummaryBio] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [collaborationInterests, setCollaborationInterests] = useState<string[]>([]);
  const [professionalPhotos, setProfessionalPhotos] = useState<string[]>([]);

  // Optionally, get existing photos from params (if passed from previous step)
  // const params = useLocalSearchParams();
  // const existingPhotos = params.photos ? JSON.parse(params.photos) : [];

  // State for travel fields
  const [travelInterests, setTravelInterests] = useState<string[]>([]);
  const [visitedDestinations, setVisitedDestinations] = useState<string[]>([]);
  const [visitedPhotos, setVisitedPhotos] = useState<{ uri: string, country: string }[]>([]); // NEW
  const [bucketList, setBucketList] = useState<string[]>([]);
  const [travelBio, setTravelBio] = useState("");
  const [mediaLinks, setMediaLinks] = useState({ youtube: "", instagram: "", other: "" });
  const [travelPhotos, setTravelPhotos] = useState<string[]>([]);

  const toggleMulti = (arr: string[], value: string, setArr: (a: string[]) => void) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const pickImage = async (setPhotos: (photos: string[]) => void, photos: string[], maxPhotos = 6) => {
    if (photos.length >= maxPhotos) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to make this work!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number, setPhotos: (photos: string[]) => void, photos: string[]) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Step validation logic
  const isStepValid = () => {
    switch (purpose) {
      case "relationship":
        switch (step) {
          case 0: return commitmentIntent && maritalStatus;
          case 1: return hasChildren && familyGoals;
          case 2: return genderPreferences.length > 0 && personalBio;
          default: return false;
        }
      case "networking":
        switch (step) {
          case 0: return professionalHeadline && summaryBio;
          case 1: return industries.length > 0;
          case 2: return collaborationInterests.length > 0;
          default: return false;
        }
      case "travel":
        switch (step) {
          case 0: return travelInterests.length > 0;
          case 1: return visitedPhotos.length > 0 && bucketList.length > 0;
          case 2: return travelBio.length <= 800;
          default: return false;
        }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    router.replace("/(tabs)");
  };

  const renderRelationshipStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Commitment Intent</Text>
              <View style={[tw.flexRow, tw.flexWrap]}>
                {COMMITMENT_INTENT.map((intent) => (
                  <TouchableOpacity
                    key={intent}
                    style={[
                      tw.bgGray100, tw.pX3, tw.pY2, tw.roundedFull, tw.mR2, tw.mB2, tw.border2,
                      commitmentIntent === intent ? tw.borderPink700 : tw.borderGray300,
                      commitmentIntent === intent ? tw.bgPink700 : null,
                    ]}
                    onPress={() => setCommitmentIntent(intent)}
                  >
                    <Text style={[commitmentIntent === intent ? tw.textWhite : tw.textGray700, tw.fontBold]}>{intent}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Marital Status</Text>
              <View style={[tw.flexRow, tw.flexWrap]}>
                {MARITAL_STATUS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      tw.bgGray100, tw.pX3, tw.pY2, tw.roundedFull, tw.mR2, tw.mB2, tw.border2,
                      maritalStatus === status ? tw.borderPink700 : tw.borderGray300,
                      maritalStatus === status ? tw.bgPink700 : null,
                    ]}
                    onPress={() => setMaritalStatus(status)}
                  >
                    <Text style={[maritalStatus === status ? tw.textWhite : tw.textGray700, tw.fontBold]}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        );
      case 1:
        return (
          <>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Do you have children?</Text>
              <View style={[tw.flexRow, tw.flexWrap]}>
                {["Yes", "No"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      tw.bgGray100, tw.pX4, tw.pY2, tw.roundedFull, tw.mR2, tw.mB2, tw.border2,
                      hasChildren === option ? tw.borderPink700 : tw.borderGray300,
                      hasChildren === option ? tw.bgPink700 : null,
                    ]}
                    onPress={() => setHasChildren(option)}
                  >
                    <Text style={[hasChildren === option ? tw.textWhite : tw.textGray700, tw.fontBold]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Family Goals</Text>
              <View style={[tw.flexRow, tw.flexWrap]}>
                {FAMILY_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      tw.bgGray100, tw.pX3, tw.pY2, tw.roundedFull, tw.mR2, tw.mB2, tw.border2,
                      familyGoals === goal ? tw.borderPink700 : tw.borderGray300,
                      familyGoals === goal ? tw.bgPink700 : null,
                    ]}
                    onPress={() => setFamilyGoals(goal)}
                  >
                    <Text style={[familyGoals === goal ? tw.textWhite : tw.textGray700, tw.fontBold]}>{goal}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        );
      case 2:
        return (
          <>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Gender Preference(s)</Text>
              <View style={[tw.flexRow, tw.flexWrap]}>
                {GENDER_PREFERENCES.map((pref) => (
                  <Chip
                    key={pref}
                    selected={genderPreferences.includes(pref)}
                    onPress={() => toggleMulti(genderPreferences, pref, setGenderPreferences)}
                    style={[
                      tw.mR2, tw.mB2, tw.bgGray100, tw.border2,
                      genderPreferences.includes(pref) ? tw.borderPink700 : tw.borderGray300,
                      genderPreferences.includes(pref) ? tw.bgPink700 : null,
                    ]}
                    textStyle={[
                      genderPreferences.includes(pref) ? tw.textWhite : tw.textGray700,
                      tw.fontBold,
                    ]}
                  >
                    {pref}
                  </Chip>
                ))}
              </View>
            </View>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Personal Bio</Text>
              <TextInput
                style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.border, tw.borderGray300, { height: 120 }]}
                placeholder="Tell us about yourself..."
                value={personalBio}
                onChangeText={setPersonalBio}
                multiline
                textAlignVertical="top"
              />
            </View>
          </>
        );
      default:
        return null;
    }
  };

  const renderNetworkingStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            {/* Profile Visuals: Reuse or upload professional headshots */}
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}> 
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Profile Visuals</Text>
              <Text style={[tw.textGray700, tw.textSm, tw.mB2]}>Upload professional headshots or reuse existing photos.</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[tw.mB2]}> 
                {professionalPhotos.map((uri, idx) => (
                  <View key={idx} style={[tw.relative, tw.mR2]}> 
                    <Image source={{ uri }} style={[tw.w20, tw.h20, tw.rounded]} />
                    <TouchableOpacity
                      style={[tw.absolute, tw.top0, tw.right0, tw.bgWhite, tw.roundedFull, tw.p1]}
                      onPress={() => setProfessionalPhotos(professionalPhotos.filter((_, i) => i !== idx))}
                    >
                      <Ionicons name="close" size={16} color="#fb6c31" />
                    </TouchableOpacity>
                  </View>
                ))}
                {professionalPhotos.length < 6 && (
                  <TouchableOpacity
                    style={[tw.bgGray200, tw.w20, tw.h20, tw.rounded, tw.justifyCenter, tw.itemsCenter]}
                    onPress={async () => {
                      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (status !== "granted") {
                        alert("Sorry, we need media library permissions to make this work!");
                        return;
                      }
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                      });
                      if (!result.canceled && result.assets && result.assets[0].uri) {
                        setProfessionalPhotos([...professionalPhotos, result.assets[0].uri]);
                      }
                    }}
                  >
                    <Ionicons name="add" size={32} color="#fb6c31" />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
            {/* Professional Headline */}
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Professional Headline</Text>
              <TextInput
                style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.border, tw.borderGray300]}
                placeholder="e.g., Senior Analyst at XYZ"
                value={professionalHeadline}
                onChangeText={setProfessionalHeadline}
              />
            </View>
            {/* Summary Bio */}
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Summary Bio</Text>
              <TextInput
                style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.border, tw.borderGray300, { height: 120 }]}
                placeholder="Brief professional summary..."
                value={summaryBio}
                onChangeText={text => text.length <= 800 && setSummaryBio(text)}
                multiline
                textAlignVertical="top"
              />
              <Text style={[tw.textGray500, tw.textXs, tw.mT1, { textAlign: 'right' }]}>{summaryBio.length}/800</Text>
            </View>
          </>
        );
      case 1:
        return (
          <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
            <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Industries & Specialties</Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {INDUSTRIES.map((industry) => (
                <Chip
                  key={industry}
                  selected={industries.includes(industry)}
                  onPress={() => toggleMulti(industries, industry, setIndustries)}
                  style={[
                    tw.mR2, tw.mB2, tw.bgGray100, tw.border2,
                    industries.includes(industry) ? tw.borderPink700 : tw.borderGray300,
                    industries.includes(industry) ? tw.bgPink700 : null,
                  ]}
                  textStyle={[
                    industries.includes(industry) ? tw.textWhite : tw.textGray700,
                    tw.fontBold,
                  ]}
                >
                  {industry}
                </Chip>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
            <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Collaboration Interests</Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {COLLABORATION_INTERESTS.map((interest) => (
                <Chip
                  key={interest}
                  selected={collaborationInterests.includes(interest)}
                  onPress={() => toggleMulti(collaborationInterests, interest, setCollaborationInterests)}
                  style={[
                    tw.mR2, tw.mB2, tw.bgGray100, tw.border2,
                    collaborationInterests.includes(interest) ? tw.borderPink700 : tw.borderGray300,
                    collaborationInterests.includes(interest) ? tw.bgPink700 : null,
                  ]}
                  textStyle={[
                    collaborationInterests.includes(interest) ? tw.textWhite : tw.textGray700,
                    tw.fontBold,
                  ]}
                >
                  {interest}
                </Chip>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTravelStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
            <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Travel Interests</Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {TRAVEL_INTERESTS.map((interest) => (
                <Chip
                  key={interest}
                  selected={travelInterests.includes(interest)}
                  onPress={() => toggleMulti(travelInterests, interest, setTravelInterests)}
                  style={[
                    tw.mR2, tw.mB2, tw.bgGray100, tw.border2,
                    travelInterests.includes(interest) ? tw.borderPink700 : tw.borderGray300,
                    travelInterests.includes(interest) ? tw.bgPink700 : null,
                  ]}
                  textStyle={[
                    travelInterests.includes(interest) ? tw.textWhite : tw.textGray700,
                    tw.fontBold,
                  ]}
                >
                  {interest}
                </Chip>
              ))}
            </View>
          </View>
        );
      case 1:
        return (
          <>
            {/* Visited Destinations: Photo upload with country tag */}
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Visited Destinations</Text>
              <View style={[tw.flexRow, tw.flexWrap, tw.mB2]}>
                {visitedPhotos.map((photo, idx) => (
                  <View key={idx} style={[tw.mR2, tw.mB2, { alignItems: 'center' }]}> 
                    <Image source={{ uri: photo.uri }} style={[tw.w16, tw.h16, tw.rounded]} />
                    <View style={[tw.mT1, tw.bgGray200, tw.roundedFull, tw.pX2, tw.pY1]}>
                      <Text style={[tw.textGray700, tw.textXs]}>{photo.country}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setVisitedPhotos(visitedPhotos.filter((_, i) => i !== idx))} style={[tw.mT1]}>
                      <Ionicons name="close-circle" size={18} color="#fb6c31" />
                    </TouchableOpacity>
                  </View>
                ))}
                {visitedPhotos.length < 6 && (
                  <TouchableOpacity onPress={async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== "granted") {
                      alert("Sorry, we need media library permissions to make this work!");
                      return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ImagePicker.MediaTypeOptions.Images,
                      allowsEditing: true,
                      aspect: [4, 3],
                      quality: 1,
                    });
                    if (!result.canceled && result.assets && result.assets[0].uri) {
                      // Ask user to tag country
                      // For simplicity, just pick the first country for now (replace with a picker for production)
                      setVisitedPhotos([...visitedPhotos, { uri: result.assets[0].uri, country: COUNTRY_LIST[0] }]);
                    }
                  }} style={[tw.bgGray200, tw.rounded, tw.p4, tw.justifyCenter, tw.itemsCenter]}> 
                    <Ionicons name="add" size={28} color="#fb6c31" />
                  </TouchableOpacity>
                )}
              </View>
              {/* Tag country for each photo (simple dropdown for now) */}
              {visitedPhotos.map((photo, idx) => (
                <View key={idx + '-tag'} style={[tw.flexRow, tw.itemsCenter, tw.mB2]}> 
                  <Text style={[tw.textGray700, tw.textSm, tw.mR2]}>Tag country:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {COUNTRY_LIST.map((country) => (
                      <TouchableOpacity
                        key={country}
                        style={[tw.pX3, tw.pY1, tw.roundedFull, tw.mR2, tw.bgGray100, tw.border2, photo.country === country ? tw.borderPink700 : tw.borderGray300, photo.country === country ? tw.bgPink700 : null]}
                        onPress={() => {
                          const updated = [...visitedPhotos];
                          updated[idx].country = country;
                          setVisitedPhotos(updated);
                        }}
                      >
                        <Text style={[photo.country === country ? tw.textWhite : tw.textGray700, tw.fontBold]}>{country}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </View>
            {/* Bucket List */}
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Bucket List</Text>
              <View style={[tw.flexRow, tw.flexWrap]}>
                {DESTINATIONS.map((dest) => (
                  <Chip
                    key={dest}
                    selected={bucketList.includes(dest)}
                    onPress={() => toggleMulti(bucketList, dest, setBucketList)}
                    style={[
                      tw.mR2, tw.mB2, tw.bgGray100, tw.border2,
                      bucketList.includes(dest) ? tw.borderPink700 : tw.borderGray300,
                      bucketList.includes(dest) ? tw.bgPink700 : null,
                    ]}
                    textStyle={[
                      bucketList.includes(dest) ? tw.textWhite : tw.textGray700,
                      tw.fontBold,
                    ]}
                  >
                    {dest}
                  </Chip>
                ))}
              </View>
            </View>
          </>
        );
      case 2:
        return (
          <>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Travel Bio</Text>
              <TextInput
                style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.border, tw.borderGray300, { height: 120 }]}
                placeholder="Share your travel story..."
                value={travelBio}
                onChangeText={text => text.length <= 800 && setTravelBio(text)}
                multiline
                textAlignVertical="top"
              />
              <Text style={[tw.textGray500, tw.textXs, tw.mT1, { textAlign: 'right' }]}>{travelBio.length}/800</Text>
            </View>
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Media Links (Optional)</Text>
              <TextInput
                style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.mB2, tw.border, tw.borderGray300]}
                placeholder="YouTube channel"
                value={mediaLinks.youtube}
                onChangeText={(text) => setMediaLinks({ ...mediaLinks, youtube: text })}
              />
              <TextInput
                style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.mB2, tw.border, tw.borderGray300]}
                placeholder="Instagram handle"
                value={mediaLinks.instagram}
                onChangeText={(text) => setMediaLinks({ ...mediaLinks, instagram: text })}
              />
              <TextInput
                style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.border, tw.borderGray300]}
                placeholder="Other links"
                value={mediaLinks.other}
                onChangeText={(text) => setMediaLinks({ ...mediaLinks, other: text })}
              />
            </View>
          </>
        );
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (purpose) {
      case "relationship":
        return renderRelationshipStep();
      case "networking":
        return renderNetworkingStep();
      case "travel":
        return renderTravelStep();
      default:
        return null;
    }
  };

  return (
    <>
      <NavBar title={`${purpose.charAt(0).toUpperCase() + purpose.slice(1)} Profile`} showBack onBack={step === 0 ? undefined : handleBack} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={[tw.bgPink100, { flex: 1 }]}
          contentContainerStyle={[tw.pX8, tw.pY6, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 24, borderTopWidth: 1, borderColor: '#eee' }}>
          <ProgressBar progress={(step + 1) / totalSteps} color="#fb6c31" style={[tw.h2, tw.roundedFull, tw.mB4]} />
          <View style={[tw.flexRow, tw.justifyBetween, tw.itemsCenter]}>
            <TouchableOpacity
              onPress={handleBack}
              disabled={step === 0}
              style={[
                tw.justifyCenter,
                tw.itemsCenter,
                tw.roundedFull,
                tw.border2,
                tw.borderPink700,
                { backgroundColor: '#fff', width: 48, height: 48, opacity: step === 0 ? 0.5 : 1 }
              ]}
            >
              <Ionicons name="chevron-back-outline" size={28} color="#fb6c31" />
            </TouchableOpacity>
            {step < totalSteps - 1 ? (
              <TouchableOpacity
                onPress={handleNext}
                disabled={!isStepValid()}
                style={[
                  tw.justifyCenter,
                  tw.itemsCenter,
                  tw.roundedFull,
                  tw.bgPink700,
                  { width: 48, height: 48, opacity: !isStepValid() ? 0.5 : 1 }
                ]}
              >
                <Ionicons name="chevron-forward-outline" size={28} color="#fff" />
              </TouchableOpacity>
            ) : (
              <ButtonComponent onPress={handleFinish} disabled={!isStepValid()} style={[tw.roundedFull, tw.pX8, { minWidth: 100 }]}>Finish</ButtonComponent>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default CategoryProfileScreen; 