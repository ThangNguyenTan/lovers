import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Replace with your actual Firebase project config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCcqEpy9sfDkqqrN8Q64uscLj4aNMN0f20",
  authDomain: "distance-lovers-1d99b.firebaseapp.com",
  projectId: "distance-lovers-1d99b",
  storageBucket: "distance-lovers-1d99b.firebasestorage.app",
  messagingSenderId: "819586887429",
  appId: "1:819586887429:web:cf01e22b8a6482f6dc516c",
  measurementId: "G-ZZDGY09GFB"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Handle cross-platform Auth initialization
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (e) {
    auth = getAuth(app);
  }
}

if (!auth) {
  console.error("CRITICAL: Firebase Auth failed to initialize!");
}


// Initialize Realtime Database (for active location pings)
const database = getDatabase(app);

// Initialize Firestore (for persistent structured data)
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, database, db, googleProvider };
