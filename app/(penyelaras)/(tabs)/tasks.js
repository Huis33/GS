import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../../components/ScreenContainer';
import { auth, db } from '../../../firebaseConfig';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('To Be Done');
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

    const displayedTasks = tasks.filter(task => {
        if (activeTab === 'Done') return task.status === 'Done';
        if (activeTab === 'To Be Done') {
            // Anything that is NOT 'Done' is considered 'To Be Done'
            return task.status !== 'Done';
        }
        return true;
    });

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
                        { backgroundColor: isOverdue ? '#FFE5E5' : '#F0F7FF' }
                    ]}
                    onPress={() => router.push({ pathname: '/task-detail', params: { id: item?.id } })}
                    activeOpacity={0.9}
                >
                    {/* Top Section: Title & Description */}
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
                        {item?.taskDescription || "No description provided"}
                    </Text>

                    {/* Middle Section: Status & Progress Row */}
                    <View style={styles.progressRow}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>{item?.status}</Text>
                        </View>
                        <Text style={styles.progressPercent}>{statusStyle.width}</Text>
                    </View>

                    {/* Progress Bar */}
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

                    {/* Footer Section: Priority & Date */}
                    <View style={styles.cardFooter}>
                        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                            <Ionicons name={priorityStyle.icon} size={14} color={priorityStyle.text} />
                            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{item?.priority}</Text>
                        </View>
                        <View style={styles.dateBadge}>
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                            <Text style={styles.dateText}>
                                {item?.dueDate?.toDate
                                    ? item.dueDate.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                                    : 'No Date'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } catch (err) {
            console.error("[tasks.js] Fatal error rendering TaskCard for item:", item, err);
            return (
                <View style={styles.card}>
                    <Text style={{ color: 'red' }}>Error rendering task: {item?.name}</Text>
                </View>
            );
        }
    };

    return (
        <ScreenContainer style={styles.container} edges={['bottom']}>
            {/* Horizontal Pill Tabs */}
            <View style={styles.tabBarContainer}>
                {/* 3. Update the array mapped for the tabs */}
                {['To Be Done', 'Done'].map(tab => (
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
                    // 🚀 FIX 1: Fixed padding of 100 clears the FAB perfectly without leaving an awkward gap
                    contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No tasks found.</Text>
                    }
                />
            )}

            {/* 🚀 FIX 2: Revert to standard bottom spacing. ScreenContainer already protects it from the nav bar */}
            <TouchableOpacity
                style={[styles.fab, { bottom: 25 }]}
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

    /* Updated Pill Tabs Styling */
    tabBarContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#F5F9FF' },
    tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTabButton: { borderBottomWidth: 3, borderBottomColor: '#2F80ED' },
    tabText: { fontSize: 16, color: '#999', fontWeight: '500' },
    activeTabText: { color: '#2F80ED' },
    /* Card Listing Styling */
    listContent: { padding: 16 },
    card: { borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    cardDescription: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 16 },

    /* Progress & Status Row */
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    progressPercent: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
    progressBarContainer: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    /* Card Footer Row */
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    priorityText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
    dateBadge: { flexDirection: 'row', alignItems: 'center' },
    dateText: { marginLeft: 6, color: '#64748B', fontSize: 13, fontWeight: '600' },

    /* Floating Action Button */
    fab: {
        position: 'absolute', right: 25, backgroundColor: '#2F80ED',
        width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#2F80ED', shadowOpacity: 0.4, shadowRadius: 10
    },
    emptyText: { textAlign: 'center', marginTop: 100, color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});