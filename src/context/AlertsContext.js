// src/context/AlertsContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
// 🚀 ADD 'Modal' TO THIS IMPORT
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUser } from '../../src/context/UserContext';
import { Ionicons } from '@expo/vector-icons';

const AlertsContext = createContext();

export function AlertsProvider({ children }) {
    const { userData } = useUser();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasNotifiedLogin, setHasNotifiedLogin] = useState(false);
    const [readAlertIds, setReadAlertIds] = useState(new Set());
    const [isModalVisible, setIsModalVisible] = useState(false); // 🚀 Global State

    const toggleModal = () => setIsModalVisible(!isModalVisible);

    // 🚀 1. Role-Based Dynamic Firestore Subscription
    useEffect(() => {
        if (!userData || !userData.uid) {
            setTasks([]);
            setLoading(false);
            setIsModalVisible(false); // 🚀 Force close if user logs out
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
        alerts, unreadCount, markAllRead,
        isModalVisible, toggleModal, // 🚀 Expose these
        loading, hasNotifiedLogin, setHasNotifiedLogin
    };

    return (
        <AlertsContext.Provider value={value}>
            {children}
            {/* 🚀 Mount the Modal here so it's globally available */}
            <Modal visible={isModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Alerts Center</Text>
                            <TouchableOpacity onPress={toggleModal}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {alerts.length > 0 ? alerts.map(n => (
                                <View key={n.id} style={styles.notifItem}>
                                    <Text style={styles.notifTitle}>{n.title}</Text>
                                    <Text>{n.body}</Text>
                                </View>
                            )) : <Text>No alerts</Text>}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </AlertsContext.Provider>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    notifItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    notifTitle: { fontWeight: 'bold' }
});

export function useAlerts() {
    return useContext(AlertsContext);
}