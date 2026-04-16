import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../src/context/UserContext'; // Path to your context
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, auth } from "../../../firebaseConfig";

export default function ReadOnlyTasksPage() {
    const router = useRouter();
    const { userData } = useUser();
    const [activeTab, setActiveTab] = useState('To be done');
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);

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
            const tasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to readable string
                displayDate: doc.data().dueDate?.toDate().toLocaleDateString() || 'No Date'
            }));
            setTaskList(tasks);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const displayedTasks = taskList.filter(task => {
        return activeTab === 'Done' ? task.status === 'Done' : task.status !== 'Done';
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Yet Assigned': return '#E0E0E0'; // Grey
            case 'Not Yet Started': return '#FFDCDC';
            case 'In Progress': return '#F5EFEB';
            case 'Done': return '#D5FFD6';
            default: return '#FFF';
        }
    };

    const TaskCard = ({ item }) => {
        // Mock progress calculation since DB doesn't have a progress % yet
        const progressValue = item.status === 'Done' ? 1 : 0;

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/task-detail',
                        params: { id: item.id } // Pass ID to detail page
                    })}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="calendar-outline" size={18} color="#666" />
                        <Text style={styles.dateText}>Due: {item.displayDate}</Text>
                    </View>

                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {item.taskDescription}
                    </Text>

                    <View style={styles.progressContainer}>
                        <Text style={styles.progressLabel}>Status</Text>
                        <Text style={styles.progressPercent}>{item.priority} Priority</Text>
                    </View>

                    {/* Progress Bar based on status */}
                    <View style={styles.progressBarBg}>
                        <View style={[
                            styles.progressBarFill,
                            { width: item.status === 'Done' ? '100%' : '10%' }
                        ]} />
                    </View>

                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) }
                    ]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </TouchableOpacity>
            </View>
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

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2F80ED" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {displayedTasks.length > 0 ? (
                        displayedTasks.map((task) => <TaskCard key={task.id} item={task} />)
                    ) : (
                        <Text style={styles.emptyText}>No tasks found.</Text>
                    )}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/add-task')}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={35} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#F5F9FF' },
    tabItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#2F80ED' },
    tabText: { fontSize: 16, color: '#999', fontWeight: '500' },
    activeTabText: { color: '#2F80ED' },
    scrollContent: { padding: 20 },
    card: { backgroundColor: '#C8D9FF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 5 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dateText: { marginLeft: 6, color: '#666', fontSize: 14 },
    cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 10 },
    cardDescription: { fontSize: 15, color: '#333', lineHeight: 20, marginBottom: 15 },
    progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 14, color: '#666' },
    progressPercent: { fontSize: 14, color: '#666', fontWeight: 'bold' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 20 },
    progressBarFill: { height: '100%', backgroundColor: '#27AE60', borderRadius: 3 },
    statusBadge: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#333',
        alignSelf: 'flex-end'
    },
    statusText: { fontSize: 14, fontWeight: '600', color: '#000' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#2F80ED',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        zIndex: 999,
    },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});