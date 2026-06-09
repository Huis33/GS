import * as Notifications from 'expo-notifications';
import cancelScheduledNotificationAsync from 'expo-notifications/build/cancelScheduledNotificationAsync';

const DUE_SOON_HOURS = 24; // adjust as needed

const dueSoonId = (taskId) => `due_soon_${taskId}`;
const overdueId = (taskId) => `overdue_${taskId}`;

function toDate(dueDate) {
    if (dueDate?.toDate) return dueDate.toDate();
    return new Date(dueDate);
}

export async function cancelTaskDueNotifications(taskId) {
    await cancelScheduledNotificationAsync(dueSoonId(taskId));
    await cancelScheduledNotificationAsync(overdueId(taskId));
}

export async function scheduleTaskDueNotifications(task) {
    const { id, name, dueDate, status } = task;
    if (!id || !dueDate || status === 'Done') {
        if (id) await cancelTaskDueNotifications(id);
        return;
    }

    await cancelTaskDueNotifications(id); // clear old schedules first

    const deadline = toDate(dueDate);
    const now = new Date();
    const dueSoonDate = new Date(deadline.getTime() - DUE_SOON_HOURS * 60 * 60 * 1000);

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
    }

    if (deadline > now) {
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
}

export async function syncAllTaskDueNotifications(tasks) {
    for (const task of tasks) {
        await scheduleTaskDueNotifications(task);
    }
}

export async function configureNotifications() {
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
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function sendPushNotification(taskName, status) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Task Update 🚀',
            body: `The task "${taskName}" is now ${status}.`,
            data: { type: 'status_change' },
        },
        trigger: { seconds: 1 },
    });
}