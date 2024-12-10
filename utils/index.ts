import RNFS from "react-native-fs";

import localStore from "./localValues";
import LocalStorage from "./storage";
import { profileTabs } from "@/constants";
import moment from "moment";

export const separateTextWithSpace = (text: string) => {
  if (text === "firstname") return "first name";
  if (text === "lastname") return "last name";
  return text.replace(/([A-Z])/g, " $1").trim();
};

export const removeUserData = async () => {
  try {
    await LocalStorage.removeItem(localStore.profile);
    await LocalStorage.removeItem(localStore.token);
    return true;
  } catch (error) {
    console.error("Error removing user data:", error);
    return false;
  }
};

export const getCustomPlaceholder = (fieldName: string) => {
  let placeholder, title, description;

  if (fieldName?.includes("bio")) {
    return {
      placeholder: "Add a bio to introduce yourself",
      title: "Write a bio to introduce yourself",
      description: "Tell people about yourself. Don't be shy!",
    };
  } else if (fieldName?.includes("phone")) {
    return {
      placeholder: "Enter your phone number",
      title: "Add your phone number",
      description: "Your phone number will be visible to your connections",
    };
  } else if (fieldName?.includes("family_plan")) {
    return {
      placeholder: "Add your family plan",
      title: "Add your family plan",
      description: "Tell people about your family plan",
    };
  } else if (fieldName?.includes("education")) {
    return {
      placeholder: "Add your education",
      title: "Where di you go to school?",
      description: "Tell people about your education",
    };
  } else if (fieldName?.includes("communication_style")) {
    return {
      placeholder: "Add your communication style",
      title: "What's your communication style?",
      description: "Tell people about how you usually communicate",
    };
  } else if (fieldName?.includes("language")) {
    return {
      placeholder: "Add your language",
      title: "What language(s) do you speak?",
      description: "Tell people about the languages you speak",
    };
  } else if (fieldName?.includes("looking_for")) {
    return {
      placeholder: "Update what you're looking for",
      title: "Tell people what you're looking for",
      description: "People will see this when they view your profile",
    };
  } else {
    return {
      placeholder: "Add your " + separateTextWithSpace(fieldName),
      title: "Add your " + separateTextWithSpace(fieldName),
      description: "Tell people about your " + separateTextWithSpace(fieldName),
    };
  }
};

export const transformToOtherDetails = (userInput) => {
  const otherDetails = [];

  for (const [fieldName, selectedValues] of Object.entries(userInput)) {
    // Determine the value to send to the backend
    const backendValue = Array.isArray(selectedValues)
      ? JSON.stringify(selectedValues) // Convert array to a string
      : selectedValues; // Keep string as it is

    // Add the transformed object to the array
    otherDetails.push({
      fieldName: fieldName,
      selectedValues: backendValue,
    });
  }

  return otherDetails;
};

export const gateUserAge = (dob: string) => {
  const birthDate = new Date(dob); // Convert the string to a Date object
  const today = new Date(); // Get the current date

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // If the birthday hasn't occurred yet this year, subtract one from the age
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const convertImgToBase64 = async (fileUri: string) => {
  const data = await fetch(fileUri);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      //  remove the base64 prefix
      const base64 = base64data?.toString().split(",")[1];
      resolve(base64);
    };
  });
};

export const prepareImgForUpload = (
  imgBase64: string,
  ft = false,
  type = "PHOTO"
) => {
  const data = {
    mediaType: type,
    featured: ft,
    fileContent: imgBase64,
  };
  return data;
};

interface otherDetails {
  fieldName: string;
  fieldType: string;
  possibleValues: string;
  maxSize: number;
}

interface profileFields {
  fieldName: string;
  selectedValues: string;
}

export const getProfileCompletion = (
  allFields: otherDetails[],
  profile: profileFields[]
) => {
  const basicFields = profileTabs[0].content.length;
  const totalFields = allFields.length + basicFields;
  let completedFields = 0;

  // check if the basic fields ["firstname", "lastname", "gender", "dateOfBirth", "bio"] are in the profile object
  for (const field of profileTabs[0].content) {
    if (field in profile) {
      completedFields++;
    }
  }

  // check if the other details are in the profile object
  for (const field of allFields) {
    if (profile?.otherDetails?.some((p) => p.fieldName === field.fieldName)) {
      completedFields++;
    }
  }

  const percentage = (completedFields / totalFields) * 100;

  // return rounded percentage
  return Math.round(percentage);
};

export const generateChatId = (userId1: number, userId2: number) => {
  return [userId1, userId2].sort().join("_");
};

export const convertSecondsToTime = (timestamp) => {
// Convert Firebase Timestamp to JavaScript Date
const date = timestamp?.toDate();

// Format the date using Moment.js
return moment(date).format("HH:mm A"); // Format as 24-hour time, e.g., "14:30"
};
