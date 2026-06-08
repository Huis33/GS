import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync';

export async function configureNotifications() {
    setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function requestNotificationPermissions() {
    const { status } = await requestPermissionsAsync();
    return status === 'granted';
}

export const sendPushNotification = async (taskName, status) => {
    await scheduleNotificationAsync({
        content: {
            title: 'Task Update 🚀',
            body: `The task "${taskName}" is now ${status}.`,
            data: { data: 'goes here' },
        },
        trigger: { seconds: 1 },
    });
};
