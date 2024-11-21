import localStore from "./localValues";
import LocalStorage from "./storage";

export const separateTextWithSpace = (text: string) => {
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
          ? JSON.stringify(selectedValues)  // Convert array to a string
          : selectedValues;                 // Keep string as it is
      
      // Add the transformed object to the array
      otherDetails.push({
          fieldName: fieldName,
          selectedValues: backendValue
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
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }

  return age;
}
