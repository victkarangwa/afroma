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
  switch (fieldName) {
    case "What is your marital status?":
      return {
        placeholder: "Select your marital status",
        title: "What is your marital status?",
        description:
          "Share your current marital status to assess compatibility.",
      };
    case "Do you have children already?":
      return {
        placeholder: "Do you have children?",
        title: "Do you have children already?",
        description: "Specify if you have children or are open to having more.",
      };
    case "How many children would you like to have?":
      return {
        placeholder: "How many children would you like?",
        title: "How many children would you like to have?",
        description: "Indicate your preferred number of children.",
      };
    case "What type of parenting arrangement do you prefer?":
      return {
        placeholder: "Describe your ideal parenting arrangement",
        title: "What type of parenting arrangement do you prefer?",
        description: "Choose your ideal co-parenting setup.",
      };
    case "What parenting style do you follow or believe in?":
      return {
        placeholder: "Describe your parenting style",
        title: "What parenting style do you follow or believe in?",
        description: "Describe your parenting philosophy and approach.",
      };
    case "What values would you prioritize in raising children?":
      return {
        placeholder: "Select values you prioritize in raising children",
        title: "What values would you prioritize in raising children?",
        description:
          "Highlight the core values you want to instill in your children.",
      };
    case "Are you open to co-parenting with multiple partners?":
      return {
        placeholder: "Are you open to multiple co-parenting partners?",
        title: "Are you open to co-parenting with multiple partners?",
        description: "Indicate your stance on co-parenting arrangements.",
      };
    case "How do you feel about vaccinations for children?":
      return {
        placeholder: "Enter your opinion on child vaccinations",
        title: "How do you feel about vaccinations for children?",
        description: "State your perspective on child vaccinations.",
      };
    case "What type of schooling do you prefer for children?":
      return {
        placeholder: "Describe your schooling preference",
        title: "What type of schooling do you prefer for children?",
        description:
          "Identify your preferred educational pathway for children.",
      };
    case "Is your family supportive and will they be involved in the co-parenting journey?":
      return {
        placeholder: "Describe your family's involvement",
        title:
          "Is your family supportive and will they be involved in the co-parenting journey?",
        description:
          "Explain your family’s level of involvement in co-parenting.",
      };
    case "What is your highest level of education?":
      return {
        placeholder: "Enter your highest education level",
        title: "What is your highest level of education?",
        description: "Mention the highest degree or qualification you hold.",
      };
    case "What is your primary language?":
      return {
        placeholder: "Enter your primary language",
        title: "What is your primary language?",
        description: "State your first language for effective communication.",
      };
    case "What other languages do you speak?":
      return {
        placeholder: "Enter other languages you speak",
        title: "What other languages do you speak?",
        description: "List any additional languages you are fluent in.",
      };
    case "Where do you currently live?":
      return {
        placeholder: "Enter your current location",
        title: "Where do you currently live?",
        description: "Provide details about your current place of residence.",
      };
    case "Are you open to relocating for co-parenting?":
      return {
        placeholder: "Are you open to relocation?",
        title: "Are you open to relocating for co-parenting?",
        description: "Specify your willingness to move for co-parenting.",
      };
    case "What is your current employment status?":
      return {
        placeholder: "Enter your employment status",
        title: "What is your current employment status?",
        description: "Share your current work status or career situation.",
      };
    case "What is your approximate income range?":
      return {
        placeholder: "Enter your income range",
        title: "What is your approximate income range?",
        description: "Indicate your income range for financial transparency.",
      };
    case "What are your physical activity habits?":
      return {
        placeholder: "Describe your physical activity habits",
        title: "What are your physical activity habits?",
        description:
          "Share your usual level of physical activity or exercise routine.",
      };
    case "What is your political affiliation or worldview?":
      return {
        placeholder: "Enter your political affiliation",
        title: "What is your political affiliation or worldview?",
        description: "Describe your political beliefs or affiliations.",
      };
    case "Are you open to a romantic relationship with your co-parent?":
      return {
        placeholder: "Are you open to romance?",
        title: "Are you open to a romantic relationship with your co-parent?",
        description:
          "Indicate if you are open to romance alongside co-parenting.",
      };
    default:
      return {
        placeholder: "Provide an answer",
        title: fieldName,
        description: "Please provide details",
      };
  }
};

// export const transformToOtherDetails = (userInput) => {
//   const otherDetails = [];

//   for (const [fieldName, selectedValues] of Object.entries(userInput)) {
//     // Determine the value to send to the backend
//     const backendValue = Array.isArray(selectedValues)
//       ? JSON.stringify(selectedValues) // Convert array to a string
//       : selectedValues; // Keep string as it is

//     // Add the transformed object to the array
//     otherDetails.push({
//       fieldName: fieldName,
//       selectedValues: backendValue,
//     });
//   }

//   return otherDetails;
// };

export const transformToProfileAnswer = (userInput: any) => {
  return Object.entries(userInput).map(([key, value]) => ({
    profileQuestionId: parseInt(key, 10),
    answerOptionIds: Array.isArray(value) ? value : [value],
  }));
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

export const convertToMilliseconds = (timestamp: any) => {
  const milliseconds =
    timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
  return milliseconds;
};
