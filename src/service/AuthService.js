import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig'; // Adjust paths as needed

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Firestore user collection
        const userDocRef = doc(db, "user", user.uid); 
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw { code: 'auth/user-not-found', message: 'User record not found in database.' };
        }

        const data = userDoc.data();

        return {
            ...data, 
            user: user
        };
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        // We throw the error so the UI component can catch it and show an Alert
        throw error;
    }
};