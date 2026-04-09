import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../src/context/UserContext';
import { useRouter } from 'expo-router'; 
import Slider from '@react-native-community/slider';

export default function TasksPage() {
    const router = useRouter();
    const { userData } = useUser();
    const [activeTab, setActiveTab] = useState('To be done');

    // Tracking which dropdowns are open for which specific task
    const [openStatusId, setOpenStatusId] = useState(null);
    //const [openProgressId, setOpenProgressId] = useState(null);

    const [taskList, setTaskList] = useState([
        { id: '1', date: '4/1/2026', title: 'User Testing Session', description: 'Conduct usability testing with 10 participants', progress: 0.5, status: 'In Progress' },
        { id: '2', date: '6/1/2026', title: 'System Validation', description: 'Verify that system features function correctly.', progress: 0.0, status: 'Not Yet Started' },
        { id: '3', date: '2/1/2026', title: 'Requirement Gathering', description: 'Meeting with stakeholders.', progress: 1.0, status: 'Done' }
    ]);

    const statusOptions = ['Not Yet Started', 'In Progress', 'Done'];
    const progressOptions = [0, 0.25, 0.5, 0.75, 1.0];

    const updateTask = (taskId, updates) => {
        setTaskList(prev => prev.map(task => {
            if (task.id === taskId) {
                let updatedTask = { ...task, ...updates };

                // Logic: If moving to Done, force progress to 100%
                if (updates.status === 'Done') {
                    updatedTask.progress = 1.0;
                }
                // Logic: If moving back to Not Yet Started, force progress to 0% (Optional but recommended)
                if (updates.status === 'Not Yet Started') {
                    updatedTask.progress = 0.0;
                }

                return updatedTask;
            }
            return task;
        }));
    };

    const handleStatusSelect = (taskId, newStatus) => {
        if (newStatus === 'Done') {
            Alert.alert("Finalize Task", "Once marked as Done, you cannot change the status. Proceed?", [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm", onPress: () => { updateTask(taskId, { status: newStatus }); setOpenStatusId(null); } }
            ]);
        } else {
            updateTask(taskId, { status: newStatus });
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

    const TaskCard = ({ item }) => {
        const isDone = item.status === 'Done';
        const isInProgress = item.status === 'In Progress';
        const isStatusOpen = openStatusId === item.id;

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => router.push('/task-detail')} activeOpacity={0.7}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="calendar-outline" size={18} color="#666" />
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
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
                                onSlidingComplete={(val) => updateTask(item.id, { progress: val })}
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
                        <Text style={styles.statusText}>{item.status}</Text>
                        {!isDone && <Ionicons name={isStatusOpen ? "chevron-up" : "chevron-down"} size={20} color="#333" />}
                    </TouchableOpacity>

                    {isStatusOpen && (
                        <View style={styles.inlineList}>
                            {statusOptions.map(opt => (
                                <TouchableOpacity key={opt} style={styles.inlineOption} onPress={() => handleStatusSelect(item.id, opt)}>
                                    <Text style={styles.optionText}>{opt}</Text>
                                    {item.status === opt && <Ionicons name="checkmark" size={16} color="#2F80ED" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

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
                {taskList.filter(t => activeTab === 'Done' ? t.status === 'Done' : t.status !== 'Done').map(task => <TaskCard key={task.id} item={task} />)}
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
    optionText: { fontSize: 14, color: '#333' }
});