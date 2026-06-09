import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db, auth } from "../../../firebaseConfig";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
// 🛠️ IMPORTED: Added Tabs from expo-router to handle header overriding
import { useRouter, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AssignedSchedulePage() {
    const router = useRouter();

    // Core State
    const today = new Date().toLocaleDateString('en-CA');
    const [selectedDate, setSelectedDate] = useState(today);
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);

    // In-App Notification States
    const [isNotifVisible, setIsNotifVisible] = useState(false);
    const [hasShownPopupOnLogin, setHasShownPopupOnLogin] = useState(false);

    // 1. Fetch Assigned Tasks Stream
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'task'),
            where('assignedIds', 'array-contains', user.uid),
            orderBy('dueDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                let taskDate = null;

                if (data.dueDate && data.dueDate.toDate) {
                    taskDate = data.dueDate.toDate().toLocaleDateString('en-CA');
                } else if (typeof data.dueDate === 'string') {
                    taskDate = data.dueDate;
                }

                tasks.push({
                    id: doc.id,
                    ...data,
                    calendarDate: taskDate
                });
            });
            setTaskList(tasks);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching tasks: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Real-time Live Notification Calculations
    const notifications = useMemo(() => {
        const list = [];
        const now = new Date();

        taskList.forEach(task => {
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
    }, [taskList]);

    // 3. Trigger Pop-up Alert Automatically on Login Entry
    useEffect(() => {
        if (!loading && notifications.length > 0 && !hasShownPopupOnLogin) {
            setIsNotifVisible(true);
            setHasShownPopupOnLogin(true);
        }
    }, [loading, notifications, hasShownPopupOnLogin]);

    // 4. Generate Calendar Markers
    const markedDates = useMemo(() => {
        const marks = {};
        taskList.forEach(task => {
            if (task.calendarDate) {
                marks[task.calendarDate] = { marked: true, dotColor: '#6389DA' };
            }
        });

        marks[selectedDate] = {
            ...(marks[selectedDate] || {}),
            selected: true,
            selectedColor: '#6389DA'
        };
        return marks;
    }, [taskList, selectedDate]);

    const tasksForSelectedDay = taskList.filter(t => t.calendarDate === selectedDate);

    const formatDisplayDate = (dateStr) => {
        const options = { day: 'numeric', month: 'long' };
        return new Date(dateStr).toLocaleDateString('en-MY', options);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6389DA" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Calendar Section */}
                <View style={styles.calendarWrapper}>
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#b6c1cd',
                            selectedDayBackgroundColor: '#6389DA',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#6389DA',
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            dotColor: '#6389DA',
                            arrowColor: '#333',
                            monthTextColor: '#000',
                            textDayFontWeight: '500',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '500',
                            textDayFontSize: 14,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 12
                        }}
                        style={styles.calendarInner}
                    />
                </View>

                {/* Heading */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {selectedDate === today
                            ? "My Tasks Today"
                            : `Tasks for ${formatDisplayDate(selectedDate)}`}
                    </Text>
                </View>

                {/* Task List Layout */}
                <View style={styles.taskListContainer}>
                    {tasksForSelectedDay.length > 0 ? (
                        tasksForSelectedDay.map(task => (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() => router.push({ pathname: '/task-detail', params: { id: task.id } })}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.taskTitle}>{task.name || "Untitled Task"}</Text>
                                <Text style={styles.taskSub} numberOfLines={2}>
                                    {task.taskDescription || "No description provided."}
                                </Text>

                                <View style={styles.progressRow}>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>{task.status}</Text>
                                    </View>
                                    <Text style={styles.percentText}>
                                        {Math.round((task.progress || 0) * 100)}%
                                    </Text>
                                </View>

                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${(task.progress || 0) * 100}%` }]} />
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="clipboard-outline" size={48} color="#D1D1D1" />
                            <Text style={styles.emptyText}>No tasks assigned to you for this date.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* In-App Alerts Dialog Panel Modal */}
            <Modal
                visible={isNotifVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsNotifVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="notifications" size={22} color="#6389DA" style={{ marginRight: 8 }} />
                                <Text style={styles.modalTitle}>Alerts Center</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsNotifVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <View key={notif.id} style={[
                                        styles.notifAlertItem,
                                        notif.type === 'overdue' ? styles.borderOverdue : styles.borderSoon
                                    ]}>
                                        <Text style={styles.notifAlertTitle}>{notif.title}</Text>
                                        <Text style={styles.notifAlertBody}>{notif.body}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                                    <Ionicons name="checkmark-circle-outline" size={44} color="#27AE60" />
                                    <Text style={styles.noNotifText}>You are all caught up! No active alerts.</Text>
                                </View>
                            )}
                        </ScrollView>

                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsNotifVisible(false)}>
                            <Text style={styles.modalCloseButtonText}>Acknowledge</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    scrollContent: { paddingBottom: 40 },

    // Header Placements
    notifHeaderButton: { marginRight: 24, position: 'relative', padding: 4 },
    badgeOverlay: { position: 'absolute', top: 0, right: 0, backgroundColor: '#E74C3C', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    calendarWrapper: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 25 },
    calendarInner: { paddingBottom: 10 },
    sectionHeader: { paddingHorizontal: 25, marginBottom: 15 },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
    taskListContainer: { flex: 1 },
    taskCard: { backgroundColor: '#D1E0FF', marginHorizontal: 20, borderRadius: 24, padding: 22, marginBottom: 16, elevation: 2, shadowColor: '#6389DA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
    taskTitle: { fontSize: 19, fontWeight: 'bold', color: '#000', marginBottom: 6 },
    taskSub: { fontSize: 14, color: '#444', marginBottom: 20, lineHeight: 20 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    statusBadge: { backgroundColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700', color: '#333', textTransform: 'uppercase' },
    percentText: { fontSize: 13, fontWeight: '800', color: '#000' },
    progressBar: { height: 8, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
    emptyContainer: { marginTop: 20, padding: 40, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#AAA', fontSize: 15, marginTop: 10, fontWeight: '500', textAlign: 'center' },

    // Modal Overlay Styling
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 22, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12, marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    notifAlertItem: { backgroundColor: '#F8FAFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#EBF0FF' },
    borderOverdue: { borderLeftWidth: 5, borderLeftColor: '#E74C3C' },
    borderSoon: { borderLeftWidth: 5, borderLeftColor: '#F39C12' },
    notifAlertTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 3 },
    notifAlertBody: { fontSize: 13, color: '#555', lineHeight: 18 },
    noNotifText: { color: '#64748B', fontSize: 14, marginTop: 10, fontWeight: '500' },
    modalCloseButton: { backgroundColor: '#6389DA', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 15 },
    modalCloseButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});