// src/context/AlertsContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUser } from '../../src/context/UserContext';
import { sendNewTaskNotification, sendTaskUpdatedNotification } from '../service/NotificationService';

const AlertsContext = createContext();

function toMillis(timestamp) {
    if (!timestamp) return 0;
    if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
    if (timestamp.seconds) return timestamp.seconds * 1000;
    return new Date(timestamp).getTime() || 0;
}

function detectJuruteraTaskEvents(prevTasksMap, taskData, userId) {
    const events = [];

    taskData.forEach((task) => {
        const prev = prevTasksMap[task.id];
        const taskName = task.name || 'Untitled Task';
        const creator = task.creatorName || 'Coordinator';
        const isAssigned = task.assignedIds?.includes(userId);

        if (!isAssigned) return;

        if (!prev) {
            events.push({
                id: `new-${task.id}`,
                title: 'New Task Assigned 📋',
                body: `"${taskName}" was assigned to you by ${creator}.`,
                type: 'new_task',
                taskName,
                creatorName: creator,
            });
            return;
        }

        const wasAssigned = prev.assignedIds?.includes(userId);
        if (!wasAssigned) {
            events.push({
                id: `new-${task.id}`,
                title: 'New Task Assigned 📋',
                body: `"${taskName}" was assigned to you by ${creator}.`,
                type: 'new_task',
                taskName,
                creatorName: creator,
            });
            return;
        }

        const prevEdited = toMillis(prev.lastEditedAt);
        const currEdited = toMillis(task.lastEditedAt);
        if (currEdited > prevEdited && task.status !== 'Done') {
            events.push({
                id: `updated-${task.id}-${currEdited}`,
                title: 'Task Updated ✏️',
                body: `"${taskName}" was updated by your coordinator.`,
                type: 'task_updated',
                taskName,
            });
        }
    });

    return events;
}

export function AlertsProvider({ children }) {
    const { userData } = useUser();
    const [tasks, setTasks] = useState([]);
    const [eventAlerts, setEventAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasNotifiedLogin, setHasNotifiedLogin] = useState(false);
    const [readAlertIds, setReadAlertIds] = useState(new Set());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const prevTasksRef = useRef(null);

    const toggleModal = () => setIsModalVisible(!isModalVisible);

    // 1. Role-Based Dynamic Firestore Subscription
    useEffect(() => {
        const user = auth.currentUser;

        if (!userData || !user) {
            setTasks([]);
            setEventAlerts([]);
            setLoading(false);
            setIsModalVisible(false);
            setHasNotifiedLogin(false);
            prevTasksRef.current = null;
            return;
        }

        const role = (userData.role || '').trim().toLowerCase();
        const isJurutera = role === 'engineer' || role === 'jurutera';
        const isPenyelaras = role === 'servicecoordinator' || role === 'penyelaras';

        let q;
        const tasksRef = collection(db, 'task');

        if (isJurutera) {
            q = query(tasksRef, where('assignedIds', 'array-contains', user.uid));
        } else if (isPenyelaras) {
            q = query(tasksRef, where('createdBy', '==', user.uid));
        } else {
            q = query(tasksRef);
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskData = [];
            snapshot.forEach((docSnap) => {
                taskData.push({ id: docSnap.id, ...docSnap.data() });
            });

            if (isJurutera && prevTasksRef.current) {
                const newEvents = detectJuruteraTaskEvents(prevTasksRef.current, taskData, user.uid);

                if (newEvents.length > 0) {
                    setEventAlerts((prev) => {
                        const existingIds = new Set(prev.map((event) => event.id));
                        const toAdd = newEvents.filter((event) => !existingIds.has(event.id));
                        return [...prev, ...toAdd];
                    });

                    newEvents.forEach((event) => {
                        if (event.type === 'new_task') {
                            sendNewTaskNotification(event.taskName, event.creatorName).catch((err) =>
                                console.error('New task notification error:', err)
                            );
                        } else {
                            sendTaskUpdatedNotification(event.taskName).catch((err) =>
                                console.error('Task updated notification error:', err)
                            );
                        }
                    });
                }
            }

            prevTasksRef.current = Object.fromEntries(taskData.map((task) => [task.id, task]));
            setTasks(taskData);
            setLoading(false);
        }, (error) => {
            console.error("Alerts subscription error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData]);

    // 2. Compute Alerts Engine
    const alerts = useMemo(() => {
        const list = [...eventAlerts];
        const now = new Date();

        tasks.forEach(task => {
            if (task.status === 'Done' || !task.dueDate) return;

            let deadline;
            if (task.dueDate && typeof task.dueDate.toDate === 'function') {
                deadline = task.dueDate.toDate();
            } else {
                deadline = new Date(task.dueDate);
            }

            if (now > deadline) {
                list.push({ id: `overdue-${task.id}`, title: 'Task Overdue ⚠️', body: `"${task.name || 'Untitled Task'}" is past its deadline!`, type: 'overdue' });
            } else {
                const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (hoursLeft <= 24 && hoursLeft > 0) {
                    list.push({ id: `soon-${task.id}`, title: 'Task Due Soon ⏰', body: `"${task.name || 'Untitled Task'}" is due within 24 hours.`, type: 'due_soon' });
                }
            }
        });
        return list;
    }, [tasks, eventAlerts]);

    // 3. Auto Pop-up ONCE after login
    useEffect(() => {
        if (userData && !loading && alerts.length > 0 && !hasNotifiedLogin) {
            setIsModalVisible(true);
            setHasNotifiedLogin(true);
        }
    }, [userData, loading, alerts, hasNotifiedLogin]);

    const unreadCount = useMemo(() => {
        return alerts.filter(alert => !readAlertIds.has(alert.id)).length;
    }, [alerts, readAlertIds]);

    const markAllRead = () => {
        setReadAlertIds((prev) => {
            const next = new Set(prev);
            alerts.forEach((alert) => next.add(alert.id));
            return next;
        });
    };

    const value = {
        alerts, unreadCount, markAllRead,
        isModalVisible, toggleModal,
        loading
    };

    return (
        <AlertsContext.Provider value={value}>
            {children}
        </AlertsContext.Provider>
    );
}

export function useAlerts() {
    return useContext(AlertsContext);
}
