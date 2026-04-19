import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from "../../firebaseConfig";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

export default function ReadOnlyTasksPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('To be done');
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);

    const getProgress = (item) => {
        if (item.status === 'Done') return 1;

        if (item.status === 'In Progress') {
            return item.progress || 0.3; // fallback if missing
        }

        // Not Yet Assigned / Not Yet Started
        return 0;
    };

    useEffect(() => {
        const tasksRef = collection(db, 'task');

        // Simplified query to avoid index requirements
        const unsubscribe = onSnapshot(tasksRef, (querySnapshot) => {
            const tasks = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                tasks.push({ id: doc.id, ...data });
            });
            console.log("Fetched Tasks Count:", tasks.length); // Check if this logs > 0
            setTaskList(tasks);
            setLoading(false);
        }, (error) => {
            console.error("Firebase Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const displayedTasks = useMemo(() => {
        return taskList
            .filter(task => activeTab === 'Done' ? task.status === 'Done' : task.status !== 'Done')
            .sort((a, b) => {
                // Safe Date Parsing
                const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                return dateA - dateB;
            });
    }, [activeTab, taskList]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Yet Assigned': return '#E5E7EB'; // grey
            case 'Not Yet Started': return '#FFDCDC';
            case 'In Progress': return '#F5EFEB';
            case 'Done': return '#D5FFD6';
            default: return '#FFF';
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading tasks...</Text>
            </View>
        );
    }

    const getProgressWidth = (item) => {
        if (!item) return '0%';

        // ✅ Use real progress field (0 → 1)
        const progressValue = Math.max(0, Math.min(item.progress ?? 0, 1));

        const percentage = Math.round(progressValue * 100);
        return `${percentage}%`;
    };

    const getStatusStyles = (item) => {
        if (!item) return { bg: '#FFF', text: '#374151', bar: '#9CA3AF', width: '0%' };

        const width = getProgressWidth(item);

        switch (item.status) {
            case 'Not Yet Started':
                return { bg: '#FFDCDC', text: '#C0392B', bar: '#E74C3C', width };
            case 'In Progress':
                return { bg: '#F5EFEB', text: '#A67C52', bar: '#D35400', width };
            case 'Done':
                return { bg: '#D5FFD6', text: '#1E8449', bar: '#27AE60', width };
            case 'Not Yet Assigned':
                return { bg: '#F1F5F9', text: '#475569', bar: '#94A3B8', width };
            default:
                return { bg: '#FFF', text: '#374151', bar: '#9CA3AF', width };
        }
    };

    const PRIORITY_CONFIG = {
        'Critical': { bg: '#FDECEC', text: '#D32F2F', icon: 'alert-circle' },
        'High': { bg: '#FEF0E6', text: '#E65100', icon: 'arrow-up-circle' },
        'Medium': { bg: '#FFF9E6', text: '#F57C00', icon: 'remove-circle' },
        'Low': { bg: '#F1F9F1', text: '#388E3C', icon: 'arrow-down-circle' },
    };

    const TaskCard = ({ item }) => {
        const statusStyle = getStatusStyles(item);
        const priorityStyle = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG['Medium'];

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/task-detail', params: { id: item.id } })}
                activeOpacity={0.9}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                        <Ionicons name={priorityStyle.icon} size={14} color={priorityStyle.text} />
                        <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
                            {item.priority}
                        </Text>
                    </View>

                    <View style={styles.dateBadge}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.dateText}>
                            {item.dueDate?.toDate
                                ? item.dueDate.toDate().toLocaleDateString()
                                : 'No Date'}
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.taskDescription}
                </Text>

                {/* Progress */}
                <View style={styles.progressSection}>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressLabel}>Status Progress:</Text>
                        <Text style={styles.progressPercent}>{statusStyle.width}</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: statusStyle.width === '0%' ? '100%' : statusStyle.width,
                                    backgroundColor: statusStyle.width === '0%' ? '#D1D5DB' : statusStyle.bar
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <TouchableOpacity
                    onPress={() => setActiveTab('To be done')}
                    style={[styles.tabItem, activeTab === 'To be done' && styles.activeTabItem]}
                >
                    <Text style={[styles.tabText, activeTab === 'To be done' && styles.activeTabText]}>To be done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('Done')}
                    style={[styles.tabItem, activeTab === 'Done' && styles.activeTabItem]}
                >
                    <Text style={[styles.tabText, activeTab === 'Done' && styles.activeTabText]}>Done</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {displayedTasks.length > 0 ? (
                    displayedTasks.map((task) => <TaskCard key={task.id} item={task} />)
                ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={activeTab === 'Done' ? "checkmark-done-outline" : "clipboard-outline"}
                                size={60}
                                color="#E5E7EB"
                            />
                            <Text style={styles.emptyText}>
                                {activeTab === 'Done'
                                    ? "No completed tasks yet"
                                    : "No tasks to be done"}
                            </Text>
                        </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabBar: { flexDirection: 'row', backgroundColor: '#FFF', paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tabItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#2F80ED' },
    tabText: { fontSize: 15, color: '#94A3B8', fontWeight: '600' },
    activeTabText: { color: '#2F80ED' },
    scrollContent: { padding: 16 },
    card: { backgroundColor: '#C8D9FF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    priorityText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    dateBadge: { flexDirection: 'row', alignItems: 'center' },
    dateText: { marginLeft: 4, color: '#64748B', fontSize: 12, fontWeight: '500' },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
    cardDescription: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 16 },
    progressSection: { marginBottom: 16 },
    progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
    progressPercent: { fontSize: 12, color: '#475569', fontWeight: '700' },
    progressBarContainer: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    fab: {
        position: 'absolute', bottom: 30, right: 25, backgroundColor: '#2F80ED',
        width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#2F80ED', shadowOpacity: 0.4, shadowRadius: 10
    },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});