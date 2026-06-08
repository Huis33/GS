// src/service/NotificationService.js
import * as Notifications from 'expo-notifications';

// Set how the notification looks when it arrives
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const sendPushNotification = async (taskName, status) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Task Update 🚀",
            body: `The task "${taskName}" is now ${status}.`,
            data: { data: 'goes here' },
        },
        trigger: { seconds: 1 }, // Send 1 second from now
    });
};