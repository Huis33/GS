// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

// Initialize App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);