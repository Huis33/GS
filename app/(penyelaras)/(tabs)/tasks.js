import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '../../../components/ScreenContainer';
import { auth, db } from '../../../firebaseConfig';

const PRIORITY_CONFIG = {
    'Critical': { bg: '#FDECEC', text: '#D32F2F', icon: 'alert-circle' },
    'High': { bg: '#FEF0E6', text: '#E65100', icon: 'arrow-up-circle' },
    'Medium': { bg: '#FFF9E6', text: '#F57C00', icon: 'remove-circle' },
    'Low': { bg: '#F1F9F1', text: '#388E3C', icon: 'arrow-down-circle' },
};

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('To Be Done');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        // 🚀 FIX: Use an auth state listener instead of checking currentUser once
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, 'task'),
                where('createdBy', '==', user.uid),
                orderBy('createdDate', 'desc')
            );

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const tasksList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTasks(tasksList);
                setLoading(false);
            }, (error) => {
                console.error("Firestore Error:", error);
                setLoading(false);
            });

            return () => unsubscribeSnapshot();
        });

        return () => unsubscribeAuth();
    }, []);

    // 🚀 CRITICAL FILTER FIX: Ensure useMemo is completely outside the useEffect and not duplicated
    const displayedTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesTab = activeTab === 'Done' ? task.status === 'Done' : task.status !== 'Done';
            const matchesSearch = task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.taskDescription?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [tasks, activeTab, searchQuery]);

    // // 2. Handle the sorting safely in JS inside your useMemo hook
    // const displayedTasks = useMemo(() => {
    //     // First, filter the tasks by active tab and search query
    //     const filtered = tasks.filter(task => {
    //         const matchesTab = activeTab === 'Done' ? task.status === 'Done' : task.status !== 'Done';
    //         const matchesSearch = task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //             task.taskDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    //         return matchesTab && matchesSearch;
    //     });

    //     // Second, sort them by createdDate descending safely
    //     return filtered.sort((a, b) => {
    //         const dateA = a.createdDate?.toDate ? a.createdDate.toDate() : new Date(a.createdDate || 0);
    //         const dateB = b.createdDate?.toDate ? b.createdDate.toDate() : new Date(b.createdDate || 0);
    //         return dateB - dateA; // Newest first
    //     });
    // }, [tasks, activeTab, searchQuery]);

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

    // Inline TaskCard Component to easily share methods safely
    const renderTaskItem = ({ item }) => {
        const priorityStyle = PRIORITY_CONFIG[item?.priority] || PRIORITY_CONFIG['Medium'];

        const isOverdue = (() => {
            if (item?.status === 'Done' || !item?.dueDate) return false;
            const deadline = item.dueDate?.toDate ? item.dueDate.toDate() : new Date(item.dueDate);
            deadline.setHours(23, 59, 59, 999);
            return new Date() > deadline;
        })();

        const calculatedStyles = getStatusStyles(item);
        const statusStyle = isOverdue
            ? { bg: '#FFE5E5', text: '#C0392B', bar: '#E74C3C', width: calculatedStyles.width }
            : calculatedStyles;

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: isOverdue ? '#FFE5E5' : '#F0F7FF' }]}
                onPress={() => router.push({ pathname: '/task-detail', params: { id: item?.id } })}
            >
                <Text style={[styles.cardTitle, isOverdue && { color: '#B00020' }]}>{item?.name}</Text>
                <Text style={[styles.cardDescription, isOverdue && { color: '#7F1D1D' }]} numberOfLines={2}>
                    {item?.taskDescription || "No description provided"}
                </Text>

                <View style={styles.progressRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>{item?.status}</Text>
                    </View>
                    <Text style={styles.progressPercent}>{statusStyle.width}</Text>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: statusStyle.width === '0%' ? '100%' : statusStyle.bar ? statusStyle.width : '1%', backgroundColor: statusStyle.width === '0%' ? '#D1D5DB' : statusStyle.bar }]} />
                </View>

                <View style={styles.cardFooter}>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                        <Ionicons name={priorityStyle.icon} size={14} color={priorityStyle.text} />
                        <Text style={[styles.priorityText, { color: priorityStyle.text }]}>{item?.priority}</Text>
                    </View>
                    <View style={styles.dateBadge}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.dateText}>
                            {item?.dueDate?.toDate ? item.dueDate.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No Date'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <TextInput
                        placeholder="Search tasks..."
                        placeholderTextColor="#888888"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Ionicons name="search" size={20} color="#666" />
                </View>
            </View>

            {/* Horizontal Pill Tabs */}
            <View style={styles.tabBarContainer}>
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
                    renderItem={renderTaskItem}
                    contentContainerStyle={styles.listContent} // Added this back so your layout isn't blank/squished
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No tasks found.</Text>
                    }
                />
            )}

            <TouchableOpacity
                style={[
                    styles.fab,
                    { bottom: Math.max(insets.bottom + 16, 25) }
                ]}
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
    tabBarContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#F5F9FF' },
    tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
    activeTabButton: { borderBottomWidth: 3, borderBottomColor: '#2F80ED' },
    tabText: { fontSize: 16, color: '#999', fontWeight: '500' },
    activeTabText: { color: '#2F80ED' },
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        marginHorizontal: 10,
        marginVertical: 5
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100, // Kept deep padding to clear the FAB perfectly
        maxWidth: 700,
        width: '100%',
        alignSelf: 'center'
    },
    cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    cardDescription: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 16 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    progressPercent: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
    progressBarContainer: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexShrink: 1 },
    priorityText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },
    dateBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
    dateText: { marginLeft: 6, color: '#64748B', fontSize: 13, fontWeight: '600' },
    fab: {
        position: 'absolute', right: 25, backgroundColor: '#2F80ED',
        width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#2F80ED', shadowOpacity: 0.4, shadowRadius: 10
    },
    emptyText: { textAlign: 'center', marginTop: 100, color: '#94A3B8', fontSize: 16, fontWeight: '500' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 10, marginTop: 10 },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F4F9',
        borderRadius: 25,
        paddingHorizontal: 20,
        height: 50,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
});