import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useUser } from '../../../src/context/UserContext';
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SchedulePage() {
    const { userData } = useUser();
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const [selectedDate, setSelectedDate] = useState(today);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const markedDates = useMemo(() => {
        const marks = {};

        tasks.forEach(task => {
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
    }, [tasks, selectedDate]);

    useEffect(() => {
        // Double check if your collection is 'task' or 'tasks'
        const tasksRef = collection(db, 'task');

        // We order by dueDate if possible, otherwise fetch all
        const q = query(tasksRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allTasks = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                let taskDate = null;

                // Convert Firestore Timestamp to YYYY-MM-DD string
                if (data.dueDate && data.dueDate.toDate) {
                    taskDate = data.dueDate.toDate().toLocaleDateString('en-CA');
                } else if (typeof data.dueDate === 'string') {
                    // Handle case where date might be stored as a string
                    taskDate = data.dueDate;
                }

                allTasks.push({
                    id: doc.id,
                    ...data,
                    calendarDate: taskDate
                });
            });

            setTasks(allTasks);
            setLoading(false);
        }, (error) => {
            console.error("Fetch Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredTasks = tasks.filter(t => t.calendarDate === selectedDate);

    // Helper to format the display date in the heading
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
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Calendar */}
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
                        ? "Today's Schedule"
                        : `Schedule for ${formatDisplayDate(selectedDate)}`}
                </Text>
            </View>

            {/* Task List Container */}
            <View style={styles.taskListContainer}>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
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
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(task.progress || 0) * 100}%` }
                                    ]}
                                />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color="#D1D1D1" />
                        <Text style={styles.emptyText}>No tasks scheduled for this day.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFF' }, // Light blueish background
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    scrollContent: { paddingTop: 20, paddingBottom: 40 },

    // Calendar Styling
    calendarWrapper: {
        marginHorizontal: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 25
    },
    calendarInner: { paddingBottom: 10 },

    sectionHeader: { paddingHorizontal: 25, marginBottom: 15 },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },

    // Task Card Styling
    taskCard: {
        backgroundColor: '#D1E0FF', // The color you liked
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 22,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#6389DA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    taskTitle: { fontSize: 19, fontWeight: 'bold', color: '#000', marginBottom: 6 },
    taskSub: { fontSize: 14, color: '#444', marginBottom: 20, lineHeight: 20 },

    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    statusBadge: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: { fontSize: 11, fontWeight: '700', color: '#333', textTransform: 'uppercase' },
    percentText: { fontSize: 13, fontWeight: '800', color: '#000' },

    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.06)',
        borderRadius: 4,
        overflow: 'hidden'
    },
    progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },

    emptyContainer: {
        marginTop: 20,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: { color: '#AAA', fontSize: 15, marginTop: 10, fontWeight: '500' }
});