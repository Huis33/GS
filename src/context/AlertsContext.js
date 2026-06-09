// src/context/AlertsContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUser } from './UserContext';

const AlertsContext = createContext();

export function AlertsProvider({ children }) {
    const { userData } = useUser();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasNotifiedLogin, setHasNotifiedLogin] = useState(false);
    const [readAlertIds, setReadAlertIds] = useState(new Set());

    // 1. Role-Based Dynamic Firestore Subscription
    useEffect(() => {
        if (!userData || !userData.uid) {
            setTasks([]);
            setLoading(false);
            return;
        }

        const role = (userData.role || '').trim().toLowerCase();
        const isJurutera = role === 'engineer' || role === 'jurutera';
        const isPenyelaras = role === 'servicecoordinator' || role === 'penyelaras';

        let q;
        const tasksRef = collection(db, 'task');

        if (isJurutera) {
            q = query(tasksRef, where('assignedIds', 'array-contains', userData.uid));
        } else if (isPenyelaras) {
            q = query(tasksRef, where('createdBy', '==', userData.uid));
        } else {
            // Fallback for other roles (e.g. Pengurus) to monitor all tasks
            q = query(tasksRef);
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const taskData = [];
            snapshot.forEach((doc) => {
                taskData.push({ id: doc.id, ...doc.data() });
            });
            setTasks(taskData);
            setLoading(false);
        }, (error) => {
            console.error("Alerts subscription error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData]);

    // 2. Compute Alerts Engine (buildTaskAlerts)
    const alerts = useMemo(() => {
        const list = [];
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
                list.push({
                    id: `overdue-${task.id}`,
                    title: 'Task Overdue ⚠️',
                    body: `"${task.name || 'Untitled Task'}" is past its deadline!`,
                    type: 'overdue'
                });
            } else {
                const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (hoursLeft <= 24 && hoursLeft > 0) {
                    list.push({
                        id: `soon-${task.id}`,
                        title: 'Task Due Soon ⏰',
                        body: `"${task.name || 'Untitled Task'}" is due within 24 hours.`,
                        type: 'due_soon'
                    });
                }
            }
        });
        return list;
    }, [tasks]);

    // 3. Compute Unread Count Dynamically
    const unreadCount = useMemo(() => {
        return alerts.filter(alert => !readAlertIds.has(alert.id)).length;
    }, [alerts, readAlertIds]);

    // 4. Mark Actions
    const markAllRead = () => {
        const allIds = alerts.map(a => a.id);
        setReadAlertIds(new Set(allIds));
    };

    const value = {
        alerts,
        unreadCount,
        markAllRead,
        loading,
        hasNotifiedLogin,
        setHasNotifiedLogin
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