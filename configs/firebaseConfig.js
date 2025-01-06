// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWd8xWuqZw1ol5JlFYMf0ajR09WN7KGLk",
  authDomain: "bonded-e856b.firebaseapp.com",
  projectId: "bonded-e856b",
  storageBucket: "bonded-e856b.firebasestorage.app",
  messagingSenderId: "720223876750",
  appId: "1:720223876750:web:835add7a7bffdac457bbdf",
  measurementId: "G-CSY5RBJGQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };