import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { db, auth } from '../../../firebaseConfig';
import { collection, query, onSnapshot, updateDoc, doc, orderBy, where } from 'firebase/firestore';

export default function TasksPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('To be done');
    const [openStatusId, setOpenStatusId] = useState(null);
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);
    const statusOptions = ['Not Yet Started', 'In Progress', 'Done'];
    //const progressOptions = [0, 0.25, 0.5, 0.75, 1.0];

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // 1. FILTER: Only tasks where assignedIds array contains the current user's UID
        const q = query(
            collection(db, 'task'),
            where('assignedIds', 'array-contains', user.uid),
            orderBy('dueDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const tasks = [];
            querySnapshot.forEach((doc) => {
                tasks.push({ id: doc.id, ...doc.data() });
            });
            setTaskList(tasks);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching tasks: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Update Firebase when local state changes
    const updateTaskInFirebase = async (taskId, updates) => {
        try {
            const taskRef = doc(db, 'task', taskId);

            // Logic: If moving to Done, force progress to 100%
            if (updates.status === 'Done') {
                updates.progress = 1.0;
            }
            // Logic: If moving back to Not Yet Started, force progress to 0%
            if (updates.status === 'In Progress' && updates.progress < 0.1) {
                updates.progress = 0.1;
            }

            await updateDoc(taskRef, updates);
        } catch (error) {
            console.error("Error updating task: ", error);
            Alert.alert("Update Failed", "Check your connection and try again.");
        }
    };

    const handleStatusSelect = (taskId, currentStatus, newStatus) => {
        // 2. LOGIC: Prevent moving back to 'Not Yet Started' if already 'In Progress' or 'Done'
        if (newStatus === 'Not Yet Started' && (currentStatus === 'In Progress' || currentStatus === 'Done')) {
            Alert.alert("Action Blocked", "You cannot move a task back to 'Not Yet Started' once it has begun.");
            setOpenStatusId(null);
            return;
        }

        if (newStatus === 'Done') {
            Alert.alert("Finalize Task", "Once marked as Done, you cannot change the status. Proceed?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: () => {
                        updateTaskInFirebase(taskId, { status: newStatus });
                        setOpenStatusId(null);
                    }
                }
            ]);
        } else {
            updateTaskInFirebase(taskId, { status: newStatus });
            setOpenStatusId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Yet Started': return '#FFDCDC';
            case 'In Progress': return '#F5EFEB';
            case 'Done': return '#D5FFD6';
            default: return '#FFF';
        }
    };

    const formatFirebaseDate = (timestamp) => {
        if (!timestamp) return 'No Date';
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
    };

    const TaskCard = ({ item }) => {
        const isDone = item.status === 'Done';
        const isInProgress = item.status === 'In Progress';
        const isStatusOpen = openStatusId === item.id;

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/task-detail', params: { id: item.id } })}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="calendar-outline" size={18} color="#666" />
                        <Text style={styles.dateText}>{formatFirebaseDate(item.dueDate)}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>{item.taskDescription}</Text>
                </TouchableOpacity>

                {/* PROGRESS SECTION */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressPercentText}>{Math.round(item.progress * 100)}%</Text>
                    </View>

                    <View style={styles.sliderWrapper}>
                        {isInProgress ? (
                            // Interactive Slider only for In Progress
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={1}
                                value={item.progress}
                                minimumTrackTintColor="#27AE60"
                                maximumTrackTintColor="rgba(0,0,0,0.1)"
                                thumbTintColor="#27AE60"
                                onSlidingComplete={(val) => updateTaskInFirebase(item.id, { progress: val })}
                            />
                        ) : (
                            // Static bar for Not Yet Started or Done
                            <View style={styles.staticBarContainer}>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* STATUS DROPDOWN */}
                <View style={styles.dropdownSection}>
                    <TouchableOpacity
                        style={[styles.statusPicker, { backgroundColor: getStatusColor(item.status) }]}
                        onPress={() => !isDone && setOpenStatusId(isStatusOpen ? null : item.id)}
                        disabled={isDone}
                    >
                        <Text style={styles.statusText}>{item.status || 'Not Yet Started'}</Text>
                        {!isDone && <Ionicons name={isStatusOpen ? "chevron-up" : "chevron-down"} size={20} color="#333" />}
                    </TouchableOpacity>

                    {isStatusOpen && (
                        <View style={styles.inlineList}>
                            {statusOptions.map(opt => {
                                return (
                            <TouchableOpacity
                                key={opt}
                                style={styles.inlineOption}
                                onPress={() => handleStatusSelect(item.id, item.status, opt)}
                            >
                                <Text style={styles.optionText}>{opt}</Text>
                                {item.status === opt && <Ionicons name="checkmark" size={16} color="#2F80ED" />}
                            </TouchableOpacity>
                            );
                            })}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return <View style={styles.loader}><ActivityIndicator size="large" color="#2F80ED" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {['To be done', 'Done'].map(tab => (
                    <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}>
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {(() => {
                    // 1. Filter the tasks based on the active tab
                    const filteredTasks = taskList.filter(t =>
                        activeTab === 'Done' ? t.status === 'Done' : t.status !== 'Done'
                    );

                    // 2. If no tasks match the filter, show the empty message
                    if (filteredTasks.length === 0) {
                        return (
                            <View style={styles.emptyContainer}>
                                <Ionicons
                                    name={activeTab === 'Done' ? "checkmark-done-circle-outline" : "clipboard-outline"}
                                    size={60}
                                    color="#D1D5DB"
                                />
                                <Text style={styles.emptyText}>
                                    {activeTab === 'Done'
                                        ? "There are no completed tasks yet."
                                        : "You don't have any pending tasks!"}
                                </Text>
                            </View>
                        );
                    }

                    // 3. Otherwise, map through and show the TaskCards
                    return filteredTasks.map(task => <TaskCard key={task.id} item={task} />);
                })()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
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
    progressContainer: { marginBottom: 15 },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    progressLabel: { fontSize: 14, color: '#666' },
    progressPercentText: { fontSize: 14, color: '#333', fontWeight: 'bold' },
    sliderWrapper: { height: 40, justifyContent: 'center' },
    staticBarContainer: { height: 40, justifyContent: 'center' },
    progressBarBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
    progressBarFill: { height: '100%', backgroundColor: '#27AE60', borderRadius: 4 },
    statusPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: '#333', alignSelf: 'flex-end', minWidth: '55%' },
    statusText: { fontSize: 16, fontWeight: '600', color: '#000' },
    inlineList: { backgroundColor: '#fff', borderRadius: 10, marginTop: 5, borderWidth: 1, borderColor: '#ccc', overflow: 'hidden' },
    inlineOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    optionText: { fontSize: 14, color: '#333' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 10, color: '#94A3B8', fontSize: 16, fontWeight: '500' }
});