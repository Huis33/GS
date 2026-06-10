// src/context/AlertsContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUser } from '../../src/context/UserContext';

const AlertsContext = createContext();

export function AlertsProvider({ children }) {
    const { userData } = useUser();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasNotifiedLogin, setHasNotifiedLogin] = useState(false);
    const [readAlertIds, setReadAlertIds] = useState(new Set());
    const [isModalVisible, setIsModalVisible] = useState(false);

    const toggleModal = () => setIsModalVisible(!isModalVisible);

    // 1. Role-Based Dynamic Firestore Subscription
    useEffect(() => {
        if (!userData || !userData.uid) {
            setTasks([]);
            setLoading(false);
            setIsModalVisible(false); // 🚀 Ensure modal closes if user logs out
            setHasNotifiedLogin(false); // Reset auto-popup for next login
            return;
        }

        const role = (userData.role || '').trim().toLowerCase();
        const isJurutera = role === 'engineer' || role === 'jurutera';
        const isPenyelaras = role === 'servicecoordinator' || role === 'penyelaras';

        let q;
        const tasksRef = collection(db, 'task');
        if (isJurutera) q = query(tasksRef, where('assignedIds', 'array-contains', userData.uid));
        else if (isPenyelaras) q = query(tasksRef, where('createdBy', '==', userData.uid));
        else q = query(tasksRef);

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

    // 2. Compute Alerts Engine
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
                list.push({ id: `overdue-${task.id}`, title: 'Task Overdue ⚠️', body: `"${task.name || 'Untitled Task'}" is past its deadline!`, type: 'overdue' });
            } else {
                const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (hoursLeft <= 24 && hoursLeft > 0) {
                    list.push({ id: `soon-${task.id}`, title: 'Task Due Soon ⏰', body: `"${task.name || 'Untitled Task'}" is due within 24 hours.`, type: 'due_soon' });
                }
            }
        });
        return list;
    }, [tasks]);

    // 3. Auto Pop-up ONCE after login
    useEffect(() => {
        // Only pop up if user is logged in, tasks are loaded, there are alerts, and we haven't popped up yet
        if (userData && !loading && alerts.length > 0 && !hasNotifiedLogin) {
            setIsModalVisible(true);
            setHasNotifiedLogin(true); // Lock it so it doesn't open again during this session
        }
    }, [userData, loading, alerts, hasNotifiedLogin]);

    const unreadCount = useMemo(() => {
        return alerts.filter(alert => !readAlertIds.has(alert.id)).length;
    }, [alerts, readAlertIds]);

    const markAllRead = () => {
        const doneTaskIds = tasks.filter(task => task.status === 'Done').map(task => [`overdue-${task.id}`, `soon-${task.id}`]).flat();
        setReadAlertIds(new Set(doneTaskIds));
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