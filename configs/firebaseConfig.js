// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWf6QizmSNf5HYw2T9RXmcwF2sMwjw-cM",
  authDomain: "parenti-apps.firebaseapp.com",
  projectId: "parenti-apps",
  storageBucket: "parenti-apps.firebasestorage.app",
  messagingSenderId: "104521571553",
  appId: "1:104521571553:web:49722201a955863c8eaba0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
