import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState, useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { auth } from '../../../firebaseConfig';
import { db } from '../../../firebaseConfig';
import ScreenContainer from '../../../components/ScreenContainer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const PRIORITY_CONFIG = {
        'Critical': { bg: '#FDECEC', text: '#D32F2F', icon: 'alert-circle' },
        'High': { bg: '#FEF0E6', text: '#E65100', icon: 'arrow-up-circle' },
        'Medium': { bg: '#FFF9E6', text: '#F57C00', icon: 'remove-circle' },
        'Low': { bg: '#F1F9F1', text: '#388E3C', icon: 'arrow-down-circle' },
    };

    useEffect(() => {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            setLoading(false);
            return;
        }

        // Modify query to filter by createdBy
        const q = query(
            collection(db, 'task'),
            where('createdBy', '==', currentUser.uid), // Only show tasks made by this user
            orderBy('createdDate', 'desc')
        );

        // onSnapshot allows real-time updates when a new task is added
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("[tasks.js] Received snapshot with docs:", snapshot.docs.length);
            try {
                const tasksList = snapshot.docs.map(doc => {
                    const data = doc.data();
                    let displayDate = 'No Date';
                    try {
                        displayDate = data.dueDate?.toDate ? data.dueDate.toDate().toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short'
                        }) : (data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-GB') : 'No Date');
                    } catch (err) {
                        console.error(`[tasks.js] Error parsing date for task ${doc.id}:`, err);
                    }
                    return {
                        id: doc.id,
                        ...data,
                        displayDate
                    };
                });
                console.log("[tasks.js] Successfully processed tasks:", tasksList.length);
                setTasks(tasksList);
                setLoading(false);
            } catch (err) {
                console.error("[tasks.js] Error processing snapshot:", err);
                setLoading(false);
            }
        }, (error) => {
            console.error("[tasks.js] Firestore Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fix: filter correctly for each tab
    const displayedTasks = tasks.filter(task => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Done') return task.status === 'Done';
        if (activeTab === 'To Do') return task.status === 'Not Yet Started' || task.status === 'Not Yet Assigned';
        if (activeTab === 'In Progress') return task.status === 'In Progress';
        return true;
    });

    // Fix: getProgressWidth must be defined BEFORE getStatusStyles which calls it
    const getProgressWidth = (item) => {
        if (!item?.status) return '0%';
        if (item.status === 'Done') return '100%';
        if (item.status === 'Not Yet Started' || item.status === 'Not Yet Assigned') return '1%';

        if (item.status === 'In Progress') {
            let rawProgress = item.progress;
            if (rawProgress === undefined || rawProgress === null) return '10%';
            if (typeof rawProgress === 'string') {
                rawProgress = parseFloat(rawProgress.replace('%', ''));
            }
            let percentage = rawProgress <= 1 ? rawProgress * 100 : rawProgress;
            percentage = Math.round(percentage);
            if (isNaN(percentage)) return '10%';
            if (percentage < 1) percentage = 1;
            if (percentage > 100) percentage = 100;
            return `${percentage}%`;
        }
        return '0%';
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
                return { bg: '#FFF', text: '#374151', bar: '#9CA3AF', width: '0%' };
        }
    };

    const TaskCard = ({ item }) => {
        const priorityStyle = PRIORITY_CONFIG[item?.priority] || PRIORITY_CONFIG['Medium'];

        const isOverdue = useMemo(() => {
            try {
                if (item?.status === 'Done' || !item?.dueDate) return false;

                const deadline = item.dueDate?.toDate
                    ? item.dueDate.toDate()
                    : new Date(item.dueDate);

                deadline.setHours(23, 59, 59, 999);
                return new Date() > deadline;
            } catch (err) {
                console.error("[tasks.js] Error in isOverdue useMemo for task:", item?.id, err);
                return false;
            }
        }, [item]);

        const baseStatusStyle = getStatusStyles(item);

        const statusStyle = isOverdue
            ? {
                bg: '#FFE5E5',
                text: '#C0392B',
                bar: '#E74C3C',
                width: baseStatusStyle.width
            }
            : baseStatusStyle;

        try {
            return (
                <TouchableOpacity
                    style={[
                        styles.card,
                        { backgroundColor: isOverdue ? '#FFE5E5' : '#F0F7FF'}
                    ]}
                    onPress={() => router.push({ pathname: '/task-detail', params: { id: item?.id } })}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                            <Ionicons name={priorityStyle.icon} size={14} color={priorityStyle.text} />
                            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{item?.priority}</Text>
                        </View>
                        <View style={styles.dateBadge}>
                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                            <Text style={styles.dateText}>
                                {item?.dueDate?.toDate
                                    ? item.dueDate.toDate().toLocaleDateString()
                                    : 'No Date'}
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={[
                            styles.cardTitle,
                            isOverdue && { color: '#B00020' }
                        ]}
                    >
                        {item?.name}
                    </Text>
                    <Text
                        style={[
                            styles.cardDescription,
                            isOverdue && { color: '#7F1D1D' }
                        ]}
                        numberOfLines={2}
                    >
                        {item?.taskDescription}
                    </Text>

                    <View style={styles.progressSection}>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressLabel}>Status Progress: </Text>
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

                    <View style={styles.cardFooter}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item?.status}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>
            );
        } catch (err) {
            console.error("[tasks.js] Fatal error rendering TaskCard for item:", item, err);
            return (
                <View style={styles.card}>
                    <Text style={{color: 'red'}}>Error rendering task: {item?.name}</Text>
                </View>
            );
        }
    };

    // getProgressWidth moved above getStatusStyles to fix definition order

    return (
        // 🚀 3. Wrap with ScreenContainer
        <ScreenContainer style={styles.container}>
            <View style={styles.tabBar}>
                {['All', 'To Do', 'In Progress', 'Done'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#2F80ED" /></View>
            ) : (
                <FlatList
                    data={displayedTasks}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <TaskCard item={item} />}
                    // 🚀 4. Add padding bottom so list isn't blocked by the Add button
                    contentContainerStyle={[{ paddingBottom: insets.bottom + 80 }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No tasks found.</Text>
                    }
                />
            )}

            {/* 🚀 5. Lift the Add Button above the navigation bar */}
            <TouchableOpacity
                style={[styles.fab, { bottom: insets.bottom + 20 }]}
                onPress={() => router.push('/add-task')}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabBar: { flexDirection: 'row', backgroundColor: '#FFF', paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tabItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#2F80ED' },
    // Fix: add missing tabButton / activeTabButton styles (used in JSX)
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    activeTabButton: { borderBottomColor: '#2F80ED' },
    tabText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
    activeTabText: { color: '#2F80ED' },
    scrollContent: { padding: 16 },
    card: { borderRadius: 20, padding: 20, marginBottom: 20, elevation: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    priorityText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
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
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
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