// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcXf_r8Qkv-NWVc5HR_c54Qsb1BrTk9QU",
  authDomain: "anexodb-9f806.firebaseapp.com",
  projectId: "anexodb-9f806",
  storageBucket: "anexodb-9f806.firebasestorage.app",
  messagingSenderId: "998778908257",
  appId: "1:998778908257:web:c127e58e4b82b69b070420",
  measurementId: "G-9MM03KGDSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)
export const storage = getStorage(app);
const analytics = getAnalytics(app);