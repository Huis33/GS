import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const updateUserStatus = async (uid, newStatus) => {
    try {
        const userDocRef = doc(db, "user", uid);

        await updateDoc(userDocRef, {
            availabilityStatus: newStatus,
            lastUpdated: serverTimestamp() // Updates the timestamp in Firebase
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating status: ", error);
        throw error;
    }
};