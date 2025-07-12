import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { tw } from "react-native-tailwindcss";
import ButtonComponent from "@/components/Button";
import { Chip, Divider, ProgressBar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import NavBar from "@/components/navigation/NavBar";

const HEIGHT_OPTIONS = [
  { label: "150 cm", value: "150" },
  { label: "160 cm", value: "160" },
  { label: "170 cm", value: "170" },
  { label: "180 cm", value: "180" },
  { label: "190 cm", value: "190" },
  { label: "Other", value: "other" },
];
const NATIONALITIES = [
  { label: "Nigeria", value: "ng", flag: "🇳🇬" },
  { label: "Kenya", value: "ke", flag: "🇰🇪" },
  { label: "Ghana", value: "gh", flag: "🇬🇭" },
  { label: "South Africa", value: "za", flag: "🇿🇦" },
  { label: "Rwanda", value: "rw", flag: "🇷🇼" },
  { label: "Other", value: "other", flag: "🌍" },
];
const LANGUAGES = [
  "English",
  "French",
  "Swahili",
  "Arabic",
  "Yoruba",
  "Zulu",
  "Other",
];
const INTERESTS = [
  "Music",
  "Sports",
  "Travel",
  "Reading",
  "Cooking",
  "Tech",
  "Art",
  "Movies",
  "Other",
];
const PURPOSES = [
  { label: "Serious Relationship & Marriage", value: "relationship" },
  { label: "Networking", value: "networking" },
  { label: "Travel", value: "travel" },
];

const MAX_PHOTOS = 6;

const CompleteProfileScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<string[]>([]);
  const [height, setHeight] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState([
    { name: "" },
  ]);
  const [employer, setEmployer] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [step, setStep] = useState(0);
  const steps = [
    "Photos",
    "Height & Nationality",
    "Languages & Interests",
    "Final Details",
  ];
  const totalSteps = steps.length;

  // Step validation logic
  const isStepValid = () => {
    switch (step) {
      case 0:
        return photos.length > 0;
      case 1:
        return height && nationalities.length > 0;
      case 2:
        return languages.length > 0 && interests.length > 0;
      case 3:
        return (
          institutions.every(inst => inst.name) &&
          employer && jobTitle
        );
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
    // Get purpose from params (should be passed from lookingFor)
    const purpose = params.purpose || '';
    router.push(`/form/categoryProfile?purpose=${purpose}`);
  };

  const handleInstitutionChange = (idx: number, value: string) => {
    setInstitutions((prev) =>
      prev.map((inst, i) => (i === idx ? { ...inst, name: value } : inst))
    );
  };
  const addInstitution = () => {
    setInstitutions((prev) => [...prev, { name: "" }]);
  };
  const removeInstitution = (idx: number) => {
    setInstitutions((prev) => prev.filter((_, i) => i !== idx));
  };

  const pickImage = async () => {
    if (photos.length >= MAX_PHOTOS) return;
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

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleMulti = (arr: string[], value: string, setArr: (a: string[]) => void) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  return (
    <>
      <NavBar title="Complete Profile" showBack onBack={step === 0 ? undefined : handleBack} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={[tw.bgPink100, { flex: 1 }]}
          contentContainerStyle={[tw.pX8, tw.pY6, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step Content */}
          {step === 0 && (
            <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
              <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Photos</Text>
              <View style={[tw.flexRow, tw.flexWrap, tw.mB4]}>
                {photos.map((uri, idx) => (
                  <View key={idx} style={[tw.relative, tw.mR2, tw.mB2]}>
                    <Image source={{ uri }} style={[tw.w20, tw.h20, tw.rounded]} />
                    <TouchableOpacity
                      style={[tw.absolute, tw.top0, tw.right0, tw.bgWhite, tw.roundedFull, tw.p1]}
                      onPress={() => removePhoto(idx)}
                    >
                      <Ionicons name="close" size={16} color="#fb6c31" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <TouchableOpacity
                    style={[tw.bgGray200, tw.w20, tw.h20, tw.rounded, tw.justifyCenter, tw.itemsCenter, tw.mR2, tw.mB2]}
                    onPress={pickImage}
                  >
                    <Ionicons name="add" size={32} color="#fb6c31" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[tw.textGray500, tw.textSm, tw.mB0]}>Up to 6 images (JPEG/PNG, max 5MB each)</Text>
            </View>
          )}
          {step === 1 && (
            <>
              <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
                <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Height</Text>
                <View style={[tw.flexRow, tw.itemsCenter, tw.mB2]}>
                  {HEIGHT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        tw.bgGray100,
                        tw.pX3,
                        tw.pY2,
                        tw.roundedFull,
                        tw.mR2,
                        tw.border2,
                        height === opt.value ? tw.borderPink700 : tw.borderGray300,
                      ]}
                      onPress={() => setHeight(opt.value)}
                    >
                      <Text style={[tw.textGray700, tw.textBase, tw.fontBold]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                  {height === "other" && (
                    <TextInput
                      style={[tw.bgWhite, tw.rounded, tw.pX3, tw.pY2, tw.w20, tw.mL2, tw.border, tw.borderGray300]}
                      placeholder="Enter height"
                      value={customHeight}
                      onChangeText={setCustomHeight}
                      keyboardType="numeric"
                    />
                  )}
                </View>
              </View>
              <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
                <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Nationality</Text>
                <View style={[tw.flexRow, tw.flexWrap, tw.mB2]}>
                  {NATIONALITIES.map((nat) => (
                    <TouchableOpacity
                      key={nat.value}
                      style={[
                        tw.bgGray100,
                        tw.pX3,
                        tw.pY2,
                        tw.roundedFull,
                        tw.mR2,
                        tw.mB2,
                        tw.border2,
                        nationalities.includes(nat.value) ? tw.borderPink700 : tw.borderGray300,
                        tw.flexRow,
                        tw.itemsCenter,
                      ]}
                      onPress={() => toggleMulti(nationalities, nat.value, setNationalities)}
                    >
                      <Text style={[tw.textBase, tw.mR1]}>{nat.flag}</Text>
                      <Text style={[tw.textGray700, tw.textBase, tw.fontBold]}>{nat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
          {step === 2 && (
            <>
              <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
                <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Languages Spoken</Text>
                <View style={[tw.flexRow, tw.flexWrap, tw.mB2]}>
                  {LANGUAGES.map((lang) => (
                    <Chip
                      key={lang}
                      selected={languages.includes(lang)}
                      onPress={() => toggleMulti(languages, lang, setLanguages)}
                      style={[
                        tw.mR2,
                        tw.mB2,
                        tw.bgGray100,
                        tw.border2,
                        languages.includes(lang) ? tw.borderPink700 : tw.borderGray300,
                        languages.includes(lang) ? tw.bgPink700 : null,
                      ]}
                      textStyle={[
                        languages.includes(lang) ? tw.textWhite : tw.textGray700,
                        tw.fontBold,
                      ]}
                    >
                      {lang}
                    </Chip>
                  ))}
                </View>
              </View>
              <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
                <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Interests & Hobbies</Text>
                <View style={[tw.flexRow, tw.flexWrap, tw.mB2]}>
                  {INTERESTS.map((interest) => (
                    <Chip
                      key={interest}
                      selected={interests.includes(interest)}
                      onPress={() => toggleMulti(interests, interest, setInterests)}
                      style={[
                        tw.mR2,
                        tw.mB2,
                        tw.bgGray100,
                        tw.border2,
                        interests.includes(interest) ? tw.borderPink700 : tw.borderGray300,
                        interests.includes(interest) ? tw.bgPink700 : null,
                      ]}
                      textStyle={[
                        interests.includes(interest) ? tw.textWhite : tw.textGray700,
                        tw.fontBold,
                      ]}
                    >
                      {interest}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}
          {step === 3 && (
            <>
              {/* Institutions Attended */}
              <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow, tw.mB6]}>
                <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Institutions Attended</Text>
                {institutions.map((inst, idx) => (
                  <View key={idx} style={[tw.flexRow, tw.itemsCenter, tw.mB2]}>
                    <TextInput
                      style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.flex1, tw.border, tw.borderGray300]}
                      placeholder="Institution Name"
                      value={inst.name}
                      onChangeText={(v) => handleInstitutionChange(idx, v)}
                    />
                    {institutions.length > 1 && (
                      <TouchableOpacity onPress={() => removeInstitution(idx)} style={[tw.mL2]}>
                        <Ionicons name="remove-circle-outline" size={24} color="#fb6c31" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity onPress={addInstitution} style={[tw.flexRow, tw.itemsCenter, tw.mT2]}>
                  <Ionicons name="add-circle-outline" size={24} color="#fb6c31" />
                  <Text style={[tw.textPink700, tw.fontBold, tw.mL2]}>Add Institution</Text>
                </TouchableOpacity>
              </View>
              {/* Current Employer & Job Title */}
              <View style={[tw.bgWhite, tw.roundedLg, tw.p4, tw.shadow]}>
                <Text style={[tw.textPink700, tw.textLg, tw.fontBold, tw.mB2]}>Current Employer & Job Title</Text>
                <TextInput
                  style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.mB2, tw.border, tw.borderGray300]}
                  placeholder="Current Employer"
                  value={employer}
                  onChangeText={setEmployer}
                />
                <TextInput
                  style={[tw.bgGray100, tw.rounded, tw.pX3, tw.pY2, tw.border, tw.borderGray300]}
                  placeholder="Job Title"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />
              </View>
            </>
          )}
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
                // disabled={!isStepValid()}
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
              <ButtonComponent onPress={handleFinish}
              //  disabled={!isStepValid()} 
               style={[tw.roundedFull, tw.pX8, { minWidth: 100 }]}>Finish</ButtonComponent>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default CompleteProfileScreen; 