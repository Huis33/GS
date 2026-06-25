// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// 🚀 1. Import initializeAuth, getReactNativePersistence, and getAuth
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
// 🚀 2. Import AsyncStorage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBe8TDTKXcE1a8IysJbsHGlNeLFHJoGweE",
    authDomain: "gaiascience-f0caf.firebaseapp.com",
    projectId: "gaiascience-f0caf",
    storageBucket: "gaiascience-f0caf.firebasestorage.app",
    messagingSenderId: "526708868467",
    appId: "1:526708868467:web:faae181ff05c75b1fc7106",
    measurementId: "G-J0NYGNW0ZF"
};

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 🚀 3. Initialize Auth safely with AsyncStorage persistence
let auth;
try {
    // Try to initialize with AsyncStorage persistence (first app start)
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (e) {
    // If already initialized (e.g. hot-reload), grab existing instance
    auth = getAuth(app);
}

// Initialize Database
export const db = getFirestore(app);
export { auth };
