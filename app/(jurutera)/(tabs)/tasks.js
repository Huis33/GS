import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActionSheetIOS, // For iOS styling, or use a custom Modal for Android
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../src/context/UserContext'; // Path to your context
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function TasksPage() {
    const router = useRouter();
    const { userData } = useUser();
    const [activeTab, setActiveTab] = useState('To be done');

    // Mock data based on image_51089d.png
    const [taskList, setTaskList] = useState([
        {
            id: '1',
            date: '4/1/2026',
            title: 'User Testing Session',
            description: 'Conduct usability testing with 10 participants for the new feature',
            progress: 0.5,
            status: 'In Progress'
        },
        {
            id: '2',
            date: '6/1/2026',
            title: 'System Validation and Verification',
            description: 'Verify that system features function correctly according to requirements.',
            progress: 0.0,
            status: 'Not Yet Started'
        },
        {
            id: '3',
            date: '2/1/2026',
            title: 'Initial Requirement Gathering',
            description: 'Meeting with stakeholders to finalize the project scope.',
            progress: 1.0,
            status: 'Done'
        }
    ]);

    const displayedTasks = taskList.filter(task => {
        return activeTab === 'Done' ? task.status === 'Done' : task.status !== 'Done';
    });

    const updateTaskStatus = (taskId, newStatus) => {
        const performUpdate = () => {
            setTaskList(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, status: newStatus, progress: newStatus === 'Done' ? 1.0 : task.progress }
                    : task
            ));
        };

        if (newStatus === 'Done') {
            Alert.alert(
                "Finalize Task",
                "Once marked as Done, you cannot change the status again. Proceed?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Confirm", onPress: performUpdate, style: "destructive" }
                ]
            );
        } else {
            performUpdate();
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

    const handleStatusPress = (task) => {
        // On Android, we must limit to 3 options or use a different UI.
        // For now, let's use a cleaner Alert logic:
        Alert.alert(
            "Update Status",
            `Current: ${task.status}`,
            [
                {
                    text: "Not Yet Started",
                    onPress: () => updateTaskStatus(task.id, 'Not Yet Started')
                },
                {
                    text: "In Progress",
                    onPress: () => updateTaskStatus(task.id, 'In Progress')
                },
                {
                    text: "Mark as Done",
                    onPress: () => updateTaskStatus(task.id, 'Done'),
                    style: 'default'
                }
            ],
            { cancelable: true }
        );
    };

    const TaskCard = ({ item }) => {
        const isDone = item.status === 'Done';

        return (
            <View style={styles.card}>
                {/* Area 1: Navigation to Details (Top part of the card) */}
                <TouchableOpacity
                    onPress={() => router.push('/task-detail')}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardHeader}>
                        <Ionicons name="calendar-outline" size={18} color="#666" />
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>

                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>

                    <View style={styles.progressContainer}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressPercent}>{Math.round(item.progress * 100)}%</Text>
                    </View>

                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
                    </View>
                </TouchableOpacity>

                {/* Area 2: Status Picker (Independent from navigation touchable) */}
                <TouchableOpacity
                    style={[
                        styles.statusPicker,
                        { backgroundColor: getStatusColor(item.status) }
                    ]}
                    disabled={isDone}
                    onPress={() => handleStatusPress(item)}
                >
                    <Text style={styles.statusText}>{item.status}</Text>
                    {!isDone && <Ionicons name="chevron-down" size={20} color="#333" />}
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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {displayedTasks.length > 0 ? (
                    displayedTasks.map((task) => <TaskCard key={task.id} item={task} />)
                ) : (
                    <Text style={styles.emptyText}>No tasks found.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
    welcomeText: { fontSize: 22, color: '#333' },
    boldText: { fontWeight: 'bold' },
    tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#F5F9FF' },
    tabItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTabItem: { borderBottomWidth: 3, borderBottomColor: '#2F80ED' },
    tabText: { fontSize: 16, color: '#999', fontWeight: '500' },
    activeTabText: { color: '#2F80ED' },
    scrollContent: { padding: 20 },
    card: { backgroundColor: '#C8D9FF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dateText: { marginLeft: 6, color: '#666', fontSize: 14 },
    cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 10 },
    cardDescription: { fontSize: 15, color: '#333', lineHeight: 20, marginBottom: 15 },
    progressContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 14, color: '#666' },
    progressPercent: { fontSize: 14, color: '#666' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 20 },
    progressBarFill: { height: '100%', backgroundColor: '#27AE60', borderRadius: 3 },
    statusPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 15, borderWidth: 1, borderColor: '#333', alignSelf: 'flex-end', minWidth: '55%' },
    statusText: { fontSize: 16, fontWeight: '600', color: '#000' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});