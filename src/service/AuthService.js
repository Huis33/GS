import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig'; // Adjust paths as needed

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Firestore user collection
        const userDocRef = doc(db, "user", user.uid); 
        const userDoc = await getDoc(doc(db, "user", user.uid));

        if (!userDoc.exists()) {
            throw { code: 'auth/user-not-found', message: 'User record not found in database.' };
        }

        const userData = userDoc.data();

        return {
            user,
            role: userData.role, // "Jurutera", etc.
            status: userData.status
        };
    } catch (error) {
        throw error;
    }
};