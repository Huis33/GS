// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 1. Add this import
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBe8TDTKXcE1a8IysJbsHGlNeLFHJoGweE",
    authDomain: "gaiascience-f0caf.firebaseapp.com",
    projectId: "gaiascience-f0caf",
    storageBucket: "gaiascience-f0caf.firebasestorage.app",
    messagingSenderId: "526708868467",
    appId: "1:526708868467:web:faae181ff05c75b1fc7106",
    measurementId: "G-J0NYGNW0ZF"
};

// Initialize Firebase
// This check prevents the "Firebase App named '[DEFAULT]' already exists" error during hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the standard Web Auth initialization
const auth = getAuth(app);
const db = getFirestore(app); // 2. Initialize Firestore

export { app, auth, db };
