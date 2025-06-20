import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBcXf_r8Qkv-NWVc5HR_c54Qsb1BrTk9QU",
  authDomain: "anexodb-9f806.firebaseapp.com",
  projectId: "anexodb-9f806",
  storageBucket: "anexodb-9f806.firebasestorage.app",
  messagingSenderId: "998778908257",
  appId: "1:998778908257:web:c127e58e4b82b69b070420",
  measurementId: "G-9MM03KGDSY"
};

// IMPORTANTE: Usar una sola instancia
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'us-central1');
const storage=getStorage(app);

export { app, auth, db, functions,storage };