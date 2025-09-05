// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0GIYmNy3OsJRhRiNI3K3aS_IvwNHuay8",
  authDomain: "afroma-250.firebaseapp.com",
  projectId: "afroma-250",
  storageBucket: "afroma-250.firebasestorage.app",
  messagingSenderId: "264350061976",
  appId: "1:264350061976:web:7ace7b09741f8409df07ed",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
isSupported().then((supported) => {
  if (supported) {
    getAnalytics();
  } else {
    // Optionally log or handle unsupported environments
    console.log("Firebase Analytics is not supported in this environment.");
  }
});
const db = getFirestore(app);

export { db };
