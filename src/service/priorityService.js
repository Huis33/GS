import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust path to your config

export const addPriorityCategory = async (categoryName, description, priority) => {
    try {
        const priorityRef = collection(db, 'priority');

        // This matches the structure seen in your Firebase console image
        const docRef = await addDoc(priorityRef, {
            categoryName: categoryName,
            description: description,
            category: priority, // E.g., "Medium", "High"
            createdAt: serverTimestamp() // Useful for sorting later
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding category: ", error);
        throw error;
    }
};