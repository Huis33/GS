// src/service/NotificationService.js
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Safe wrapper to eliminate immediate auto-registration faults on startup inside Expo Go (SDK 53+)
const getNotifications = () => {
    if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
        return {
            scheduleNotificationAsync: async () => 'mock-notification-id',
            cancelScheduledNotificationAsync: async () => { },
            setNotificationHandler: () => { },
            requestPermissionsAsync: async () => ({ status: 'granted' }),
            SchedulableTriggerInputTypes: { DATE: 'date' }
        };
    }
    return require('expo-notifications');
};

const DUE_SOON_HOURS = 24;

const dueSoonId = (taskId) => `due_soon_${taskId}`;
const overdueId = (taskId) => `overdue_${taskId}`;

function toDate(dueDate) {
    if (dueDate?.toDate) return dueDate.toDate();
    return new Date(dueDate);
}

export async function cancelTaskDueNotifications(taskId) {
    const Notifications = getNotifications();
    await Notifications.cancelScheduledNotificationAsync(dueSoonId(taskId));
    await Notifications.cancelScheduledNotificationAsync(overdueId(taskId));
}

export async function scheduleTaskDueNotifications(task) {
    const { id, name, dueDate, status } = task;
    if (!id || !dueDate || status === 'Done') {
        if (id) await cancelTaskDueNotifications(id);
        return;
    }

    await cancelTaskDueNotifications(id);

    const deadline = toDate(dueDate);
    const now = new Date();
    const dueSoonDate = new Date(deadline.getTime() - DUE_SOON_HOURS * 60 * 60 * 1000);
    const Notifications = getNotifications();

    if (deadline <= now) {
        await Notifications.scheduleNotificationAsync({
            identifier: overdueId(id),
            content: {
                title: 'Task Overdue ⚠️',
                body: `"${name}" is overdue! (Due: ${deadline.toLocaleDateString('en-GB')})`,
                data: { taskId: id, type: 'overdue' },
            },
            trigger: null,
        });
        return;
    }

    if (dueSoonDate > now) {
        await Notifications.scheduleNotificationAsync({
            identifier: dueSoonId(id),
            content: {
                title: 'Task Due Soon ⏰',
                body: `"${name}" is due in ${DUE_SOON_HOURS} hours.`,
                data: { taskId: id, type: 'due_soon' },
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueSoonDate },
        });
    } else {
        await Notifications.scheduleNotificationAsync({
            identifier: dueSoonId(id),
            content: {
                title: 'Task Due Soon ⏰',
                body: `"${name}" is due very soon! (Deadline: ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
                data: { taskId: id, type: 'due_soon' },
            },
            trigger: null,
        });
    }

    await Notifications.scheduleNotificationAsync({
        identifier: overdueId(id),
        content: {
            title: 'Task Overdue ⚠️',
            body: `"${name}" is now overdue.`,
            data: { taskId: id, type: 'overdue' },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: deadline },
    });
}

export async function syncAllTaskDueNotifications(tasks) {
    for (const task of tasks) {
        await scheduleTaskDueNotifications(task);
    }
}

export async function configureNotifications() {
    const Notifications = getNotifications();
    Notifications.setNotificationHandler({
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
    const Notifications = getNotifications();
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function sendPushNotification(taskName, status) {
    const Notifications = getNotifications();
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Task Update 🚀',
            body: `The task "${taskName}" is now ${status}.`,
            data: { type: 'status_change' },
        },
        trigger: { seconds: 1 },
    });
}