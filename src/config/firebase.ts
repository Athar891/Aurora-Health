/**
 * Firebase Configuration
 *
 * Replace the placeholder values below with your actual Firebase project config.
 * You can find these in: Firebase Console → Project Settings → General → Your apps → SDK setup
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence to fix warning and session loss
let auth: ReturnType<typeof getAuth>;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  // initializeAuth must be called before getAuth
  // If the app was already initialized (e.g. during fast refresh), getAuth() might exist
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e: any) {
    // If it's already initialized, just get it
    if (e.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      auth = getAuth(app); // fallback
    }
  }
}



// Initialize Firestore
const db = getFirestore(app);

// Initialize AI Logic
export { app, auth, db };
