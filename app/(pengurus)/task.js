import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../src/context/UserContext'; // Path to your context
import { useRouter } from 'expo-router';

export default function ReadOnlyTasksPage() {
    const router = useRouter();
    const { userData } = useUser();
    const [activeTab, setActiveTab] = useState('To be done');

    // Data remains the same, but we only "read" it
    const [taskList] = useState([
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Yet Started': return '#FFDCDC';
            case 'In Progress': return '#F5EFEB';
            case 'Done': return '#D5FFD6';
            default: return '#FFF';
        }
    };

    const TaskCard = ({ item }) => {
        return (
            <View style={styles.card}>
                {/* The entire card is now the navigation trigger since there are no inner buttons */}
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

                    {/* ALWAYS Static Progress Bar */}
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${item.progress * 100}%` }]} />
                    </View>

                    {/* Status Badge - Now a View instead of TouchableOpacity */}
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
    progressPercent: { fontSize: 14, color: '#666' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, marginBottom: 20 },
    progressBarFill: { height: '100%', backgroundColor: '#27AE60', borderRadius: 3 },
    statusBadge: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#333',
        alignSelf: 'flex-end'
    },
    statusText: { fontSize: 16, fontWeight: '600', color: '#000' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});