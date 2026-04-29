// src/service/AnalyticsService.js
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// This service listens to the task collection and calculates stats on the device
export const listenToAnalytics = (onUpdate) => {
    return onSnapshot(collection(db, 'task'), (snapshot) => {
        let total = 0;
        let completed = 0;
        const engineerCounts = {};
        const coordinatorCounts = {};

        snapshot.forEach(doc => {
            const task = doc.data();
            total++;
            if (task.status === 'Done') completed++;

            if (task.assignedTo && Array.isArray(task.assignedTo)) {
                task.assignedTo.forEach(name => {
                    engineerCounts[name] = (engineerCounts[name] || 0) + 1;
                });
            }
            if (task.creatorName) {
                coordinatorCounts[task.creatorName] = (coordinatorCounts[task.creatorName] || 0) + 1;
            }
        });

        // Send the calculated data back to the UI
        onUpdate({ total, completed, engineerCounts, coordinatorCounts });
    });
};